import * as auth from './auth.js';
import * as ui from './ui.js';
import { renderTab, showAddForm } from './items.js';

// ======================================================
// 🚀 ESTADO GLOBAL
// ======================================================
// Importante hoy 16 de enero: Centralizamos el usuario en window para los módulos
window.currentUser = JSON.parse(localStorage.getItem("user")) || null;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Configuración de Tema (Dark por defecto como pediste)
    document.documentElement.classList.add("dark");

    // 2. Referencia rápida al usuario
    const user = window.currentUser;

    // 3. Inicializar Interfaz Básica (Navbar)
    ui.updateNavbar(user);
    
    // 4. Renderizar Botón Flotante (+)
    // Si el usuario existe, el botón abrirá el formulario de publicación
    ui.renderFloatingButton(user, () => {
        showAddForm();
    });

    // 5. INICIALIZAR EL TABLÓN (Carga automática)
    // En lugar de cargar los ítems manualmente, usamos el sistema de tabs.
    // Esto asegura que se cree el buscador, los filtros y el grid.
    renderTab("general");

    // 6. DELEGACIÓN DE CLICS (Eventos Globales)
    document.addEventListener("click", (e) => {
        
        // --- AUTH ---
        // Abrir Login desde Navbar
        if (e.target.closest("#login-btn-nav")) {
            auth.showLoginForm();
        }

        // Logout
        if (e.target.id === "logout-btn") {
            auth.logout();
        }

        // Switchear entre formularios dentro del modal
        if (e.target.id === "btn-to-reg") {
            auth.showRegisterForm();
        }
        if (e.target.id === "btn-to-login") {
            auth.showLoginForm();
        }

        // --- UI ---
        // Cerrar Modal (X o clic en el fondo oscuro)
        if (e.target.closest("#close-modal") || e.target.id === "modal-overlay") {
            ui.closeModal();
        }
    });
});