//==================================================//
// 📡 api.js - Módulo para interactuar con la API del backend
//==================================================//

// 📡 CONSTANTE DE URL DE LA API
export const API_URL = window.location.origin + "/api";

//=================================================//
// 📡 CARGAR ÍTEMS DESDE BACKEND
//=================================================//
export async function loadItems() {
  try {
    const res = await fetch(`${API_URL}/items`);
    if (!res.ok) throw new Error("Error en la respuesta del servidor");
    return await res.json();
  } catch (e) {
    console.error("No se pudieron cargar los ítems:", e);
    return []; // Retorna un array vacío para que la web no rompa
  }
}