// ======================================================
// 🌐 CONFIGURACIÓN DE API
// ======================================================
const API_URL = "http://localhost:3000";

// ======================================================
// 🧠 ESTADO GLOBAL
// ======================================================
let currentUser = JSON.parse(localStorage.getItem("user")) || null;
let token = localStorage.getItem("token") || null;
let allItems = [];

// ======================================================
// 🚀 INICIO DE LA APP
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

// ======================================================
// 🛠️ FUNCIÓN PRINCIPAL
// ======================================================
async function initApp() {
  const htmlElement = document.documentElement;

  if (localStorage.getItem("theme") === "light") {
    htmlElement.classList.remove("dark");
  } else {
    htmlElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }

  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    htmlElement.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      htmlElement.classList.contains("dark") ? "dark" : "light"
    );
  });

  document.getElementById("close-modal").onclick = closeModal;

  await loadItems();
  renderTab("general");
  updateNavbar();
  renderFloatingButton();
}

// ======================================================
// 🧭 NAVEGACIÓN POR TABS
// ======================================================
function renderTab(tabName) {
  const container = document.getElementById("cards-container");
  if (!container) return;
  container.innerHTML = "";

  const tabsNav = document.createElement("div");
  tabsNav.className =
    "col-span-full flex border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto gap-8";

  let tabs = [{ id: "general", label: "TABLÓN GENERAL", icon: "fa-globe" }];

  if (currentUser) {
    if (currentUser.role === "admin") {
      tabs.push({
        id: "admin-items",
        label: "GESTIÓN ANUNCIOS",
        icon: "fa-tasks",
      });
      tabs.push({ id: "admin-users", label: "USUARIOS", icon: "fa-users" });
    } else {
      tabs.push({ id: "my-items", label: "MIS ANUNCIOS", icon: "fa-user" });
    }
  }

  // Busca esta parte en tu renderTab y reemplázala:
  tabsNav.innerHTML = tabs
    .map(
      (t) => `
        <button onclick="renderTab('${t.id}')" 
            class="pb-4 px-4 text-sm md:text-base font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
              tabName === t.id
                ? "text-neonPurple border-b-4 border-neonPurple"
                : "text-gray-400 hover:text-white"
            }">
            <i class="fas ${t.icon} mr-2"></i>${t.label}
        </button>
    `
    )
    .join("");

  container.appendChild(tabsNav);
  const contentDiv = document.createElement("div");
  contentDiv.className = "col-span-full";
  container.appendChild(contentDiv);

  if (tabName === "general") renderGeneralTab(contentDiv);
  else if (tabName === "my-items") renderMyItemsTab(contentDiv);
  else if (tabName === "admin-items") renderAdminItemsTab(contentDiv);
  else if (tabName === "admin-users") renderAdminUsersTab(contentDiv);
}

// ======================================================
// 🧩 TAB GENERAL
// ======================================================
function renderGeneralTab(parent) {
  parent.innerHTML = `
        <div class="flex flex-col md:flex-row gap-4 mb-8">
            <input type="text" id="search-gen" placeholder="Buscar por título o descripción..." 
                   class="flex-1 p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 outline-none">
            
            <select id="filter-type-gen" class="p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 outline-none cursor-pointer">
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

    const filtered = allItems.filter((item) => {
      // Condición 1: El anuncio debe estar aprobado
      const isApproved = item.status === "approved";

      // Condición 2: El texto debe coincidir con título O descripción
      const matchesText =
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term);

      // Condición 3: El tipo debe coincidir con el selector
      const matchesType = typeFilter === "all" || item.type === typeFilter;

      return isApproved && matchesText && matchesType;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<p class="col-span-full text-center py-20 text-gray-500 font-bold uppercase italic">No se encontraron anuncios con esos filtros.</p>`;
    } else {
      filtered.forEach((item) => grid.appendChild(createCard(item, false)));
    }
  };

  // Escuchar cambios en ambos inputs
  document.getElementById("search-gen").oninput = update;
  document.getElementById("filter-type-gen").onchange = update;

  update(); // Carga inicial
}

