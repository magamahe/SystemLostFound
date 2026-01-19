
import { openModal, closeModal } from './ui.js';
import { API_URL } from './api.js';

// Variables de estado del módulo
let allItems = [];
let usersList = [];

// ======================================================
// 🧱 CREADOR DE TARJETAS (CON ID DE USUARIO PARA ADMIN)
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
                <a href="https://wa.me/${item.phone.replace(/\D/g,'')}" target="_blank" title="Contactar por WhatsApp" class="bg-neonPurple/10 text-neonPurple text-center py-2 rounded-xl font-black text-[11px] hover:bg-neonPurple hover:text-black transition-colors">
                    WHATSAPP: ${item.phone}
                </a>
                <div class="flex justify-center gap-2">
                    ${currentUser?.role === "admin" && item.status === "pending" ? `
                        <button onclick="updateStatus('${item.id}', 'approved')" title="Aprobar publicación" class="bg-green-500 p-2 rounded-lg text-white hover:scale-110 transition-transform"><i class="fas fa-check"></i></button>
                        <button onclick="updateStatus('${item.id}', 'rejected')" title="Rechazar publicación" class="bg-orange-500 p-2 rounded-lg text-white hover:scale-110 transition-transform"><i class="fas fa-times"></i></button>
                    ` : ""}
                    ${canEdit || currentUser?.role === "admin" ? `
                        <button onclick="editItem('${item.id}')" title="Editar publicación" class="bg-blue-500/20 text-blue-500 p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteItem('${item.id}')" title="Eliminar publicación" class="bg-red-500/20 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"><i class="fas fa-trash"></i></button>
                    ` : ""}
                </div>
            </div>
        </div>
    `;
    return card;
}

// ======================================================
// 📡 CARGA DE DATOS
// ======================================================
export async function loadItems() {
    try {
        const res = await fetch(`${API_URL}/items`);
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        allItems = await res.json();
        return allItems;
    } catch (e) {
        console.error("🚨 El Backend está caído o inaccesible:", e);
        // Retornamos un array vacío para que la app siga funcionando aunque no haya datos
        allItems = []; 
        return [];
    }
}
// ======================================================
// 🧭 NAVEGACIÓN (TABS)
// ======================================================
export async function renderTab(tabName) {
    const container = document.getElementById("cards-container");
    if (!container) return;
    container.innerHTML = "";

    await loadItems();
    const currentUser = window.currentUser;

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
    tabs.forEach(t => {
        document.getElementById(`btn-tab-${t.id}`).onclick = () => renderTab(t.id);
    });

    const contentDiv = document.createElement("div");
    contentDiv.className = "col-span-full";
    container.appendChild(contentDiv);

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

        // --- VALIDACIÓN DE VACÍO ---
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <p class="text-gray-500 font-black uppercase italic text-xl tracking-widest opacity-50">
                        No hay publicaciones para mostrar
                    </p>
                    <span class="text-4xl mt-4 block">📦</span>
                </div>
            `;
            return;
        }

        filtered.forEach(item => grid.appendChild(createCard(item, false)));
    };

    document.getElementById("search-gen").oninput = update;
    document.getElementById("filter-type-gen").onchange = update;
    update();
}

// ======================================================
// 👤 GESTIÓN DE MIS ÍTEMS
// ======================================================
function renderMyItemsTab(parent) {
    // Creamos el contenedor del grid
    parent.innerHTML = `<div id="grid-my" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"></div>`;
    const grid = document.getElementById("grid-my");
    
    // Filtramos los items que pertenecen al usuario logueado
    const myFiltered = allItems.filter(i => i.userId === window.currentUser?.id);

    // Si no tiene publicaciones, mostramos el mensaje de vacío
    if (myFiltered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <p class="text-gray-500 font-black uppercase italic text-xl tracking-widest opacity-50">
                    Aún no has realizado ninguna publicación
                </p>
            </div>`;
        return;
    }

    // Si tiene, las renderizamos (pasamos 'true' porque el dueño SIEMPRE puede editar sus cosas)
    myFiltered.forEach(item => {
        grid.appendChild(createCard(item, true));
    });
}


// ======================================================
// 🛠️ GESTIÓN DE ANUNCIOS (ADMIN) 
// ======================================================
function renderAdminItemsTab(parent) {
    parent.innerHTML = `
        <div class="mb-8 flex flex-col md:flex-row gap-4">
            <h2 class="text-xl font-black dark:text-white uppercase italic">Moderación de Anuncios</h2>
        </div>
        <div id="grid-admin" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"></div>
    `;

    const grid = document.getElementById("grid-admin");
    
    // El Admin ve absolutamente todo, especialmente lo 'pending'
    const pendingItems = allItems.filter(i => i.status === "pending");
    const otherItems = allItems.filter(i => i.status !== "pending");

    if (allItems.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-10 text-gray-500">No hay anuncios en la base de datos.</p>`;
        return;
    }

    // Primero mostramos lo que requiere atención inmediata
    pendingItems.forEach(item => grid.appendChild(createCard(item, true)));
    otherItems.forEach(item => grid.appendChild(createCard(item, true)));
}

