"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// --- CONFIGURACIÓN DE MEMORIA ---
// Al usar memoryStorage, el archivo se guarda temporalmente en el objeto 'req.file.buffer'
// y NUNCA se escribe en la carpeta 'uploads' de forma automática.
const storage = multer_1.default.memoryStorage();
// Filtro de seguridad opcional: solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('El archivo no es una imagen'), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    }
});