function renderMyItemsTab(parent) {
  parent.innerHTML = `
        <div class="max-w-6xl mx-auto">
            <h2 class="text-2xl font-black dark:text-white uppercase italic mb-8">Mis Publicaciones</h2>
            <div id="grid-my" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch"></div>
        </div>
    `;
  const grid = document.getElementById("grid-my");
  const filtered = allItems.filter((i) => i.userId === currentUser?.id);

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="col-span-full text-center py-20 text-gray-500 font-bold uppercase italic">Todavía no has publicado ningún anuncio.</p>`;
  } else {
    // Ordenamos por fecha para que lo último aparezca primero
    filtered
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((item) => grid.appendChild(createCard(item, true)));
  }
}

function renderAdminItemsTab(parent) {
  parent.innerHTML = `
<div class="max-w-6xl mx-auto mb-8">
  <div class="flex flex-col gap-2">
    <h2 class="text-xl font-black dark:text-white uppercase italic text-neonPurple">Moderación de Anuncios</h2>
    <select id="admin-filter-status" class="inline-block w-min p-2 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 outline-none cursor-pointer font-bold">
  <option value="pending">⏳ Pendientes</option>
  <option value="approved">✅ Aprobados</option>
  <option value="rejected">❌ Rechazados</option>
</select>

  </div>
  <div id="grid-admin" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch mt-4"></div>
</div>

    `;
  const update = () => {
    const grid = document.getElementById("grid-admin");
    const status = document.getElementById("admin-filter-status").value;
    grid.innerHTML = "";

    const filtered = allItems.filter((i) => i.status === status);

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <p class="text-gray-500 font-bold uppercase italic text-sm">No hay anuncios con estado: ${status}</p>
                        </div>`;
    } else {
      filtered
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((item) => grid.appendChild(createCard(item, true)));
    }
  };
  document.getElementById("admin-filter-status").onchange = update;
  update();
}

// ======================================================
// 🧱 CREADOR DE TARJETAS
// ======================================================
function createCard(item, canEdit) {
  const card = document.createElement("article");
  // h-full permite que la tarjeta ocupe todo el alto de la fila del grid
  card.className =
    "relative bg-white dark:bg-darkCard rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col group transition-all h-full";

  // --- 1. PROCESAR FECHA ---
  const fecha = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "---";

  const imageUrl = item.image ? `${API_URL}${item.image}` : "";

  // Estilos de la barra de estado
  const statusLabels = {
    pending:
      '<span class="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-[8px] font-bold uppercase">Pendiente</span>',
    approved:
      '<span class="bg-green-500/20 text-green-500 px-2 py-0.5 rounded text-[8px] font-bold uppercase">Aprobado</span>',
    rejected:
      '<span class="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-[8px] font-bold uppercase">Rechazado</span>',
  };
card.innerHTML = `
    <div class="absolute top-0 right-0 z-20 overflow-hidden w-28 h-28 pointer-events-none">
        <div class="${item.type === "lost" ? "bg-red-600" : "bg-green-600"} 
            text-white text-[10px] font-black text-center py-1 absolute top-4 -right-8 w-32 rotate-45 shadow-xl border-b border-white/20 uppercase tracking-tighter">
            ${item.type === "lost" ? "Buscado" : "Encontrado"}
        </div>
    </div>

    <div class="relative h-48 w-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden border-b border-gray-100 dark:border-gray-800">
        ${imageUrl
            ? `<img src="${imageUrl}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" alt="${item.title}" loading="lazy">`
            : `<i class="fas fa-box-open fa-3x text-gray-700/50"></i>`
        }
    </div>

    <div class="p-5 flex-1 flex flex-col">
        
        <div class="flex justify-between items-center mb-3">
            <div class="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <i class="far fa-calendar-alt mr-1 text-neonPurple"></i> ${fecha}
            </div>
            <div class="shrink-0 scale-90 origin-right">
                ${statusLabels[item.status]}
            </div>
        </div>

        <div class="flex-1 flex flex-col justify-center min-h-[110px]">
            <h3 class="text-lg font-black dark:text-white uppercase tracking-tighter leading-tight mb-2">
                ${item.title}
            </h3>

            <div class="h-16 overflow-y-auto custom-scrollbar">
                <p class="text-[12px] text-gray-300 italic leading-relaxed pr-2">
                    ${item.description}
                </p>
            </div>
        </div>
        
        ${currentUser?.role === "admin"
            ? `<div class="bg-neonPurple/5 rounded-lg p-2 border-l-2 border-neonPurple my-3">
                <p class="text-[9px] text-neonPurple font-black uppercase italic">ID Propietario: ${item.userId}</p>
               </div>`
            : ""
        }

        <div class="mt-auto pt-4 border-t border-gray-500/10 flex flex-col gap-3">
            
            <div class="flex justify-center w-full">
                <a href="https://wa.me/${item.phone.replace(/\D/g,'')}" target="_blank" 
                   class="flex items-center justify-center gap-2 px-6 py-2 bg-neonPurple/10 hover:bg-neonPurple/20 text-neonPurple rounded-xl transition-all active:scale-95 group w-full max-w-[180px]">
                    <i class="fas fa-phone-alt text-xs group-hover:rotate-12 transition-transform"></i>
                    <span class="font-black text-[11px] tracking-tight">${item.phone}</span>
                </a>
            </div>
            
            <div class="flex justify-center gap-2">
                ${currentUser?.role === "admin" && item.status === "pending"
                    ? `
                     <button onclick="updateStatus('${item.id}', 'approved')" class="w-9 h-9 flex items-center justify-center bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all active:scale-90" title="Aprobar"><i class="fas fa-check"></i></button>
                     <button onclick="updateStatus('${item.id}', 'rejected')" class="w-9 h-9 flex items-center justify-center bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-90" title="Rechazar"><i class="fas fa-times"></i></button>
                    ` : ""
                }
                
                ${canEdit || currentUser?.role === "admin"
                    ? `
                    <button onclick="editItem('${item.id}')" class="w-9 h-9 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all active:scale-90" title="Editar"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteItem('${item.id}')" class="w-9 h-9 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90" title="Eliminar"><i class="fas fa-trash"></i></button>
                    ` : ""
                }
            </div>
        </div>
    </div>
`;
  return card;
}

