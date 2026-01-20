//==================================================//
// 🔐 auth.js - Módulo para manejar autenticación de usuarios
//==================================================//

import { openModal } from './ui.js';
import { API_URL } from './api.js';

//==============================
// --- MOSTRAR LOGIN (ESTILO CYBER) ---
//==============================
export function showLoginForm() {
    openModal();
    const body = document.getElementById("modal-body");
    body.innerHTML = `
        <div class="text-center mb-8">
            <div class="inline-block p-3 rounded-full bg-neonPurple/10 mb-4">
                <i class="fas fa-user-lock text-3xl text-neonPurple shadow-neon"></i>
            </div>
            <h2 class="text-3xl font-black text-white uppercase tracking-tighter italic">Acceso Total</h2>
            <p class="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Inicia sesión para publicar</p>
        </div>

        <form id="login-form" class="space-y-4">
            <div class="relative group">
                <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors"></i>
                <input type="text" id="log-user" autocomplete="username" placeholder="Usuario" 
                    class="w-full pl-12 pr-4 py-4 rounded-2xl glass border-none text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-neonPurple/50 transition-all" required>
            </div>

            <div class="relative group">
                <i class="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors"></i>
                <input type="password" id="log-pass" autocomplete="current-password" placeholder="Password" 
                    class="w-full pl-12 pr-4 py-4 rounded-2xl glass border-none text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-neonPurple/50 transition-all" required>
            </div>

            <button type="submit" class="w-full bg-gradient-to-r from-neonPurple to-neonPink text-white font-black py-4 rounded-2xl shadow-lg shadow-neonPurple/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm mt-4">
                Entrar al Sistema
            </button>
        </form>

        <div class="mt-8 pt-6 border-t border-white/5 text-center">
            <p class="text-xs text-slate-500 font-medium">
                ¿Todavía no eres parte? 
                <button id="btn-to-reg" class="text-neonPink font-black hover:text-white transition-colors uppercase ml-1">Crea tu cuenta</button>
            </p>
        </div>
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
            } else alert("❌ " + data.message);
        } catch (err) { console.error("Error login:", err); }
    };
}

//==============================
// --- MOSTRAR REGISTRO (ESTILO CYBER) ---
//==============================
export function showRegisterForm() {
    const body = document.getElementById("modal-body");
    body.innerHTML = `
        <div class="text-center mb-8">
            <div class="inline-block p-3 rounded-full bg-neonPink/10 mb-4">
                <i class="fas fa-user-plus text-3xl text-neonPink shadow-neon"></i>
            </div>
            <h2 class="text-3xl font-black text-white uppercase tracking-tighter italic">Registro</h2>
            <p class="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Únete a la red de búsqueda</p>
        </div>

        <form id="register-form" class="space-y-4">
            <input type="text" id="reg-user" autocomplete="username" placeholder="Nombre de usuario" 
                class="w-full p-4 rounded-2xl glass border-none text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-neonPink/50 transition-all" required>

            <input type="password" id="reg-pass" autocomplete="new-password" placeholder="Password Seguro" 
                class="w-full p-4 rounded-2xl glass border-none text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-neonPink/50 transition-all" required>

            <button type="submit" class="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-neonPink hover:text-white shadow-xl transition-all uppercase tracking-widest text-sm mt-4">
                Finalizar Registro
            </button>
        </form>

        <div class="mt-8 pt-6 border-t border-white/5 text-center">
            <p class="text-xs text-slate-500 font-medium">
                ¿Ya tienes cuenta? 
                <button id="btn-to-login" class="text-neonPurple font-black hover:text-white transition-colors uppercase ml-1">Inicia sesión</button>
            </p>
        </div>
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
                alert("🚀 ¡Cuenta creada con éxito! Bienvenido a la red.");
                showLoginForm();
            } else alert("❌ " + data.message);
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