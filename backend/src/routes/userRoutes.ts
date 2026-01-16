import { Router } from 'express';
import { register, login, getAllUsers, deleteUser, toggleUserBan } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/roleMiddleware';


const router = Router();

router.post('/register', register);
router.post('/login', login);

// Ruta para obtener todos los usuarios (solo admin)
router.get('/', verifyToken, isAdmin, getAllUsers);

// Ruta para eliminar usuario (solo admin)
router.delete('/:id', verifyToken, isAdmin, deleteUser);

// Ruta para banear/desbanear usuario (solo admin)
router.patch('/:id/ban', verifyToken, isAdmin, toggleUserBan);

export default router;