// 1. Variable global para que todas las funciones (toggleBan, deleteUser)
// puedan acceder a los datos sin volver a llamar a la API.
let usersList = [];

async function renderAdminUsersTab(parent) {
  // Aplicamos Roboto al contenedor principal
  parent.classList.add("font-['Roboto']");
  parent.innerHTML = `<div class="py-20 text-center text-gray-500 uppercase font-black italic animate-pulse">Conectando con la base de datos...</div>`;

  try {
    const res = await fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Guardamos los datos en la variable global
    usersList = await res.json();

    parent.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 py-8">
          <h2 class="text-2xl font-black dark:text-white uppercase italic mb-8 flex items-center tracking-tight">
              <i class="fas fa-user-shield mr-3 text-neonPurple"></i> Control de Usuarios
          </h2>
          
          <div class="mb-6">
              <input type="text" id="user-search" placeholder="Buscar por Cód. Cliente o Nombre..." 
                     class="w-full md:w-1/3 p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-neonPurple/50 transition-all font-medium">
          </div>

          <div class="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard shadow-xl">
              <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse" id="users-table">
                    <thead class="bg-gray-800 text-gray-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                      <tr>
                        <th class="p-5 text-left">Cód. Cliente</th>
                        <th class="p-5 text-left">Username</th>
                        <th class="p-5 text-left">Cantidad</th>
                        <th class="p-5 text-left">Estado</th>
                        <th class="p-5 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody id="users-tbody" class="divide-y divide-gray-100 dark:divide-gray-800">
                        </tbody>
                  </table>
              </div>
          </div>
      </div>
    `;

    // Función de actualización de tabla
    window.updateUsersTable = () => {
      const tbody = document.getElementById("users-tbody");
      if (!tbody) return;

      const term = document.getElementById("user-search").value.trim().toLowerCase();
      
      const filtered = usersList.filter(u => {
        const isNotAdmin = u.username.toLowerCase() !== 'admin';
        // Recordamos que el código del cliente es importante
        const matchesTerm = String(u.id).toLowerCase().includes(term) || u.username.toLowerCase().includes(term);
        return isNotAdmin && matchesTerm;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-gray-500 italic font-bold uppercase text-xs">No se encontraron resultados</td></tr>`;
        return;
      }

      let globalStats = { total: 0, lost: 0, found: 0, pending: 0, approved: 0, rejected: 0 };

      let html = filtered.map(u => {
        const userItems = allItems.filter(item => item.userId === u.id);
        const s = {
          total: userItems.length,
          lost: userItems.filter(i => i.type === 'lost').length,
          found: userItems.filter(i => i.type === 'found').length,
          pending: userItems.filter(i => i.status === 'pending').length,
          approved: userItems.filter(i => i.status === 'approved').length,
          rejected: userItems.filter(i => i.status === 'rejected').length
        };

        Object.keys(globalStats).forEach(k => globalStats[k] += s[k]);

        return `
        <tr class="hover:bg-gray-800/20 transition-colors border-b border-gray-800/50">
            <td class="p-4 text-gray-500 font-mono text-[15px] font-bold uppercase whitespace-nowrap">#${u.id}</td>
            
            <td class="p-4 dark:text-white font-black uppercase text-xs italic tracking-wide">${u.username}</td>
            
            <td class="p-4">
                <div class="flex items-center gap-2">
                    <span title="Total" class="px-2 py-0.5 rounded bg-gray-700 text-white text-[11px] font-black">${s.total}</span>
                    <div class="flex items-center gap-1 bg-black/20 p-1 rounded-full px-2">
                        <span title="Buscados" class="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">${s.lost}</span>
                        <span title="Encontrados" class="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white text-[9px] font-bold">${s.found}</span>
                    </div>
                    <div class="flex items-center gap-1 bg-black/20 p-1 rounded-full px-2">
                        <span title="Pendientes" class="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-500 text-black text-[9px] font-bold">${s.pending}</span>
                        <span title="Aprobados" class="w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white text-[9px] font-bold">${s.approved}</span>
                        <span title="Rechazados" class="w-5 h-5 flex items-center justify-center rounded-full bg-orange-600 text-white text-[9px] font-bold">${s.rejected}</span>
                    </div>
                </div>
            </td>

            <td class="p-4">
                <span class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm ${u.isBanned ? "bg-red-500 text-white" : "bg-green-500/20 text-green-400"}">
                    ${u.isBanned ? "Suspendido" : "Activo"}
                </span>
            </td>
            
            <td class="p-4 text-center">
                <div class="flex justify-center gap-2">
                    <button onclick="toggleBan('${u.id}')" 
                        title="${u.isBanned ? 'Activar' : 'Suspender'}"
                        class="w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm ${
                          u.isBanned 
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white" 
                          : "bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white"
                        }">
                        <i class="fas ${u.isBanned ? "fa-user-check" : "fa-user-slash"} text-xs"></i>
                    </button>
                    <button onclick="deleteUser('${u.id}')" title="Eliminar" 
                        class="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>`;
      }).join("");

      const totalRow = `
        <tr class="bg-white/5 font-black border-t-2 border-gray-700">
            <td class="p-4 text-[11px] text-gray-400 uppercase tracking-widest">Global</td>
            <td class="p-4 text-white uppercase text-xs italic">${filtered.length} Usuarios</td>
            <td class="p-4">
                <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-black">${globalStats.total}</span>
                    <div class="flex gap-1 bg-black/40 p-1 rounded-full px-2">
                        <span class="w-5 h-5 flex items-center justify-center rounded-full bg-red-600 text-white text-[9px]">${globalStats.lost}</span>
                        <span class="w-5 h-5 flex items-center justify-center rounded-full bg-green-600 text-white text-[9px]">${globalStats.found}</span>
                        </div>
                    <div class="flex gap-1 bg-black/40 p-1 rounded-full px-2">
                        <span class="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-600 text-white text-[9px]">${globalStats.pending}</span>
                        <span class="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-[9px]">${globalStats.approved}</span>
                        <span class="w-5 h-5 flex items-center justify-center rounded-full bg-orange-700 text-white text-[9px]">${globalStats.rejected}</span>
                    </div>
                </div>
            </td>
            <td colspan="2"></td>
        </tr>`;

      tbody.innerHTML = html + totalRow;
    };

    document.getElementById("user-search").oninput = window.updateUsersTable;
    window.updateUsersTable();

  } catch (error) {
    console.error("Error:", error);
    parent.innerHTML = `<div class="py-20 text-center text-red-500 font-black uppercase italic">Error al conectar con el servidor</div>`;
  }
}

