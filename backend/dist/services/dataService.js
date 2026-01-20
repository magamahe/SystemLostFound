"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs"); // Necesitamos la versión síncrona para chequeos rápidos
const path_1 = __importDefault(require("path"));
// --- CONFIGURACIÓN DE RUTAS ABSOLUTAS ---
// process.cwd() nos asegura que siempre partimos de la carpeta raíz del proyecto en Render
const DATA_DIR = path_1.default.join(process.cwd(), 'src', 'data');
const USERS_FILE = path_1.default.join(DATA_DIR, 'users.json');
const ITEMS_FILE = path_1.default.join(DATA_DIR, 'items.json');
// Función interna para asegurar que la carpeta y los archivos existan
const ensureFilesExist = async () => {
    if (!(0, fs_1.existsSync)(DATA_DIR)) {
        (0, fs_1.mkdirSync)(DATA_DIR, { recursive: true });
    }
    if (!(0, fs_1.existsSync)(USERS_FILE)) {
        await promises_1.default.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    }
    if (!(0, fs_1.existsSync)(ITEMS_FILE)) {
        await promises_1.default.writeFile(ITEMS_FILE, JSON.stringify([], null, 2));
    }
};
exports.DataService = {
    // Obtiene el arreglo completo de usuarios
    async getUsers() {
        try {
            await ensureFilesExist(); // Verificamos antes de leer
            const data = await promises_1.default.readFile(USERS_FILE, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error("Error leyendo usuarios, devolviendo array vacío");
            return [];
        }
    },
    // Guarda el arreglo completo de usuarios
    async saveUsers(users) {
        await ensureFilesExist();
        await promises_1.default.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    },
    // Obtiene el arreglo completo de ítems
    async getItems() {
        try {
            await ensureFilesExist();
            const data = await promises_1.default.readFile(ITEMS_FILE, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error("Error leyendo ítems, devolviendo array vacío");
            return [];
        }
    },
    // Guarda el arreglo completo de ítems
    async saveItems(items) {
        await ensureFilesExist();
        await promises_1.default.writeFile(ITEMS_FILE, JSON.stringify(items, null, 2));
    }
};
