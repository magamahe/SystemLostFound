import { openModal, closeModal } from './ui.js';
import { API_URL } from './api.js';

// Variables de estado del módulo
let allItems = [];
let usersList = [];

// ======================================================
// 🧱 CREADOR DE TARJETAS
// ======================================================
export function createCard(item, canEdit) {
    const currentUser = window.currentUser;
    const card = document.createElement("article");
    card.className = "relative bg-white dark:bg-darkCard rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col group transition-all h-full";

    const fecha = item.createdAt ? new Date(item.createdAt).toLocaleDateString("es-AR") : "---";
    const imageUrl = item.image 
        ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`) 
        : "";

    const statusLabels = {
        pending: '<span class="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-[8px] font-bold uppercase">Pendiente</span>',
        approved: '<span class="bg-green-500/20 text-green-500 px-2 py-0.5 rounded text-[8px] font-bold uppercase">Aprobado</span>',
        rejected: '<span class="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-[8px] font-bold uppercase">Rechazado</span>',
    };

    card.innerHTML = `
        <div class="absolute top-0 right-0 z-20 overflow-hidden w-28 h-28 pointer-events-none">
            <div class="${item.type === "lost" ? "bg-red-600" : "bg-green-600"} text-white text-[10px] font-black text-center py-1 absolute top-4 -right-8 w-32 rotate-45 uppercase">
                ${item.type === "lost" ? "Buscado" : "Encontrado"}
            </div>
        </div>
        <div class="relative h-48 w-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
            ${imageUrl ? `<img src="${imageUrl}" class="w-full h-full object-cover">` : `<i class="fas fa-box-open fa-3x text-gray-700/50"></i>`}
            
            ${currentUser?.role === "admin" ? `
                <div class="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] font-mono px-2 py-1 rounded-md border border-white/20 backdrop-blur-sm" title="ID del usuario que publicó">
                    USER ID: #${item.userId}
                </div>
            ` : ""}
        </div>
        <div class="p-5 flex-1 flex flex-col">
            <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] text-gray-400 font-bold uppercase"><i class="far fa-calendar-alt mr-1"></i> ${fecha}</span>
                ${statusLabels[item.status] || ''}
            </div>
            <h3 class="text-lg font-black dark:text-white uppercase mb-2">${item.title}</h3>
            <p class="text-[12px] text-gray-300 italic mb-4 line-clamp-2">${item.description}</p>
            
            <div class="mt-auto flex flex-col gap-2">
                <a href="https://wa.me/${item.phone.replace(/\D/g,'')}" target="_blank" class="bg-neonPurple/10 text-neonPurple text-center py-2 rounded-xl font-black text-[11px] hover:bg-neonPurple hover:text-black transition-colors">
                    WHATSAPP: ${item.phone}
                </a>
                <div class="flex justify-center gap-2">
                    ${currentUser?.role === "admin" && item.status === "pending" ? `
                        <button onclick="updateStatus('${item.id}', 'approved')" class="bg-green-500 p-2 rounded-lg text-white hover:scale-110 transition-transform"><i class="fas fa-check"></i></button>
                        <button onclick="updateStatus('${item.id}', 'rejected')" class="bg-orange-500 p-2 rounded-lg text-white hover:scale-110 transition-transform"><i class="fas fa-times"></i></button>
                    ` : ""}
                    ${canEdit || currentUser?.role === "admin" ? `
                        <button onclick="editItem('${item.id}')" class="bg-blue-500/20 text-blue-500 p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteItem('${item.id}')" class="bg-red-500/20 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"><i class="fas fa-trash"></i></button>
                    ` : ""}
                </div>
            </div>
        </div>
    `;
    return card;
}

// ======================================================
// 📡 CARGA DE DATOS (CON CACHÉ PARA EVITAR LAG)
// ======================================================
export async function loadItems(forceRefresh = false) {
    // Si ya tenemos datos y no forzamos recarga, los devolvemos al toque
    if (allItems.length > 0 && !forceRefresh) return allItems;

    try {
        const res = await fetch(`${API_URL}/items`);
        if (!res.ok) throw new Error("Error en servidor");
        allItems = await res.json();
        return allItems;
    } catch (e) {
        console.error("🚨 Error cargando items:", e);
        return allItems || []; 
    }
}

// ======================================================
// 🧭 NAVEGACIÓN (OPTIMIZADA)
// ======================================================
export async function renderTab(tabName) {
    const container = document.getElementById("cards-container");
    if (!container) return;

    // 1. Renderizar Estructura (Tabs) INMEDIATAMENTE
    const currentUser = window.currentUser;
    container.innerHTML = "";

    const tabsNav = document.createElement("div");
    tabsNav.className = "col-span-full flex border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto gap-8";

    let tabs = [{ id: "general", label: "TABLÓN GENERAL", icon: "fa-globe" }];
    if (currentUser) {
        if (currentUser.role === "admin") {
            tabs.push({ id: "admin-items", label: "GESTIÓN ANUNCIOS", icon: "fa-tasks" });
            tabs.push({ id: "admin-users", label: "USUARIOS", icon: "fa-users" });
        } else {
            tabs.push({ id: "my-items", label: "MIS ANUNCIOS", icon: "fa-user" });
        }
    }

    tabsNav.innerHTML = tabs.map(t => `
        <button id="btn-tab-${t.id}" class="pb-4 px-4 text-sm md:text-base font-bold uppercase tracking-wide transition-all whitespace-nowrap ${tabName === t.id ? "text-neonPurple border-b-4 border-neonPurple" : "text-gray-400 hover:text-white"}">
            <i class="fas ${t.icon} mr-2"></i>${t.label}
        </button>
    `).join("");

    container.appendChild(tabsNav);
    
    // Asignar eventos de clic
    tabs.forEach(t => {
        document.getElementById(`btn-tab-${t.id}`).onclick = () => renderTab(t.id);
    });

    // 2. Crear zona de contenido con Skeleton Loader
    const contentDiv = document.createElement("div");
    contentDiv.className = "col-span-full";
    contentDiv.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        ${Array(4).fill('<div class="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>').join('')}
    </div>`;
    container.appendChild(contentDiv);

    // 3. Cargar datos en background (aquí es donde evitamos el Violation)
    await loadItems();
    
    // 4. Renderizar el contenido real según la pestaña
    if (tabName === "general") renderGeneralTab(contentDiv);
    else if (tabName === "my-items") renderMyItemsTab(contentDiv);
    else if (tabName === "admin-items") renderAdminItemsTab(contentDiv);
    else if (tabName === "admin-users") renderAdminUsersTab(contentDiv);
}

