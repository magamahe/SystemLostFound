//===============INDEX DEL BACKEND===============//

// 1. Importaciones y Configuraciones Iniciales
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/itemRoutes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// Crear la aplicación de Express
const app = express();

// Puerto de escucha
const PORT = process.env.PORT || 5000; 

//====================================
// --- CONFIGURACIÓN DE CLOUDINARY ---
//====================================
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

//================================
// --- MIDDLEWARES Y RUTAS ---
//===============================
// 2. Middlewares Globales
// Middleware para CORS
app.use(cors());
// Middleware para parsear JSON
app.use(express.json());

//================================================================================
// 3. Definición de Rutas de la API (Deben ir ANTES de los estáticos del front)
//================================================================================
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);

//================================================
// --- SERVIR FRONTEND Y ARCHIVOS ESTÁTICOS ---
//===============================================
// 4. Archivos estáticos y Frontend
const publicPath = path.resolve(process.cwd(), '..', 'public');
app.use(express.static(publicPath));

// Middleware para servir archivos estáticos (imágenes, etc.)
// Soporte para imágenes locales (si las hubiera)
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public/uploads')));

// --- ¡ESTO ES VITAL! ---
// Si el usuario entra a una ruta que no es de la API, le servimos el index.html
// Esto permite que el frontend maneje sus propias rutas sin dar 404
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

//================================================
// --- MANEJO DE ERRORES ---
//===============================================
// 5. Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor y Frontend listos en puerto ${PORT}`);
});