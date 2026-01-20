"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Usamos 'any' en req para poder añadir la propiedad .user sin que TypeScript proteste
const verifyToken = (req, res, next) => {
    // 1. Obtenemos el token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
    }
    try {
        // 2. Verificamos el token
        // IMPORTANTE: El string 'secret_fallback' debe coincidir con el que pusiste en el login
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret_fallback');
        // 3. Inyectamos los datos decodificados (id, role) en la petición
        req.user = decoded;
        next();
    }
    catch (error) {
        // Si el token expiró o es falso, rebota aquí
        res.status(401).json({ message: 'Token no válido o expirado' });
    }
};
exports.verifyToken = verifyToken;
