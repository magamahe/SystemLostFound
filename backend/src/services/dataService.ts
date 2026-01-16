import fs from 'fs/promises';
import path from 'path';
import { User } from '../models/user';
import { Item } from '../models/item'

const USERS_FILE = path.join(__dirname, '../../data/users.json');
const ITEMS_FILE = path.join(__dirname, '../../data/items.json');

// Servicio para manejar la lectura y escritura de datos
export const DataService = {
  // Obtiene el arreglo completo de usuarios
    async getUsers(): Promise<User[]> {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  },

  // Guarda el arreglo completo de usuarios
  async saveUsers(users: User[]): Promise<void> {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  },

// Obtiene el arreglo completo de ítems
  async getItems(): Promise<Item[]> {
    const data = await fs.readFile(ITEMS_FILE, 'utf-8');
    return JSON.parse(data);
  },

// Guarda el arreglo completo de ítems
  async saveItems(items: Item[]): Promise<void> {
    await fs.writeFile(ITEMS_FILE, JSON.stringify(items, null, 2));
  }
};