// toggleBan (Instantáneo y con Reversión)
window.toggleBan = async (id) => {
  const user = usersList.find((u) => u.id === id);
  if (!user) return;

  // Confirmación antes de suspender
  const action = user.isBanned ? "activar" : "suspender";
  if (!confirm(`¿Deseas ${action} al usuario ${user.username.toUpperCase()}?`)) return;

  // Cambio visual inmediato (Optimista)
  user.isBanned = !user.isBanned;
  if (window.updateUsersTable) window.updateUsersTable();

  try {
    const res = await fetch(`${API_URL}/users/${id}/ban`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Error en la respuesta de la base de datos");
    
  } catch (error) {
    console.error("Error en toggleBan:", error);
    // Revertimos si falla
    user.isBanned = !user.isBanned;
    if (window.updateUsersTable) window.updateUsersTable();
    alert("No se pudo sincronizar el estado con el servidor.");
  }
};

// Función para eliminar usuario
window.deleteUser = async (id) => {
  const user = usersList.find((u) => u.id === id);
  if (!confirm(`⚠️ ¿Eliminar definitivamente a ${user?.username}? Esta acción es irreversible.`)) return;

  try {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      usersList = usersList.filter(u => u.id !== id);
      window.updateUsersTable();
    } else {
      alert("Error al eliminar el usuario");
    }
  } catch (err) {
    console.error(err);
  }
};

