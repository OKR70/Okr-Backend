import {
    Request,
    Response,
    NextFunction
} from 'express';

/*
 * Проверка наличия роли у пользователя
 */

export const hasRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        for (const role of roles) {
            if (req.user && role === req.user.role) {
                return next();
            }
        }

        return res.status(403).json({ error: 'Недостаточно прав' });
    };
};