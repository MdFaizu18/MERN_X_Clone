import {Router} from 'express';
import { commentOnPost, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts, likePost } from '../controllers/postController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateUser);

router.get('/get-posts',getAllPosts);
router.get('/following',getFollowingPosts);
router.get('/own-posts/:username',getUserPosts)
router.get('/likes/:id',getLikedPosts);
router.post('/create',createPost);
router.post('/comment/:id',commentOnPost);
router.post('/like/:id',likePost);
router.delete('/:id',deletePost);

export default router;