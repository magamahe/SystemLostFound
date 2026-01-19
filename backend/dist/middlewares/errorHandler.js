"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
// Este middleware captura cualquier error que ocurra en las rutas
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Para ver en la consola del VS Code
    // Si el error tiene un status específico lo usamos, si no, mandamos 500
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Error interno del servidor',
        // Opcional: solo mostrar el stack si no estás en producción
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
exports.errorHandler = errorHandler;
// Middleware para rutas no encontradas
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        message: `La ruta ${req.originalUrl} no fue encontrada`
    });
};
exports.notFoundHandler = notFoundHandler;
