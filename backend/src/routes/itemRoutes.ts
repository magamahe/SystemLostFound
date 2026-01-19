import { Router } from 'express';
import { 
    createItem, 
    getItems, 
    updateItem, 
    deleteItem, 
    updateItemStatus 
} from '../controllers/itemController';
import { verifyToken } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/roleMiddleware';
import { upload } from '../middlewares/upload';

const router = Router();

// --- RUTAS PÚBLICAS ---
// URL: GET /api/items
router.get('/', getItems); 

// --- RUTAS PROTEGIDAS (Requieren Token) ---
// El código del cliente es importante y se extrae en verifyToken

// Crear Item: POST /api/items
router.post('/', verifyToken, upload.single('image'), createItem);

// Actualizar Item: PUT /api/items/:id
router.put('/:id', verifyToken, upload.single('image'), updateItem);

// Borrar Item: DELETE /api/items/:id
router.delete('/:id', verifyToken, deleteItem);

// --- RUTAS DE ADMIN ---
// Solo el admin puede cambiar el estado (approved/rejected)
// PATCH /api/items/:id/status
router.patch('/:id/status', verifyToken, isAdmin, updateItemStatus);

export default router;