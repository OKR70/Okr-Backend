import {
    Request,
    Response,
    NextFunction
} from 'express';
import { Role } from '../consts/consts';

/*
 * Проверка наличия роли у пользователя
 */

export const hasRole = (...roles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (req.user) {
            for (const role of roles) {
                    if (req.user.role.includes(role)) {
                    return next();
                }
            }
        }
        res.status(403).json({ error: 'Недостаточно прав' });
        return;
    };
};