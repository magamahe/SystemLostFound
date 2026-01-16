import { Router } from 'express';
import { createItem, getItems, updateItem, deleteItem, updateItemStatus } from '../controllers/itemController';
import { verifyToken } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/roleMiddleware';
import { upload } from '../middlewares/upload';



const router = Router();

// Rutas Públicas
router.get('/', getItems); // El frontend filtrará los 'approved'

// Rutas Protegidas (Cualquier usuario logueado)
router.post('/', verifyToken, upload.single('image'), createItem);
router.put('/:id', verifyToken, upload.single('image'), updateItem);
router.delete('/:id', verifyToken, deleteItem);

// Rutas de Admin
router.patch('/:id/status', verifyToken, isAdmin, updateItemStatus);

export default router;