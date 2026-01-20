//==================== USER CONTROLLER ==========================//

// importaciones de librerías y módulos
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DataService } from '../services/dataService';
import { User } from '../models/user';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary'; // Importamos Cloudinary

//==================== CONFIGURACIÓN DE CLOUDINARY ======================//
// Función auxiliar para extraer el public_id de la URL de Cloudinary
const getPublicIdFromUrl = (url: string) => {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1]; 
    const folder = "trabajo_final_m3"; // Asegúrate que coincida con tu carpeta en createItem
    const publicId = lastPart.split('.')[0]; 
    return `${folder}/${publicId}`;
};
//===============================================================================================//


//=====================================================
// --------------Register Controller------------------
//=====================================================
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const users = await DataService.getUsers();

    const userRole = users.length === 0 ? "admin" : "user";

    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      role: userRole,
      isBanned: false
    };

    users.push(newUser);
    await DataService.saveUsers(users);

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

//=====================================================
//  ----------------Login Controller ------------------
//=====================================================
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const users = await DataService.getUsers();

    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    if (user.isBanned) {
        return res.status(403).json({ 
        message: "Tu cuenta ha sido suspendida por mal comportamiento" 
      });
    }   

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_fallback',
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

//=====================================================
// -----------Get All Users Controller(Solo Admin)-----
//=====================================================
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await DataService.getUsers();
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

//=====================================================
// Delete User Controller (para Render/Cloudinary)
//=====================================================
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const users = await DataService.getUsers();
    const items = await DataService.getItems();

    const userExists = users.find(u => u.id === id);
    if (!userExists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 1. LIMPIEZA DE IMÁGENES EN CLOUDINARY
    // Buscamos los anuncios que pertenecen a este usuario
    const userItems = items.filter(item => item.userId === id);

    for (const item of userItems) {
      if (item.image && item.image.includes("cloudinary.com")) {
        try {
          const publicId = getPublicIdFromUrl(item.image);
          await cloudinary.uploader.destroy(publicId);
          console.log(`Imagen eliminada de Cloudinary: ${publicId}`);
        } catch (cloudErr) {
          console.error("Error al borrar imagen de Cloudinary:", cloudErr);
          // No bloqueamos el proceso si falla el borrado de una imagen
        }
      }
    }

    // 2. ACTUALIZAR BASE DE DATOS (Filtramos al usuario y sus anuncios)
    const filteredUsers = users.filter(u => u.id !== id);
    const filteredItems = items.filter(item => item.userId !== id);

    await DataService.saveUsers(filteredUsers);
    await DataService.saveItems(filteredItems);

    res.json({ message: `Usuario ${userExists.username} y sus anuncios/imágenes eliminados correctamente.` });
    
  } catch (error) {
    console.error("Error en deleteUser:", error);
    res.status(500).json({ message: "Error al eliminar" });
  }
};

//=====================================================
//  -----------Toggle User Ban Controller (Admin)------
//=====================================================
export const toggleUserBan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const users = await DataService.getUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) return res.status(404).json({ message: "Usuario no encontrado" });

    users[userIndex].isBanned = !users[userIndex].isBanned;
    await DataService.saveUsers(users);

    const status = users[userIndex].isBanned ? "suspendida" : "activada";
    res.json({ message: `La cuenta de ${users[userIndex].username} ha sido ${status}.` });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar el baneo" });
  }
};