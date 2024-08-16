import { Router } from "express";
import { currentUser, login, logout, register } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();

router.post('/login',login);
router.post('/register',register);
router.get('/logout',logout);
router.get('/user',authenticateUser,currentUser);

export default router;