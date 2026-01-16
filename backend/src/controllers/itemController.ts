import { Request, Response } from 'express';
import { DataService } from '../services/dataService';
import { Item } from '../models/item';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// --- FUNCIÓN AUXILIAR PARA OPTIMIZAR IMÁGENES ---
// La creamos aparte para no repetir código en create y update
const optimizeImage = async (file: any) => {
    const fileName = `opt-${Date.now()}.webp`;
    
    // Ruta corregida: sube un nivel para salir de backend y entrar a public
    const uploadDir = path.join(process.cwd(), '..', 'public', 'uploads');
    const outputPath = path.join(uploadDir, fileName);

    // Crear la carpeta si no existe
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // --- LA CLAVE ---
    // Usamos 'file.buffer' porque Multer ya no genera 'file.path'
    await sharp(file.buffer) 
        .resize(800)
        .webp({ quality: 80 })
        .toFile(outputPath);

    console.log("✅ Imagen optimizada única creada con éxito.");

    return `/uploads/${fileName}`;
};

// --- CREATE ITEM ---
export const createItem = async (req: any, res: Response) => {
    try {
        const { title, description, type, phone } = req.body;
        const items = await DataService.getItems();

        let imagePath = '';
        if (req.file) {
            // Usamos nuestra función de optimización
            imagePath = await optimizeImage(req.file);
        }

        const newItem: Item = {
            id: uuidv4(),
            title,
            description,
            type,
            phone,
            status: "pending",
            userId: req.user.id,
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
    const { id } = req.params;
    const { status } = req.body;

    const items = await DataService.getItems();
    const index = items.findIndex(i => i.id === id);

    if (index === -1) return res.status(404).json({ message: "Item no encontrado" });

    items[index].status = status;
    await DataService.saveItems(items);

    res.json({ message: `Item ${status} con éxito`, item: items[index] });
};

// --- UPDATE ITEM (OWNER/ADMIN) ---
export const updateItem = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const items = await DataService.getItems();
        const index = items.findIndex(i => i.id === id);

        if (index === -1) return res.status(404).json({ message: "Item no encontrado" });

        // ... (tus validaciones de seguridad de siempre)

        let imagePath = items[index].image;

        if (req.file) {
            // 1. SI YA TENÍA UNA IMAGEN, LA BORRAMOS DEL DISCO
            if (items[index].image) {
                // Construimos la ruta hacia el archivo viejo
                // Recuerda que items[index].image empieza con "/uploads/..."
                const oldImagePath = path.join(process.cwd(), '..', 'public', items[index].image);
                
                try {
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                        console.log("Imagen anterior eliminada para ahorrar espacio");
                    }
                } catch (err) {
                    console.error("No se pudo borrar la imagen vieja:", err);
                }
            }

            // 2. OPTIMIZAMOS Y GUARDAMOS LA NUEVA
            imagePath = await optimizeImage(req.file);
        }

        // 3. ACTUALIZAMOS EL JSON
        items[index] = {
            ...items[index],
            ...req.body,
            image: imagePath,
            status: 'pending' 
        };

        await DataService.saveItems(items);
        res.json({ message: "Item actualizado", item: items[index] });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar" });
    }
};

// --- DELETE ITEM ---// --- DELETE ITEM (CORRECCIÓN DE RUTA DE CARPETA) ---
export const deleteItem = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        let items = await DataService.getItems();

        const item = items.find(i => i.id === id);
        if (!item) return res.status(404).json({ message: "Item no encontrado" });

        if (item.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "No tienes permiso" });
        }

        if (item.image) {
            // 1. Limpiamos la barra inicial: "/uploads/..." -> "uploads/..."
            const cleanImagePath = item.image.startsWith('/') ? item.image.substring(1) : item.image;

            // 2. CORRECCIÓN CLAVE: 
            // Si el proceso corre en /backend, debemos subir un nivel para llegar a /public
            const fullImagePath = path.join(process.cwd(), '..', 'public', cleanImagePath);

            console.log("Intentando borrar en ruta corregida:", fullImagePath);

            if (fs.existsSync(fullImagePath)) {
                fs.unlinkSync(fullImagePath);
                console.log("✅ ¡FOTO ELIMINADA CON ÉXITO!");
            } else {
                // Si aún falla, probamos sin el '..' por si acaso
                const fallbackPath = path.join(process.cwd(), 'public', cleanImagePath);
                if (fs.existsSync(fallbackPath)) {
                    fs.unlinkSync(fallbackPath);
                    console.log("✅ ¡FOTO ELIMINADA CON ÉXITO (Ruta alternativa)!");
                } else {
                    console.log("❌ Sigue sin encontrarse. Rutas probadas:");
                    console.log("1:", fullImagePath);
                    console.log("2:", fallbackPath);
                }
            }
        }

        items = items.filter(i => i.id !== id);
        await DataService.saveItems(items);
        res.json({ message: "Item eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ message: "Error al eliminar el item" });
    }
};