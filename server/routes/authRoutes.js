import { Router } from "express";
import { currentUser, getAllUsers, getUserById, login, logout, register } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();

router.post('/login',login);
router.post('/register',register);
router.get('/logout',logout);
router.get('/user',authenticateUser,currentUser);
router.get('/get-users',authenticateUser,getAllUsers);
router.get('/search-user/:id', getUserById)


export default router;