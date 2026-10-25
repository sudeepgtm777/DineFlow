import express from 'express';
import {
  checkLoginStatus,
  login,
  logout,
  register,
  updateProfile,
  getAllUsers,
  promoteToAdmin,
  demoteFromAdmin,
  approveCook,
  rejectCook,
} from '../controllers/user.controller';
import isAuthenticated from '../middlewares/isAuthenticated';
import { singleUpload } from '../middlewares/multer';
import isAdmin from '../middlewares/isAdmin';
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Try again in a minute.', success: false },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Try again in a minute.', success: false },
});

const router = express.Router();

router.post('/register', registerLimiter, singleUpload, register);
router.post('/login', loginLimiter, login);
router.get('/logout', logout);
router.put('/update-profile/:id', isAuthenticated, singleUpload, updateProfile);
router.get('/check-login-status', checkLoginStatus);

router.get('/all', isAuthenticated, isAdmin, getAllUsers);
router.put('/approve/:userId', isAuthenticated, isAdmin, approveCook);
router.put('/reject/:userId', isAuthenticated, isAdmin, rejectCook);
router.put('/promote/:userId', isAuthenticated, isAdmin, promoteToAdmin);
router.put('/demote/:userId', isAuthenticated, isAdmin, demoteFromAdmin);

export default router;