// ======================================================
// 🧩 RENDERS DE CONTENIDO
// ======================================================

function renderGeneralTab(parent) {
    parent.innerHTML = `
        <div class="flex flex-col md:flex-row gap-4 mb-8">
            <input type="text" id="search-gen" placeholder="Buscar por título o descripción..." class="flex-1 p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 outline-none">
            <select id="filter-type-gen" class="p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 outline-none">
                <option value="all">🌍 Todos</option>
                <option value="lost">🚩 Buscados</option>
                <option value="found">✅ Encontrados</option>
            </select>
        </div>
        <div id="grid-gen" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"></div>
    `;

    const update = () => {
        const grid = document.getElementById("grid-gen");
        const term = document.getElementById("search-gen").value.toLowerCase();
        const typeFilter = document.getElementById("filter-type-gen").value;
        grid.innerHTML = "";

        const filtered = allItems.filter(i => 
            i.status === "approved" && 
            (i.title.toLowerCase().includes(term) || i.description.toLowerCase().includes(term)) && 
            (typeFilter === "all" || i.type === typeFilter)
        );

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="col-span-full py-20 text-center opacity-50 uppercase font-black">No hay resultados</div>`;
            return;
        }
        filtered.forEach(item => grid.appendChild(createCard(item, false)));
    };

    document.getElementById("search-gen").oninput = update;
    document.getElementById("filter-type-gen").onchange = update;
    update();
}

function renderMyItemsTab(parent) {
    parent.innerHTML = `<div id="grid-my" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"></div>`;
    const grid = document.getElementById("grid-my");
    const myFiltered = allItems.filter(i => i.userId === window.currentUser?.id);

    if (myFiltered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-20 text-center opacity-50 uppercase font-black">No tienes publicaciones aún</div>`;
        return;
    }
    myFiltered.forEach(item => grid.appendChild(createCard(item, true)));
}

function renderAdminItemsTab(parent) {
    parent.innerHTML = `<div id="grid-admin" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"></div>`;
    const grid = document.getElementById("grid-admin");
    
    // Ordenar: Pendientes primero
    const sorted = [...allItems].sort((a, b) => (a.status === 'pending' ? -1 : 1));

    if (sorted.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-10">Sin anuncios en la base de datos.</p>`;
        return;
    }
    sorted.forEach(item => grid.appendChild(createCard(item, true)));
}

// ======================================================
// 👥 GESTIÓN DE USUARIOS
// ======================================================
async function renderAdminUsersTab(parent) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
        usersList = await res.json();

        parent.innerHTML = `
            <div class="max-w-7xl mx-auto py-4">
                <div class="mb-6 flex justify-between items-center">
                    <input type="text" id="user-search" placeholder="Buscar por Cód. Cliente o Nombre..." 
                           class="w-full md:w-1/3 p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border border-gray-700 outline-none">
                </div>
                <div class="overflow-x-auto rounded-3xl border border-gray-700">
                    <table class="w-full text-left bg-darkCard">
                        <thead class="bg-gray-800 text-gray-400 text-[10px] uppercase">
                            <tr>
                                <th class="p-5">Cód. Cliente</th>
                                <th class="p-5">Username</th>
                                <th class="p-5">Actividad</th>
                                <th class="p-5">Estado</th>
                                <th class="p-5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="users-tbody" class="divide-y divide-gray-800"></tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById("user-search").oninput = () => updateUsersTable();
        updateUsersTable();
    } catch (error) {
        parent.innerHTML = `<div class="text-red-500 text-center py-10">Error de conexión</div>`;
    }
}

function updateUsersTable() {
    const tbody = document.getElementById("users-tbody");
    if (!tbody) return;

    const term = document.getElementById("user-search").value.trim().toLowerCase();
    const filtered = usersList.filter(u => u.role !== 'admin' && (String(u.id).toLowerCase().includes(term) || u.username.toLowerCase().includes(term)));

    tbody.innerHTML = filtered.map(u => {
        const userItems = allItems.filter(item => item.userId === u.id);
        const stats = {
            total: userItems.length,
            pending: userItems.filter(i => i.status === 'pending').length
        };

        return `
        <tr class="hover:bg-gray-800/20 transition-colors">
            <td class="p-4 font-mono text-neonPurple font-bold">#${u.id}</td>
            <td class="p-4 dark:text-white uppercase text-xs font-black italic">${u.username}</td>
            <td class="p-4">
                <span class="px-2 py-1 bg-gray-700 rounded text-[10px] font-bold text-white">AVISOS: ${stats.total}</span>
                ${stats.pending > 0 ? `<span class="ml-2 px-2 py-1 bg-yellow-500 rounded text-[10px] font-bold text-black">! ${stats.pending} PEND.</span>` : ''}
            </td>
            <td class="p-4 text-[10px] font-black uppercase">
                <span class="${u.isBanned ? "text-red-500" : "text-green-500"}">${u.isBanned ? "Suspendido" : "Activo"}</span>
            </td>
            <td class="p-4">
                <div class="flex justify-center gap-2">
                    <button onclick="toggleBan('${u.id}')" class="p-2 rounded bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all">
                        <i class="fas ${u.isBanned ? "fa-user-check" : "fa-user-slash"}"></i>
                    </button>
                    <button onclick="deleteUser('${u.id}')" class="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

// ======================================================
// ⚡ ACCIONES GLOBALES (ASIGNADAS A WINDOW)
// ======================================================

window.updateStatus = async (id, newStatus) => {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/items/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            await loadItems(true); // Forzar refresco
            renderTab("admin-items");
        }
    } catch (e) { console.error(e); }
};

