import { Request, Response } from 'express';
import UserModel from '../models/user';

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