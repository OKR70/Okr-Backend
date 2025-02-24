import {
    Request,
    Response,
    NextFunction
} from 'express';
import {
    body,
    ValidationChain,
    validationResult
} from 'express-validator';

/*
 * Проверка email и password пользователя на соответствие регулярным выражениям
 */

export const validateEmailAndPassword: Array<ValidationChain | ((req: Request, res: Response, next: NextFunction) => void)> = [
    body('email')
        .isEmail()
        .withMessage('Некорректный email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Пароль должен содержать не менее 8 символов')
        .matches(/[a-z]/).withMessage('Пароль должен содержать хотя бы одну строчную букву')
        .matches(/[A-Z]/).withMessage('Пароль должен содержать хотя бы одну заглавную букву')
        .matches(/\d/).withMessage('Пароль должен содержать хотя бы одну цифру')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Пароль должен содержать хотя бы один специальный символ'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];