import { Router } from 'express';
import {
  toggleInterest,
  getMyInterests,
  checkInterest,
  removeInterest,
  listAdminInterests,
} from '../controllers/interestController.js';
import authenticateUser from '../user/middlewares/authenticateUser.js';
import optionalUserAuth from '../middlewares/optionalUserAuth.js';
import authenticateAdmin from '../admin/middlewares/authenticateAdmin.js';

const router = Router();

// Customer Routes (Authenticated or Persistent Guest)
router.post('/toggle', optionalUserAuth, toggleInterest);
router.post('/', optionalUserAuth, toggleInterest);
router.get('/my', optionalUserAuth, getMyInterests);
router.get('/check/:productId', optionalUserAuth, checkInterest);
router.delete('/:id', optionalUserAuth, removeInterest);

// Admin Management Routes
router.get('/admin', authenticateAdmin, listAdminInterests);

export default router;
