import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs'; // Necesitamos la versión síncrona para chequeos rápidos
import path from 'path';
import { User } from '../models/user';
import { Item } from '../models/item';

// --- CONFIGURACIÓN DE RUTAS ABSOLUTAS ---
// process.cwd() nos asegura que siempre partimos de la carpeta raíz del proyecto en Render
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ITEMS_FILE = path.join(DATA_DIR, 'items.json');

// Función interna para asegurar que la carpeta y los archivos existan
const ensureFilesExist = async () => {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(USERS_FILE)) {
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!existsSync(ITEMS_FILE)) {
    await fs.writeFile(ITEMS_FILE, JSON.stringify([], null, 2));
  }
};

export const DataService = {
  // Obtiene el arreglo completo de usuarios
  async getUsers(): Promise<User[]> {
    try {
      await ensureFilesExist(); // Verificamos antes de leer
      const data = await fs.readFile(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error leyendo usuarios, devolviendo array vacío");
      return [];
    }
  },

  // Guarda el arreglo completo de usuarios
  async saveUsers(users: User[]): Promise<void> {
    await ensureFilesExist();
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  },

  // Obtiene el arreglo completo de ítems
  async getItems(): Promise<Item[]> {
    try {
      await ensureFilesExist();
      const data = await fs.readFile(ITEMS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error leyendo ítems, devolviendo array vacío");
      return [];
    }
  },

  // Guarda el arreglo completo de ítems
  async saveItems(items: Item[]): Promise<void> {
    await ensureFilesExist();
    await fs.writeFile(ITEMS_FILE, JSON.stringify(items, null, 2));
  }
};