window.toggleBan = async (id) => {
    const user = usersList.find(u => u.id === id);
    if (!user || !confirm(`¿Cambiar estado de suspensión para ${user.username}?`)) return;
    
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/users/${id}/ban`, { 
            method: "PATCH", 
            headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) { 
            user.isBanned = !user.isBanned; 
            updateUsersTable(); 
        }
    } catch (e) { console.error(e); }
};

window.deleteItem = async (id) => {
    if (!confirm("¿Eliminar publicación?")) return;
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/items/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            await loadItems(true);
            const activeTab = document.querySelector('[id^="btn-tab-"].text-neonPurple')?.id.replace('btn-tab-', '') || 'general';
            renderTab(activeTab);
        }
    } catch (e) { console.error(e); }
};

export function showAddForm() {
    const token = localStorage.getItem("token");
    openModal();
    document.getElementById("modal-body").innerHTML = `
        <h2 class="text-2xl font-black dark:text-white mb-6 uppercase italic">Nueva Publicación</h2>
        <form id="add-form" class="space-y-4">
            <input type="text" id="add-title" placeholder="Título" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            <div class="grid grid-cols-2 gap-4">
                <select id="add-type" class="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none">
                    <option value="lost">Lo perdí</option>
                    <option value="found">Lo encontré</option>
                </select>
                <input type="text" id="add-phone" placeholder="WhatsApp" class="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            </div>
            <textarea id="add-desc" placeholder="Detalles..." class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white h-24 outline-none" required></textarea>
            <input type="file" id="add-image" class="w-full text-xs">
            <button type="submit" class="w-full bg-neonPurple text-black font-black p-4 rounded-2xl uppercase">Publicar</button>
        </form>
    `;

    document.getElementById("add-form").onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("title", document.getElementById("add-title").value);
        fd.append("description", document.getElementById("add-desc").value);
        fd.append("type", document.getElementById("add-type").value);
        fd.append("phone", document.getElementById("add-phone").value);
        const img = document.getElementById("add-image").files[0];
        if (img) fd.append("image", img);

        const res = await fetch(`${API_URL}/items`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
        });
        if (res.ok) {
            alert("¡Publicado! Pendiente de revisión.");
            closeModal();
            await loadItems(true);
            renderTab("my-items");
        }
    };
}