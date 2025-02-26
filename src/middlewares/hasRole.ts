import {
    Request,
    Response,
    NextFunction
} from 'express';
import { Role } from '../consts/role';

/*
 * Проверка наличия роли у пользователя
 */

export const hasRole = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user) {
            for (const role of roles) {
                if (req.user.role.includes(role)) {
                    return next();
                }
            }
        }
        return res.status(403).json({ error: 'Недостаточно прав' });
    };
};