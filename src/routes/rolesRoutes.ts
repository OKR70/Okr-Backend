import express from 'express';
import { addRoleToUser, removeRoleFromUser } from '../controllers/roleController';
import { hasRole } from '../middlewares/hasRole';
import { authToken } from '../middlewares/authToken';

const router = express.Router();

/**
 * Добавить роль пользователю
 */

router.patch('/add', authToken, hasRole('dean'), addRoleToUser);

/**
 * Удалить роль рользователя
 */

router.delete('/delete', authToken, hasRole('dean'), removeRoleFromUser);

export default router;