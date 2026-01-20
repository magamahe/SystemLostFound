"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
// Usamos 'any' para req para que reconozca la propiedad .user que inyectó el token
const isAdmin = (req, res, next) => {
    // 1. Verificamos si existe el usuario (inyectado por verifyToken)
    // 2. Verificamos si tiene el rol de administrador
    if (req.user && req.user.role === 'admin') {
        return next(); // Importante el 'return' para evitar que siga ejecutando código abajo
    }
    // Si no es admin o no hay usuario, mandamos el error
    return res.status(403).json({
        message: "Acceso denegado: Se requieren permisos de administrador"
    });
};
exports.isAdmin = isAdmin;