// ======================================================
// 📡 CARGAR ÍTEMS DESDE BACKEND
// ======================================================
async function loadItems() {
  try {
    const res = await fetch(`${API_URL}/items`);
    allItems = await res.json();
  } catch (e) {}
}



// ======================================================
// ➕ BOTÓN FLOTANTE
// ======================================================
function renderFloatingButton() {
  const oldBtn = document.getElementById("floating-add-btn");
  if (oldBtn) oldBtn.remove();
  if (!currentUser) return;

  const btn = document.createElement("button");
  btn.id = "floating-add-btn";
  btn.innerHTML = '<i class="fas fa-plus fa-lg"></i>';
  btn.className =
    "fixed bottom-8 right-8 w-16 h-16 bg-neonPurple text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 flex items-center justify-center";
  btn.onclick = showAddForm;
  document.body.appendChild(btn);
}

// ======================================================
// 🧭 NAVBAR
// ======================================================
function updateNavbar() {
  const sec = document.getElementById("user-section");
  if (currentUser) {
    sec.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="text-xs font-black text-neonPurple uppercase italic">${currentUser.username}</span>
                <button onclick="logout()" class="text-[10px] bg-gray-800 text-gray-400 px-3 py-1 rounded-full font-bold hover:bg-red-500 hover:text-white">SALIR</button>
            </div>
        `;
  } else {
    sec.innerHTML = `<button onclick="showLoginForm()" class="bg-neonPurple text-black px-5 py-2 rounded-xl font-black text-xs">LOGIN</button>`;
  }
}

//=====================================================
// --- ACTUALIZAR ESTADO DE ÍTEM ---
// ======================================================
window.updateStatus = async (id, status) => {
  await fetch(`${API_URL}/items/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  location.reload();
};
//======================================================
// --- ELIMINAR ÍTEM ---
// ====================================================== 
window.deleteItem = async (id) => {
  if (confirm("¿Eliminar anuncio?")) {
    await fetch(`${API_URL}/items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    location.reload();
  }
};
//======================================================
// --- ELIMINAR USUARIO ---
// ======================================================
window.deleteUser = async (id) => {
    if (!confirm("¿Eliminar usuario y sus anuncios?")) return;

    try {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            // 1. Borramos al usuario de la lista de usuarios
            usersList = usersList.filter(u => u.id !== id);
            
            // 2. IMPORTANTE: Borramos sus anuncios de la memoria local
            // Así, si cambias a la pestaña "Anuncios", ya no estarán
            allItems = allItems.filter(item => item.userId !== id);

            // 3. Refrescamos la tabla si estamos en la pestaña de usuarios
            if (window.updateUsersTable) window.updateUsersTable();
            
            alert("Usuario y sus anuncios eliminados correctamente.");
        }
    } catch (e) {
        console.error("Error al borrar:", e);
    }
};

//======================================================
// --- MODAL GENERAL ---
// ======================================================
function openModal() {
  document.getElementById("modal-container").classList.remove("hidden");
}
function closeModal() {
  document.getElementById("modal-container").classList.add("hidden");
}

//======================================================
// --- MOSTRAR FORMULARIO DE AÑADIR ÍTEM ---
// ======================================================
function showAddForm() {
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
// ✏️ EDITAR ÍTEM
// ======================================================
window.editItem = (id) => {
  const item = allItems.find((i) => i.id === id);
  if (!item) return;
  openModal();
  document.getElementById("modal-body").innerHTML = `
        <h2 class="text-2xl font-black dark:text-white mb-6 uppercase italic">Editar Anuncio</h2>
        <form id="edit-form" class="space-y-4">
            <input type="text" id="edit-title" value="${item.title}" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            <input type="text" id="edit-phone" value="${item.phone}" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            <textarea id="edit-desc" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white h-24 outline-none" required>${item.description}</textarea>
            
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-500 uppercase ml-2">Cambiar Foto (Opcional)</label>
                <input type="file" id="edit-image" class="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-500 file:text-white">
            </div>

            <button type="submit" class="w-full bg-blue-500 text-white font-black p-4 rounded-2xl uppercase shadow-lg">Guardar Cambios</button>
        </form>
    `;

  document.getElementById("edit-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", document.getElementById("edit-title").value);
    fd.append("description", document.getElementById("edit-desc").value);
    fd.append("phone", document.getElementById("edit-phone").value);
    fd.append("status", "pending"); // Vuelve a revisión tras editar
    const img = document.getElementById("edit-image").files[0];
    if (img) fd.append("image", img);

    const res = await fetch(`${API_URL}/items/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (res.ok) {
      alert("Cambios guardados. El anuncio volvió a estado 'Pendiente'.");
      location.reload();
    }
  };
};

//======================================================
// --- MOSTRAR LOGIN ---
// ======================================================
function showLoginForm() {
  openModal();
  document.getElementById("modal-body").innerHTML = `
        <h2 class="text-2xl font-black dark:text-white mb-6 text-center uppercase">Entrar</h2>
        <form id="login-form" class="space-y-4">
            <input type="text" id="log-user" placeholder="Usuario" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            <input type="password" id="log-pass" placeholder="Password" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            <button type="submit" class="w-full bg-neonPurple text-black font-black p-4 rounded-2xl hover:opacity-90 transition-all">INGRESAR</button>
        </form>
        <p class="mt-6 text-center text-xs text-gray-500">
            ¿No tienes cuenta? 
            <button onclick="showRegisterForm()" class="text-neonPurple font-bold hover:underline">Regístrate aquí</button>
        </p>
    `;

  document.getElementById("login-form").onsubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("log-user").value,
        password: document.getElementById("log-pass").value,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      location.reload();
    } else alert(data.message);
  };
}