// Agregar también esta función para que los botones de la tarjeta funcionen
window.updateStatus = async (id, newStatus) => {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/items/${id}/status`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            await loadItems();
            renderTab("admin-items"); // Refrescar la pestaña de admin
        } else {
            alert("Error al actualizar el estado");
        }
    } catch (e) {
        console.error("Error en updateStatus:", e);
    }
};



// ======================================================
// 👥 GESTIÓN DE USUARIOS (VERSIÓN CON ESTADÍSTICAS Y TOTALES)
// ======================================================
async function renderAdminUsersTab(parent) {
    const token = localStorage.getItem("token");
    parent.innerHTML = `<div class="py-20 text-center text-gray-500 animate-pulse font-black uppercase italic">Conectando con la base de datos...</div>`;

    try {
        const res = await fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
        usersList = await res.json();

        parent.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 py-8">
                <h2 class="text-2xl font-black dark:text-white uppercase italic mb-8 flex items-center">
                    <i class="fas fa-user-shield mr-3 text-neonPurple"></i> Control de Usuarios
                </h2>
                <div class="mb-6">
                    <input type="text" id="user-search" placeholder="Buscar por Cód. Cliente o Nombre..." 
                           class="w-full md:w-1/3 p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border border-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-neonPurple/50 transition-all font-medium">
                </div>
                <div class="overflow-hidden rounded-3xl border border-gray-700 bg-white dark:bg-darkCard shadow-xl">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-gray-800 text-gray-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                <tr>
                                    <th class="p-5">Cód. Cliente</th>
                                    <th class="p-5">Username</th>
                                    <th class="p-5">Actividad</th>
                                    <th class="p-5">Estado</th>
                                    <th class="p-5 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="users-tbody" class="divide-y divide-gray-100 dark:divide-gray-800"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        document.getElementById("user-search").oninput = () => updateUsersTable();
        updateUsersTable();
    } catch (error) {
        parent.innerHTML = `<div class="py-20 text-center text-red-500 font-black">Error al conectar con el servidor</div>`;
    }
}

function updateUsersTable() {
    const tbody = document.getElementById("users-tbody");
    if (!tbody) return;

    const term = document.getElementById("user-search").value.trim().toLowerCase();
    const filtered = usersList.filter(u => u.role !== 'admin' && (String(u.id).toLowerCase().includes(term) || u.username.toLowerCase().includes(term)));

    // Inicializamos todos los contadores globales
    let globalStats = { total: 0, lost: 0, found: 0, pending: 0, approved: 0, rejected: 0 };

    tbody.innerHTML = filtered.map(u => {
        const userItems = allItems.filter(item => item.userId === u.id);
        const s = {
            total: userItems.length,
            lost: userItems.filter(i => i.type === 'lost').length,
            found: userItems.filter(i => i.type === 'found').length,
            pending: userItems.filter(i => i.status === 'pending').length,
            approved: userItems.filter(i => i.status === 'approved').length,
            rejected: userItems.filter(i => i.status === 'rejected').length
        };

        // Sumar al contador global
        Object.keys(globalStats).forEach(k => globalStats[k] += s[k]);

        return `
        <tr class="hover:bg-gray-800/20 transition-colors border-b border-gray-800/50">
            <td class="p-4 text-gray-500 font-mono text-[15px] font-bold uppercase whitespace-nowrap">#${u.id}</td>
            <td class="p-4 dark:text-white font-black uppercase text-xs italic tracking-wide">${u.username}</td>
            <td class="p-4">
                <div class="flex items-center gap-2">
                    <span title="Total de publicaciones de este usuario" class="px-2 py-0.5 rounded bg-gray-700 text-white text-[11px] font-black cursor-help">${s.total}</span>
                    <div class="flex items-center gap-1 bg-black/20 p-1 rounded-full px-2">
                        <span title="Perdidos" class="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold cursor-help">${s.lost}</span>
                        <span title="Encontrados" class="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white text-[9px] font-bold cursor-help">${s.found}</span>
                    </div>
                    <div class="flex items-center gap-1 bg-black/20 p-1 rounded-full px-2">
                        <span title="Pendientes" class="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-500 text-black text-[9px] font-bold cursor-help">${s.pending}</span>
                        <span title="Aprobados" class="w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white text-[9px] font-bold cursor-help">${s.approved}</span>
                        <span title="Rechazados" class="w-5 h-5 flex items-center justify-center rounded-full bg-orange-600 text-white text-[9px] font-bold cursor-help">${s.rejected}</span>
                    </div>
                </div>
            </td>
            <td class="p-4">
                <span class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${u.isBanned ? "bg-red-500 text-white" : "bg-green-500/20 text-green-400"}">
                    ${u.isBanned ? "Suspendido" : "Activo"}
                </span>
            </td>
            <td class="p-4 text-center">
                <div class="flex justify-center gap-2">
                    <button onclick="toggleBan('${u.id}')" title="${u.isBanned ? 'Reactivar usuario' : 'Suspender usuario'}"
                            class="w-8 h-8 flex items-center justify-center rounded-lg transition-all ${u.isBanned ? "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white" : "bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white"}">
                        <i class="fas ${u.isBanned ? "fa-user-check" : "fa-user-slash"} text-xs"></i>
                    </button>
                    <button onclick="deleteUser('${u.id}')" title="Eliminar definitivamente" class="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("") + `
        <tr class="bg-gray-900/80 font-black border-t-2 border-neonPurple/50">
            <td class="p-5 text-[10px] text-neonPurple uppercase tracking-[0.2em] text-center" colspan="2">Métricas Globales de Red</td>
            <td class="p-5" colspan="3">
                <div class="flex flex-wrap items-center gap-6">
                    <div class="flex flex-col" title="Total Histórico"><span class="text-white text-xl">${globalStats.total}</span><span class="text-[8px] text-gray-500 uppercase">Avisos</span></div>
                    <div class="h-8 w-[1px] bg-gray-700 mx-2"></div>
                    <div class="flex flex-col" title="Total Perdidos"><span class="text-red-500 text-xl">${globalStats.lost}</span><span class="text-[8px] text-gray-500 uppercase font-bold">Perdidos</span></div>
                    <div class="flex flex-col" title="Total Encontrados"><span class="text-green-500 text-xl">${globalStats.found}</span><span class="text-[8px] text-gray-500 uppercase font-bold">Hallados</span></div>
                    <div class="h-8 w-[1px] bg-gray-700 mx-2"></div>
                    <div class="flex flex-col" title="Total Pendientes"><span class="text-yellow-500 text-xl">${globalStats.pending}</span><span class="text-[8px] text-gray-500 uppercase font-bold">Pendientes</span></div>
                    <div class="flex flex-col" title="Total Aprobados"><span class="text-blue-500 text-xl">${globalStats.approved}</span><span class="text-[8px] text-gray-500 uppercase font-bold">Aprobados</span></div>
                    <div class="flex flex-col" title="Total Rechazados"><span class="text-orange-600 text-xl">${globalStats.rejected}</span><span class="text-[8px] text-gray-500 uppercase font-bold">Rechazados</span></div>
                </div>
            </td>
        </tr>`;
}
// ======================================================
// ⚡ ACCIONES GLOBALES ACTUALIZADAS
// ======================================================
window.deleteUser = async (id) => {
    // 1. Confirmación de seguridad
    if (!confirm("¿Estás seguro de eliminar este usuario definitivamente? Esta acción no se puede deshacer.")) return;

    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: "DELETE",
            headers: { 
                "Authorization": `Bearer ${token}` 
            }
        });

        if (res.ok) {
            // 2. Actualizar la lista local quitando al usuario
            usersList = usersList.filter(u => u.id !== id);
            // 3. Refrescar la tabla automáticamente
            updateUsersTable();
            alert("Usuario eliminado correctamente.");
        } else {
            const errorData = await res.json();
            alert("Error al eliminar: " + (errorData.message || "No autorizado"));
        }
    } catch (e) {
        console.error("Error en deleteUser:", e);
        alert("No se pudo conectar con el servidor para eliminar al usuario.");
    }
};

// Asegúrate de tener también esta para el botón de ban
window.toggleBan = async (id) => {
    const user = usersList.find(u => u.id === id);
    if (!user) return;
    
    const accion = user.isBanned ? "REACTIVAR" : "SUSPENDER";
    if (!confirm(`¿Realmente desea ${accion} al usuario ${user.username}?`)) return;
    
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
    } catch (error) {
        console.error("Error en toggleBan:", error);
    }
};
// ======================================================
// --- MOSTRAR FORMULARIO DE AÑADIR ÍTEM ---
// ======================================================
export function showAddForm() {
    const token = localStorage.getItem("token");
    openModal();
    document.getElementById("modal-body").innerHTML = `
        <h2 class="text-2xl font-black dark:text-white mb-6 uppercase italic">Nueva Publicación</h2>
        <form id="add-form" class="space-y-4">
            <input type="text" id="add-title" placeholder="Título del objeto" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            <div class="grid grid-cols-2 gap-4">
                <select id="add-type" class="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none">
                    <option value="lost">Lo perdí</option>
                    <option value="found">Lo encontré</option>
                </select>
                <input type="text" id="add-phone" placeholder="WhatsApp contacto" class="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            </div>
            <textarea id="add-desc" placeholder="Detalles (color, zona, fecha...)" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white h-24 outline-none" required></textarea>
            
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-500 uppercase ml-2">Subir Foto (Opcional)</label>
                <input type="file" id="add-image" class="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-neonPurple file:text-black hover:file:bg-opacity-80">
            </div>

            <button type="submit" class="w-full bg-neonPurple text-black font-black p-4 rounded-2xl uppercase shadow-lg hover:scale-[1.02] transition-transform">Publicar anuncio</button>
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
            alert("¡Publicado! Esperando aprobación.");
            location.reload();
        }
    };
}

