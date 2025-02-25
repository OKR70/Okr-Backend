import express from 'express';
import { getAllUsers, getUserById } from '../controllers/userController';

const router = express.Router();

/**
 * Получить всех пользователей
 */
router.get('/', getAllUsers);

/**
 * Получить пользователя по ID
 */
router.get('/:id', getUserById);

export default router;