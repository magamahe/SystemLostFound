import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DataService } from '../services/dataService';
import { User } from '../models/user';
import { v4 as uuidv4 } from 'uuid'; // Puedes usar crypto.randomUUID() si no quieres instalar uuid

// Register Controller
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const users = await DataService.getUsers();

    // Lógica automática: Si no hay nadie, el primero es el jefe
    const userRole = users.length === 0 ? "admin" : "user";

    // Validar si el usuario ya existe
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Hashear la contraseña (Requisito 2)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      role: userRole, // Por defecto siempre es user
      isBanned: false // Nuevo campo inicializado en false
    };

    users.push(newUser);
    await DataService.saveUsers(users);

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Login Controller
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const users = await DataService.getUsers();

    // 1. Buscar al usuario (Case Insensitive como pide la consigna)
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    // Verificar si el usuario existe
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Verificar si el usuario está baneado
    if (user.isBanned) {
        return res.status(403).json({ 
        message: "Tu cuenta ha sido suspendida por mal comportamiento" 
      });
    }   

    // 2. Comparar contraseña con la hasheada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // 3. Crear el Token (Válido por 2 horas)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_fallback',
      { expiresIn: '2h' }
    );

    // 4. Devolver token y datos básicos
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  /* } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión" });
  } */
  } catch (error) {
    console.log("--- ERROR DETECTADO ---");
    console.error(error); // Esto imprimirá el error real en tu terminal de VS Code
    res.status(500).json({ message: "Error al iniciar sesión", detail: error });
  }
};

// Get All Users Controller (Solo Admin)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await DataService.getUsers();
    
    // Mapeamos para NO enviar el campo 'password' al frontend
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      isBanned: u.isBanned
    }));

    res.json(userList);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// Delete User Controller (Solo Admin)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const users = await DataService.getUsers();
    const items = await DataService.getItems();

    const userExists = users.find(u => u.id === id);
    if (!userExists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 1. FILTRAR ANUNCIOS DEL USUARIO
    const itemsToDelete = items.filter(item => item.userId === id);

        // 2. BORRAR ARCHIVOS FÍSICOS
    itemsToDelete.forEach(item => {
      if (item.image) {
        // Explicación de la ruta:
        // 1. process.cwd() nos deja en 'backend'
        // 2. '..' sale de 'backend' hacia la raíz 'TRABAJO_FINAL_M3'
        // 3. 'public' entra a la carpeta public
        // 4. item.image ya trae 'uploads/nombre.webp'
        
        const cleanPath = item.image.startsWith('/') ? item.image.substring(1) : item.image;
        const absolutePath = path.resolve(process.cwd(), '..', 'public', cleanPath);

        console.log("Ruta final calculada:", absolutePath);

        try {
          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log("✅ Imagen eliminada de public/uploads");
          } else {
            console.log("⚠️ No se encontró el archivo en:", absolutePath);
          }
        } catch (err) {
          console.error("❌ Error al borrar archivo:", err);
        }
      }
    });

    // 3. ACTUALIZAR BASE DE DATOS (JSON)
    const filteredUsers = users.filter(u => u.id !== id);
    const filteredItems = items.filter(item => item.userId !== id);

    await DataService.saveUsers(filteredUsers);
    await DataService.saveItems(filteredItems);

    res.json({ message: `Usuario ${userExists.username} y sus archivos eliminados.` });
    
  } catch (error) {
    console.error("Error en deleteUser:", error);
    res.status(500).json({ message: "Error al eliminar" });
  }
};
// Toggle User Ban Controller (Solo Admin)
export const toggleUserBan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const users = await DataService.getUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Cambiamos el estado (si estaba en false pasa a true, y viceversa)
    users[userIndex].isBanned = !users[userIndex].isBanned;
    
    await DataService.saveUsers(users);

    const status = users[userIndex].isBanned ? "suspendida" : "activada";
    res.json({ message: `La cuenta de ${users[userIndex].username} ha sido ${status}.` });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar el baneo" });
  }
};

//
