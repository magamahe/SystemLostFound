import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Usamos 'any' en req para poder añadir la propiedad .user sin que TypeScript proteste
export const verifyToken = (req: any, res: Response, next: NextFunction) => {
  // 1. Obtenemos el token del header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
  }

  try {
    // 2. Verificamos el token
    // IMPORTANTE: El string 'secret_fallback' debe coincidir con el que pusiste en el login
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');
    
    // 3. Inyectamos los datos decodificados (id, role) en la petición
    req.user = decoded; 
    
    next();
  } catch (error) {
    // Si el token expiró o es falso, rebota aquí
    res.status(401).json({ message: 'Token no válido o expirado' });
  }
};