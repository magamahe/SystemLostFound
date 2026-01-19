"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
// 1. Cargamos variables de entorno ANTES que cualquier otra configuración
dotenv_1.default.config();
const cloudinary_1 = require("cloudinary");
// Importación de Rutas
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const itemRoutes_1 = __importDefault(require("./routes/itemRoutes"));
// Importación de Middlewares de Error
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
// IMPORTANTE: Render asigna el puerto automáticamente
const PORT = process.env.PORT || 5000;
// --- CONFIGURACIÓN DE CLOUDINARY ---
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// 2. Middlewares iniciales
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 3. Archivos estáticos
// Nota: path.resolve con process.cwd() es más seguro en Linux/Render
app.use('/uploads', express_1.default.static(path_1.default.resolve(process.cwd(), 'public/uploads')));
app.use(express_1.default.static(path_1.default.resolve(process.cwd(), 'public')));
// 4. Definición de Rutas con prefijo /api
app.use('/api/users', userRoutes_1.default);
app.use('/api/items', itemRoutes_1.default);
// 5. Manejo de errores
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo para Render`);
    console.log(`📡 API Endpoints en puerto ${PORT}`);
});
