"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
router.post('/register', userController_1.register);
router.post('/login', userController_1.login);
// Ruta para obtener todos los usuarios (solo admin)
router.get('/', authMiddleware_1.verifyToken, roleMiddleware_1.isAdmin, userController_1.getAllUsers);
// Ruta para eliminar usuario (solo admin)
router.delete('/:id', authMiddleware_1.verifyToken, roleMiddleware_1.isAdmin, userController_1.deleteUser);
// Ruta para banear/desbanear usuario (solo admin)
router.patch('/:id/ban', authMiddleware_1.verifyToken, roleMiddleware_1.isAdmin, userController_1.toggleUserBan);
exports.default = router;
