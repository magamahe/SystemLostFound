// ======================================================
// 📱 app.js - Módulo principal de la aplicación
// ======================================================

import * as auth from './auth.js';
import * as ui from './ui.js';
import { renderTab, showAddForm } from './items.js';


// ======================================================
// 🚀 ESTADO GLOBAL
// ======================================================
window.currentUser = JSON.parse(localStorage.getItem("user")) || null;

// ======================================================
// 🛠️ INICIALIZACIÓN DE LA APLICACIÓN
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Cargar Tema (Dark por defecto)
    ui.loadTheme();

    const user = window.currentUser;

    // 2. Inicializar Interfaz (Navbar y Botón Flotante)
    ui.updateNavbar(user);
    
    if (user) {
        ui.renderFloatingButton(user, () => {
            if (navigator.vibrate) navigator.vibrate(10);
            showAddForm();
        });
    }

    // 3. Inicializar el tablón de anuncios
    renderTab("general");

    // 4. DELEGACIÓN DE CLICS (Para elementos dinámicos)
    document.addEventListener("click", (e) => {
        
        // --- LOGIN / LOGOUT ---
        if (e.target.closest("#login-btn-nav")) {
            auth.showLoginForm();
        }

        if (e.target.id === "logout-btn") {
            auth.logout();
        }

        // --- NAVEGACIÓN DENTRO DEL MODAL ---
        if (e.target.id === "btn-to-reg") {
            auth.showRegisterForm();
        }
        if (e.target.id === "btn-to-login") {
            auth.showLoginForm();
        }

        // --- CIERRE DE MODAL ---
        // Verifica que el ID coincida con el botón X que pusimos en el HTML
        if (e.target.closest("#btn-close-modal") || e.target.id === "modal-container") {
            ui.closeModal();
        }

        // --- CAMBIO DE TEMA ---
        if (e.target.closest("#theme-toggle")) {
            ui.toggleTheme();
        }
    });
});