import { Request, Response } from 'express';
import UserModel from '../models/user'; // Импортируй модель пользователя

/**
 * Добавить роль пользователю
 */
export const addRoleToUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, role } = req.body;

        // Проверка, что userId и role переданы
        if (!userId || !role) {
            res.status(400).json({ message: 'Необходимо указать userId и role' });
            return;
        }

        // Проверка, что роль является допустимой
        const validRoles = ['professor', 'student'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: 'Недопустимая роль' });
            return;
        }

        // Находим пользователя и добавляем роль
        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }

        // Проверяем, что роль еще не добавлена
        if (user.role.includes(role)) {
            res.status(400).json({ message: 'Роль уже добавлена' });
            return;
        }

        // Добавляем роль
        user.role.push(role);
        await user.save();

        res.status(200).json({ message: 'Роль успешно добавлена', user });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Ошибка при добавлении роли', error: error.message });
        } else {
            res.status(500).json({ message: 'Ошибка при добавлении роли', error: 'Неизвестная ошибка' });
        }
    }
};

/**
 * Удалить роль пользователя
 */
export const removeRoleFromUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, role } = req.body;

        // Проверка, что userId и role переданы
        if (!userId || !role) {
            res.status(400).json({ message: 'Необходимо указать userId и role' });
            return;
        }

        // Проверка, что роль является допустимой
        const validRoles = ['professor', 'student'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: 'Недопустимая роль' });
            return;
        }

        // Находим пользователя и удаляем роль
        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }

        // Проверяем, что роль существует
        if (!user.role.includes(role)) {
            res.status(400).json({ message: 'Роль не найдена' });
            return;
        }

        // Удаляем роль
        user.role = user.role.filter((r) => r !== role);
        await user.save();

        res.status(200).json({ message: 'Роль успешно удалена', user });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Ошибка при удалении роли', error: error.message });
        } else {
            res.status(500).json({ message: 'Ошибка при удалении роли', error: 'Неизвестная ошибка' });
        }
    }
};