// @ts-nocheck
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
} from '../controllers/user.controller';
import isAuthenticated from '../middlewares/isAuthenticated';
import { singleUpload } from '../middlewares/mutler';
import isAdmin from '../middlewares/isAdmin';

const router = express.Router();

router.post('/register', singleUpload, register);
router.post('/login', login);
router.get('/logout', isAuthenticated, logout);
router.put('/update-profile/:id', isAuthenticated, singleUpload, updateProfile);
router.get('/check-login-status', isAuthenticated, checkLoginStatus);

router.get('/all', isAuthenticated, isAdmin, getAllUsers);
router.put('/promote/:userId', isAuthenticated, isAdmin, promoteToAdmin);
router.put('/demote/:userId', isAuthenticated, isAdmin, demoteFromAdmin);

export default router;
