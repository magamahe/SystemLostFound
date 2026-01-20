//=============== USER ROUTES ===============//

// Rutas para la gestión de Usuarios en la aplicación.
import { Router } from 'express';
import { register, login, getAllUsers, deleteUser, toggleUserBan } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/roleMiddleware';

// Inicializar el router
const router = Router();

//========================
// --- RUTAS PÚBLICAS ---
//========================
router.post('/register', register);
router.post('/login', login);

//==============================================
// --- RUTAS PROTEGIDAS (Requieren Token) ---
//==============================================
// Ruta para obtener todos los usuarios (solo admin)
router.get('/', verifyToken, isAdmin, getAllUsers);

// Ruta para eliminar usuario (solo admin)
router.delete('/:id', verifyToken, isAdmin, deleteUser);

// Ruta para banear/desbanear usuario (solo admin)
router.patch('/:id/ban', verifyToken, isAdmin, toggleUserBan);

// Exportar el router
export default router;