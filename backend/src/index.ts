import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// Importación de Rutas
import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/itemRoutes';

// Importación de Middlewares de Error
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middlewares iniciales
app.use(cors());
app.use(express.json()); // Para poder leer el body en formato JSON

// 2. Archivos estáticos (Fotos y Frontend)
// Esto sirve para que al entrar a /uploads/nombre.jpg se vea la imagen
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));
app.use(express.static(path.join(__dirname, '../../public')));

// 3. Definición de Rutas (Endpoints)
app.use('/users', userRoutes);
app.use('/items', itemRoutes);

// 4. Manejo de rutas no encontradas (404)
app.use(notFoundHandler);

// 5. Manejador de errores global (Debe ser el ÚLTIMO)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Imágenes servidas en http://localhost:${PORT}/uploads`);
});