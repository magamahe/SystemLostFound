"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const itemController_1 = require("../controllers/itemController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
// --- RUTAS PÚBLICAS ---
// URL: GET /api/items
router.get('/', itemController_1.getItems);
// --- RUTAS PROTEGIDAS (Requieren Token) ---
// El código del cliente es importante y se extrae en verifyToken
// Crear Item: POST /api/items
router.post('/', authMiddleware_1.verifyToken, upload_1.upload.single('image'), itemController_1.createItem);
// Actualizar Item: PUT /api/items/:id
router.put('/:id', authMiddleware_1.verifyToken, upload_1.upload.single('image'), itemController_1.updateItem);
// Borrar Item: DELETE /api/items/:id
router.delete('/:id', authMiddleware_1.verifyToken, itemController_1.deleteItem);
// --- RUTAS DE ADMIN ---
// Solo el admin puede cambiar el estado (approved/rejected)
// PATCH /api/items/:id/status
router.patch('/:id/status', authMiddleware_1.verifyToken, roleMiddleware_1.isAdmin, itemController_1.updateItemStatus);
exports.default = router;