//======================================================
// --- MOSTRAR REGISTRO ---
// ======================================================
function showRegisterForm() {
  document.getElementById("modal-body").innerHTML = `
        <h2 class="text-2xl font-black dark:text-white mb-6 text-center uppercase italic">Crear Cuenta</h2>
        <form id="register-form" class="space-y-4">
            <input type="text" id="reg-user" placeholder="Nombre de usuario" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            <input type="password" id="reg-pass" placeholder="Contraseña segura" class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" required>
            <button type="submit" class="w-full bg-white dark:bg-white text-black font-black p-4 rounded-2xl hover:bg-neonPurple transition-all">FINALIZAR REGISTRO</button>
        </form>
        <p class="mt-6 text-center text-xs text-gray-500">
            ¿Ya tienes cuenta? 
            <button onclick="showLoginForm()" class="text-neonPurple font-bold hover:underline">Inicia sesión</button>
        </p>
    `;

  document.getElementById("register-form").onsubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("reg-user").value,
        password: document.getElementById("reg-pass").value,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("¡Cuenta creada con éxito! Ahora puedes ingresar.");
      showLoginForm();
    } else alert(data.message);
  };
}

// ======================================================
// 🚪 LOGOUT
// ======================================================
function logout() {
  localStorage.clear();
  location.reload();
}