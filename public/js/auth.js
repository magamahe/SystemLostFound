//==================================================//
// 🔐 auth.js - Módulo para manejar autenticación de usuarios
//==================================================//

// 🔐 IMPORTACIONES
import { openModal } from './ui.js';
import { API_URL } from './api.js';

//==============================
// --- MOSTRAR LOGIN ---
//==============================
export function showLoginForm() {
    openModal();
    const body = document.getElementById("modal-body");
    body.innerHTML = `
        <h2 class="text-2xl font-black dark:text-white mb-6 text-center uppercase">Entrar</h2>
        <form id="login-form" class="space-y-4">
            <input type="text" 
                   id="log-user" 
                   autocomplete="username" 
                   placeholder="Usuario" 
                   class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" 
                   required>

            <input type="password" 
                   id="log-pass" 
                   autocomplete="current-password" 
                   placeholder="Password" 
                   class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" 
                   required>

            <button type="submit" class="w-full bg-neonPurple text-black font-black p-4 rounded-2xl hover:opacity-90 transition-all">INGRESAR</button>
        </form>
        <p class="mt-6 text-center text-xs text-gray-500">
            ¿No tienes cuenta? 
            <button id="btn-to-reg" class="text-neonPurple font-bold hover:underline">Regístrate aquí</button>
        </p>
    `;

    document.getElementById("login-form").onsubmit = async (e) => {
        e.preventDefault();
        try {
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
        } catch (err) { console.error("Error login:", err); }
    };
}

//==============================
// --- MOSTRAR REGISTRO ---
//==============================
export function showRegisterForm() {
    const body = document.getElementById("modal-body");
    body.innerHTML = `
        <h2 class="text-2xl font-black dark:text-white mb-6 text-center uppercase italic">Crear Cuenta</h2>
        <form id="register-form" class="space-y-4">
            <input type="text" 
                   id="reg-user" 
                   autocomplete="username" 
                   placeholder="Nombre de usuario" 
                   class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" 
                   required>

            <input type="password" 
                   id="reg-pass" 
                   autocomplete="new-password" 
                   placeholder="Contraseña segura" 
                   class="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white outline-none" 
                   required>

            <button type="submit" 
                    class="w-full bg-white dark:bg-white text-black font-black p-4 rounded-2xl hover:bg-neonPurple transition-all">
                FINALIZAR REGISTRO
            </button>
        </form>
        <p class="mt-6 text-center text-xs text-gray-500">
            ¿Ya tienes cuenta? 
            <button id="btn-to-login" class="text-neonPurple font-bold hover:underline">Inicia sesión</button>
        </p>
    `;

    document.getElementById("register-form").onsubmit = async (e) => {
        e.preventDefault();
        try {
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
        } catch (err) { console.error("Error registro:", err); }
    };
}

//==============================
// --- LOGOUT ---
//==============================
export function logout() {
    localStorage.clear();
    location.reload();
}