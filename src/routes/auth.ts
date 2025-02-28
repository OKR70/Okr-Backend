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

router.post(
    '/register',
    validateEmailAndPassword,
    async (req: Request, res: Response): Promise<any> => {
    const {
        login,
        fullname,
        password,
    } = req.body;

    try {

        // Проверяем пароль
        const hashedPassword = PasswordService.hashPassword(password);

        // Создаем нового пользователя
        const newUser = await new UserModel({
            login,
            fullname,
            password: hashedPassword
        }).save();
        
        // Генерируем токены
        const token = await TokenService.generateToken(newUser._id.toString());
        
        TokenService.setTokenCookie(res, token);

        return res.status(201).json({
            user: newUser
        });
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
        password
    } = req.body;

    try {
        // Находим пользователя по email
        const user = await UserModel.findOne({ login });

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Проверяем пароль
        const isPasswordValid = PasswordService.comparePasswords(password, user.password!);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный пароль' });
        }

        // Генерируем токены
        const token = await TokenService.generateToken(user._id.toString());
        
        TokenService.setTokenCookie(res, token);
        return res.status(201).json({
            user: user
        });
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

export { router as AuthRouter };