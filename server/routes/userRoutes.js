import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUserProfile } from "../controllers/userController.js";

const router = Router();

router.use(authenticateUser);
router.get('/profile/:username',getUserProfile);
router.get('/follow/:id',followUnfollowUser);
router.get('/suggested',getSuggestedUsers);
router.patch('/update',updateUserProfile);

export default router;