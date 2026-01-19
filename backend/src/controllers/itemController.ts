import { Request, Response } from 'express';
import { DataService } from '../services/dataService';
import { Item } from '../models/item';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
// @ts-ignore
import streamifier from 'streamifier';

// --- CONFIGURACIÓN DE CLOUDINARY ---
// Usamos process.env para que en Render solo tengas que cargar los valores en la pestaña "Environment"
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Función para extraer el 'public_id' de una URL de Cloudinary
const getPublicIdFromUrl = (url: string) => {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1]; // Ej: "imagen.webp"
    const folder = "trabajo_final_m3"; // El nombre de tu carpeta configurado arriba
    const publicId = lastPart.split('.')[0]; // Quitamos la extensión (.webp)
    return `${folder}/${publicId}`;
};

// --- FUNCIÓN PARA OPTIMIZAR Y SUBIR A LA NUBE ---
const optimizeAndUpload = async (file: any): Promise<string> => {
    // 1. Optimizamos con Sharp desde el buffer de memoria
    const optimizedBuffer = await sharp(file.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toBuffer();

    // 2. Subimos el Buffer a Cloudinary mediante un Stream
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "trabajo_final_m3" },
            (error, result) => {
                if (result) resolve(result.secure_url); 
                else reject(error);
            }
        );
        streamifier.createReadStream(optimizedBuffer).pipe(uploadStream);
    });
};

// --- CREATE ITEM ---
export const createItem = async (req: any, res: Response) => {
    try {
        const { title, description, type, phone } = req.body;
        const items = await DataService.getItems();

        let imagePath = '';
        if (req.file) {
            imagePath = await optimizeAndUpload(req.file);
        }

        const newItem: Item = {
            id: uuidv4(),
            title,
            description,
            type,
            phone,
            status: "pending",
            userId: req.user.id, // Tu información guardada: El código del cliente es importante
            image: imagePath,
            createdAt: new Date().toISOString()
        };

        items.push(newItem);
        await DataService.saveItems(items);
        res.status(201).json(newItem);
    } catch (error) {
        console.error("Error en createItem:", error);
        res.status(500).json({ message: "Error al crear el item" });
    }
};

// --- GET ITEMS ---
export const getItems = async (req: Request, res: Response) => {
    try {
        const items = await DataService.getItems();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener items" });
    }
};

// --- UPDATE ITEM STATUS (ADMIN) ---
export const updateItemStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const items = await DataService.getItems();
        const index = items.findIndex(i => i.id === id);

        if (index === -1) return res.status(404).json({ message: "Item no encontrado" });

        items[index].status = status;
        await DataService.saveItems(items);
        res.json({ message: `Item ${status} con éxito`, item: items[index] });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar status" });
    }
};

// --- UPDATE ITEM (OWNER/ADMIN) ---
export const updateItem = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const items = await DataService.getItems();
        const index = items.findIndex(i => i.id === id);

        if (index === -1) return res.status(404).json({ message: "Item no encontrado" });

        // Verificar permisos
        if (items[index].userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "No autorizado" });
        }

        let imagePath = items[index].image;

        // --- SI EL USUARIO SUBIÓ UNA NUEVA FOTO ---
        if (req.file) {
            // 1. Borrar la imagen anterior de Cloudinary si existe
            if (items[index].image && items[index].image.includes("cloudinary.com")) {
                try {
                    const oldPublicId = getPublicIdFromUrl(items[index].image);
                    await cloudinary.uploader.destroy(oldPublicId);
                    console.log("Imagen anterior eliminada de Cloudinary:", oldPublicId);
                } catch (err) {
                    console.error("Error al borrar imagen vieja:", err);
                    // No bloqueamos el proceso si falla el borrado de la vieja
                }
            }
            // 2. Optimizar y subir la nueva foto
            imagePath = await optimizeAndUpload(req.file);
        }

        items[index] = {
            ...items[index],
            ...req.body, // Aquí vienen title, description, type, phone
            image: imagePath,
            status: 'pending' // Volver a pendiente para revisión si se edita
        };

        await DataService.saveItems(items);
        res.json({ message: "Item actualizado correctamente", item: items[index] });
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ message: "Error al actualizar" });
    }
};
// --- DELETE ITEM ---
export const deleteItem = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        let items = await DataService.getItems();
        const item = items.find(i => i.id === id);

        if (!item) return res.status(404).json({ message: "Item no encontrado" });

        if (item.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "No tienes permiso" });
        }

        // --- NUEVO: BORRAR IMAGEN DE CLOUDINARY ---
        if (item.image && item.image.includes("cloudinary.com")) {
            const publicId = getPublicIdFromUrl(item.image);
            await cloudinary.uploader.destroy(publicId);
            console.log("Imagen borrada de Cloudinary:", publicId);
        }
        
        items = items.filter(i => i.id !== id);
        await DataService.saveItems(items);
        res.json({ message: "Item e imagen eliminados correctamente" });
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ message: "Error al eliminar el item" });
    }
};