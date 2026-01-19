"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.updateItemStatus = exports.getItems = exports.createItem = void 0;
const dataService_1 = require("../services/dataService");
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
const cloudinary_1 = require("cloudinary");
// @ts-ignore
const streamifier_1 = __importDefault(require("streamifier"));
// --- CONFIGURACIÓN DE CLOUDINARY ---
// Usamos process.env para que en Render solo tengas que cargar los valores en la pestaña "Environment"
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// --- FUNCIÓN PARA OPTIMIZAR Y SUBIR A LA NUBE ---
const optimizeAndUpload = async (file) => {
    // 1. Optimizamos con Sharp desde el buffer de memoria
    const optimizedBuffer = await (0, sharp_1.default)(file.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toBuffer();
    // 2. Subimos el Buffer a Cloudinary mediante un Stream
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder: "trabajo_final_m3" }, (error, result) => {
            if (result)
                resolve(result.secure_url);
            else
                reject(error);
        });
        streamifier_1.default.createReadStream(optimizedBuffer).pipe(uploadStream);
    });
};
// --- CREATE ITEM ---
const createItem = async (req, res) => {
    try {
        const { title, description, type, phone } = req.body;
        const items = await dataService_1.DataService.getItems();
        let imagePath = '';
        if (req.file) {
            imagePath = await optimizeAndUpload(req.file);
        }
        const newItem = {
            id: (0, uuid_1.v4)(),
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
        await dataService_1.DataService.saveItems(items);
        res.status(201).json(newItem);
    }
    catch (error) {
        console.error("Error en createItem:", error);
        res.status(500).json({ message: "Error al crear el item" });
    }
};
exports.createItem = createItem;
// --- GET ITEMS ---
const getItems = async (req, res) => {
    try {
        const items = await dataService_1.DataService.getItems();
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener items" });
    }
};
exports.getItems = getItems;
// --- UPDATE ITEM STATUS (ADMIN) ---
const updateItemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const items = await dataService_1.DataService.getItems();
        const index = items.findIndex(i => i.id === id);
        if (index === -1)
            return res.status(404).json({ message: "Item no encontrado" });
        items[index].status = status;
        await dataService_1.DataService.saveItems(items);
        res.json({ message: `Item ${status} con éxito`, item: items[index] });
    }
    catch (error) {
        res.status(500).json({ message: "Error al actualizar status" });
    }
};
exports.updateItemStatus = updateItemStatus;
// --- UPDATE ITEM (OWNER/ADMIN) ---
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const items = await dataService_1.DataService.getItems();
        const index = items.findIndex(i => i.id === id);
        if (index === -1)
            return res.status(404).json({ message: "Item no encontrado" });
        if (items[index].userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "No autorizado" });
        }
        let imagePath = items[index].image;
        if (req.file) {
            imagePath = await optimizeAndUpload(req.file);
        }
        items[index] = {
            ...items[index],
            ...req.body,
            image: imagePath,
            status: 'pending'
        };
        await dataService_1.DataService.saveItems(items);
        res.json({ message: "Item actualizado", item: items[index] });
    }
    catch (error) {
        res.status(500).json({ message: "Error al actualizar" });
    }
};
exports.updateItem = updateItem;
// --- DELETE ITEM ---
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        let items = await dataService_1.DataService.getItems();
        const item = items.find(i => i.id === id);
        if (!item)
            return res.status(404).json({ message: "Item no encontrado" });
        if (item.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "No tienes permiso" });
        }
        items = items.filter(i => i.id !== id);
        await dataService_1.DataService.saveItems(items);
        res.json({ message: "Item eliminado correctamente" });
    }
    catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ message: "Error al eliminar el item" });
    }
};
exports.deleteItem = deleteItem;
