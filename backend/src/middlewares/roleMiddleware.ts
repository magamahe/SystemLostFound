//verifique si el usuario es "admin", cumpliendo así con los requisitos de autorización avanzada
import { Response, NextFunction } from 'express';

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Acceso denegado: Se requieren permisos de administrador" });
  }
};