// ======================================================
// ⚡ ACCIONES GLOBALES (VINCULADAS A WINDOW)
// ======================================================

window.editItem = async (id) => {
    // 1. Buscamos el ítem en la lista local cargada
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    // 2. Abrimos el modal y cargamos el formulario con los datos actuales
    openModal();
    document.getElementById("modal-body").innerHTML = `
        <h2 class="text-2xl font-black dark:text-white mb-6 uppercase italic">Editar Publicación</h2>
        <form id="edit-form" class="space-y-4">
            <input type="text" id="edit-title" value="${item.title}" placeholder="Título" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            
            <div class="grid grid-cols-2 gap-4">
                <select id="edit-type" class="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none">
                    <option value="lost" ${item.type === 'lost' ? 'selected' : ''}>Lo perdí</option>
                    <option value="found" ${item.type === 'found' ? 'selected' : ''}>Lo encontré</option>
                </select>
                <input type="text" id="edit-phone" value="${item.phone}" placeholder="WhatsApp" class="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            </div>

            <textarea id="edit-desc" placeholder="Detalles" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white h-24 outline-none" required>${item.description}</textarea>
            
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-500 uppercase ml-2">Cambiar Foto (Opcional)</label>
                <input type="file" id="edit-image" class="w-full text-xs text-gray-500">
            </div>

            <button type="submit" class="w-full bg-blue-600 text-white font-black p-4 rounded-2xl uppercase shadow-lg hover:bg-blue-700 transition-colors">Guardar Cambios</button>
        </form>
    `;

    // 3. Manejador del envío del formulario
    document.getElementById("edit-form").onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        
        const fd = new FormData();
        fd.append("title", document.getElementById("edit-title").value);
        fd.append("description", document.getElementById("edit-desc").value);
        fd.append("type", document.getElementById("edit-type").value);
        fd.append("phone", document.getElementById("edit-phone").value);
        
        const imgFile = document.getElementById("edit-image").files[0];
        if (imgFile) fd.append("image", imgFile);

        try {
            const res = await fetch(`${API_URL}/items/${id}`, {
                method: "PUT", // Usamos PUT según tu controlador
                headers: { 
                    "Authorization": `Bearer ${token}` 
                },
                body: fd
            });

            if (res.ok) {
                closeModal();
                // Recargamos los items y la pestaña actual
                await loadItems();
                const currentTab = document.querySelector('[id^="btn-tab-"].text-neonPurple')?.id.replace('btn-tab-', '') || 'general';
                renderTab(currentTab);
            } else {
                alert("Error al actualizar la publicación");
            }
        } catch (error) {
            console.error("Error editando item:", error);
        }
    };
};

// ======================================================
// ⚡ ELIMINAR ANUNCIO (GLOBAL)
// ======================================================
window.deleteItem = async (id) => {
    // 1. Confirmación
    if (!confirm("¿Estás seguro de que deseas eliminar esta publicación?")) return;

    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/items/${id}`, {
            method: "DELETE",
            headers: { 
                "Authorization": `Bearer ${token}` 
            }
        });

        if (res.ok) {
            // 2. Volver a cargar los datos del servidor
            await loadItems();
            
            // 3. Detectar en qué pestaña estamos para refrescar la vista actual
            const activeTabButton = document.querySelector('[id^="btn-tab-"].text-neonPurple');
            const currentTab = activeTabButton ? activeTabButton.id.replace('btn-tab-', '') : 'general';
            
            renderTab(currentTab);
        } else {
            const errorData = await res.json();
            alert("Error: " + (errorData.message || "No se pudo eliminar"));
        }
    } catch (e) {
        console.error("Error en deleteItem:", e);
        alert("Error de conexión con el servidor");
    }
};