import { Router } from 'express';
import { loginWithGoogle, getMe, logout } from '../controller/authController.js';
import { updateMe, deleteMe } from '../controller/userController.js';
import { authenticateUser } from '../middlewares/authenticateUser.js';

const router = Router();

// Customer Authentication
router.post('/auth/google', loginWithGoogle);
router.post('/auth/logout', logout);

// Customer Profile (Protected by authenticateUser)
router.get('/me', authenticateUser, getMe);
router.patch('/me', authenticateUser, updateMe);
router.delete('/me', authenticateUser, deleteMe);

export default router;
