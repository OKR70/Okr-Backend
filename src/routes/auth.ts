import express, {
    Request,
    Response
} from 'express';
import UserModel from '../models/user';
import AdminModel from '../models/admin';
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
        let user;
        if (req.user) {
            user = await UserModel.findOne({ _id: req.user._id }).lean();
        } else {
            user = await AdminModel.findOne({ _id: req.admin!._id }).lean();
        }

        delete user?.password;
        return res.status(200).json({ user });
    } catch (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
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
        password,
        isAdmin
    } = req.body;

    try {
        const existingUser = await UserModel.findOne({ login });
        const existingAdmin = await AdminModel.findOne({ login });
        if (existingUser || existingAdmin) {
            return res.status(409).json({ message: "Пользователь с таким login уже существует" })
        }
        
        // Проверяем пароль
        const hashedPassword = PasswordService.hashPassword(password);

        // Создаем нового пользователя
        let newUser;
        if (!isAdmin) {
            newUser = (
                await UserModel.create({
                    login,
                    fullname,
                    password: hashedPassword
                })
            ).toObject();
        } else {
            newUser = (
                await AdminModel.create({
                    login,
                    password: hashedPassword
                })
            ).toObject();
        }
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
        let user;
        // Находим пользователя по email
        user = await UserModel.findOne({ login }).lean();
        
        if (!user) {
            user = await AdminModel.findOne({ login }).lean();
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
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

export { router as AuthRouter };