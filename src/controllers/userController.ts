import { Request, Response } from 'express';
import UserModel from '../models/user';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить всех пользователей
 *     description: Возвращает список всех пользователей, исключая их пароли.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Успешный запрос. Возвращает массив пользователей.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Ошибка сервера. Не удалось получить пользователей.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ошибка при получении пользователей
 *                 error:
 *                   type: string
 *                   example: Произошла ошибка на сервере
 */

/*
 * Получить всех пользователей
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await UserModel.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Ошибка при получении пользователей', error: error.message });
        } else {
            res.status(500).json({ message: 'Ошибка при получении пользователей', error: 'Неизвестная ошибка' });
        }
    }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     description: Возвращает информацию о пользователе по его ID, исключая пароль.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID пользователя
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Успешный запрос. Возвращает объект пользователя.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Пользователь не найден
 *       500:
 *         description: Ошибка сервера. Не удалось получить пользователя.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ошибка при получении пользователя
 *                 error:
 *                   type: string
 *                   example: Произошла ошибка на сервере
 */

/*
 * Получить пользователя по ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id;
        const user = await UserModel.findById(userId).select('-password');

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Ошибка при получении пользователя', error: error.message });
        } else {
            res.status(500).json({ message: 'Ошибка при получении пользователя', error: 'Неизвестная ошибка' });
        }
    }
};