import express, {
    Request,
    Response
} from 'express';
import UserModel from '../models/user';
import TokenService from '../services/token';
import PasswordService from '../services/password';
import { authToken } from '../middlewares/authToken'; 
import { validateEmailAndPassword } from '../middlewares/validation';

const router = express.Router();

/*
 * Авторизация
 */

/*
 * Получить сессию пользователя
 */
router.get(
    '/session',
    authToken,
    async (req: Request, res: Response): Promise<any> => {
    try {
        return res.status(200).json({ user: req.user });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
})

/*
 * Регистрация
 */
router.post(
    '/register',
    validateEmailAndPassword,
    async (req: Request, res: Response): Promise<any> => {
    const {
        login,
        fullname,
        password
    } = req.body;

    try {
        const existingUser = await UserModel.findOne({ login });
        if (existingUser) {
            return res.status(409).json({ message: "Пользователь с таким login уже существует" })
        }
        
        // Проверяем пароль
        const hashedPassword = PasswordService.hashPassword(password);

        // Создаем нового пользователя
        const newUser = (
            await UserModel.create({
                login,
                fullname,
                password: hashedPassword
            })
        ).toObject();
        
        delete newUser.password;
        
        // Генерируем токен
        const token = await TokenService.generateToken(newUser._id.toString());
        
        TokenService.setTokenCookie(res, token);

        return res.status(201).json({ user: newUser });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

/*
 * Роут для авторизации пользователя
 */
router.post(
    '/login',
    validateEmailAndPassword,
    async (req: Request, res: Response): Promise<any> => {
    const {
        login,
        password,
    } = req.body;

    try {
        // Находим пользователя по email
        const user = await UserModel.findOne({ login }).lean();
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Проверяем пароль
        const isPasswordValid = PasswordService.comparePasswords(password, user.password!);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный пароль' });
        }

        delete user.password;

        // Генерируем токен
        const token = await TokenService.generateToken(user._id.toString());
        
        TokenService.setTokenCookie(res, token);
        return res.status(200).json({ user });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

router.post(
    '/logout',
    authToken,
    async (req: Request, res: Response): Promise<any> => {
    try {
        // Отзываем токены в базе данных.
        await TokenService.revokeAllTokensForUser(req.user!._id.toString());
        
        // Очищаем cookie
        TokenService.clearTokenCookie(res);

        return res.status(204).json();
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

module.exports = router;