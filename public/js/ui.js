// ======================================================
// 🖥️ UI.JS - Módulo para gestión de la interfaz de usuario
// ======================================================


//============================================
//fc para abrir y cerrar modales
//============================================
export function openModal() {
    const modal = document.getElementById("modal-container");
    if (modal) modal.classList.remove("hidden");
}

//============================================
//fc para cerrar modales
//============================================
export function closeModal() {
    const modal = document.getElementById("modal-container");
    if (modal) modal.classList.add("hidden");
}

//======================================================
// fc actualizar navbar según estado de usuario
// ======================================================
export function updateNavbar(user) {
  const sec = document.getElementById("user-section");
  if (!sec) return;

  if (user) {
    // Si hay usuario, mostramos su nombre y botón con ID para el Logout
    sec.innerHTML = `
        <div class="flex items-center gap-4">
            <span class="text-xs font-black text-neonPurple uppercase italic">${user.username}</span>
            <button id="logout-btn" class="text-[10px] bg-gray-800 text-gray-400 px-3 py-1 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all">
                SALIR
            </button>
        </div>
    `;
  } else {
    // Si no hay usuario, botón de login con su ID correspondiente
    sec.innerHTML = `
        <button id="login-btn-nav" class="bg-neonPurple text-black px-5 py-2 rounded-xl font-black text-xs uppercase">
            LOGIN
        </button>
    `;
  }
}

// ======================================================
// ➕ BOTÓN FLOTANTE
// ======================================================
export function renderFloatingButton(user, action) {
  const oldBtn = document.getElementById("floating-add-btn");
  if (oldBtn) oldBtn.remove();

  // Ahora 'user' viene por parámetro desde app.js
  if (!user) return;

  const btn = document.createElement("button");
  btn.id = "floating-add-btn";
  btn.innerHTML = '<i class="fas fa-plus fa-lg"></i>';
  btn.className = "fixed bottom-8 right-8 w-16 h-16 bg-neonPurple text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 flex items-center justify-center";
  
  // 'action' será la función showAddForm que le pasaremos
  btn.onclick = action; 
  
  document.body.appendChild(btn);
}

//=====================================================
// 🌓 TOGGLE DE MODO OSCURO
//=====================================================
// 1. Lógica de inicialización (Corre apenas carga la web)
// ======================================================
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    
    // Si nunca entró o eligió dark, ponemos dark
    if (!savedTheme || savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
};

//======================================================
// 2. La función que dispara el botón
// ======================================================
window.toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark'); // Quita o pone la clase 'dark'
    
    // Guardamos la elección para la próxima visita
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    console.log("Modo oscuro:", isDark);
};

// Ejecutamos la inicialización
initTheme();