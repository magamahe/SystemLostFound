import { Request, Response, NextFunction } from 'express';

// Este middleware captura cualquier error que ocurra en las rutas
export const errorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
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
// Middleware para rutas no encontradas
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: `La ruta ${req.originalUrl} no fue encontrada`
  });
};