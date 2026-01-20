// ======================================================
// 🖥️ UI.JS - Módulo para gestión de la interfaz de usuario
// ======================================================

export function openModal() {
    const modal = document.getElementById("modal-container");
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex"); 
    }
}

export function closeModal() {
    const modal = document.getElementById("modal-container");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

// ======================================================
// Actualizar navbar con estilo moderno y Logout funcional
// ======================================================
export function updateNavbar(user) {
    const sec = document.getElementById("user-section");
    if (!sec) return;

    if (user) {
        sec.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="flex flex-col items-end">
                    <span class="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em]">Sessión activa</span>
                    <span class="text-sm font-black text-neonPurple uppercase italic">${user.username}</span>
                </div>
                <button id="logout-btn" class="bg-white/5 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-1.5 rounded-full text-[10px] font-black transition-all">
                    SALIR
                </button>
            </div>
        `;
        // Asignar evento de Logout inmediatamente
        document.getElementById("logout-btn").onclick = () => {
            localStorage.clear();
            location.reload();
        };
    } else {
        sec.innerHTML = `
            <button id="login-btn-nav" class="bg-gradient-to-r from-neonPurple to-neonPink text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-neonPurple/20 hover:scale-105 transition-all">
                LOGIN
            </button>
        `;
        // El evento de abrir login se asigna en app.js para evitar dependencias circulares
    }
}

// ======================================================
// ➕ BOTÓN FLOTANTE (Corregido el icono)
// ======================================================
// ui.js
export function renderFloatingButton(user, action) {
    let btn = document.getElementById("floating-add-btn");
    
    // Si no hay usuario, eliminamos el botón
    if (!user) {
        if (btn) btn.remove();
        return;
    }

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "floating-add-btn";
        document.body.appendChild(btn);
    }
    
    // ESTRUCTURA CORREGIDA:
    // 1. El <i> del '+' ahora está fuera del span para ser siempre visible.
    // 2. Usamos flex e items-center para que el '+' esté perfectamente centrado en el círculo.
    btn.innerHTML = `
        <div class="flex items-center justify-center w-16 h-16 flex-shrink-0">
            <i class="fas fa-plus text-white text-2xl relative z-10 pointer-events-none"></i>
        </div>
        <span class="pr-6 font-black text-sm uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-white">
            Nuevo Anuncio
        </span>
    `;
    
    // CLASES DE ESTILO:
    // Aseguramos 'group' para el hover y el ancho inicial fijo de 16 (w-16)
    btn.className = "fixed bottom-8 right-8 h-16 w-16 hover:w-52 bg-gradient-to-br from-neonPurple to-neonPink rounded-full shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center overflow-hidden transition-all duration-500 z-[9999] group border border-white/20 cursor-pointer";
    
    btn.onclick = action; 
}
//=====================================================
// 🌓 GESTIÓN DE TEMA
//=====================================================
export const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
};

export const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

// Inicializar tema al cargar el módulo
loadTheme();