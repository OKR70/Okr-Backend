import {
    Request,
    Response,
    NextFunction
} from 'express';
import UserModel from '../models/user';
import TokenService from '../services/token';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

const {
    JWT_TOKEN_SECRET
} = process.env as {
    JWT_TOKEN_SECRET: string
};

/*
 * Аутентификация
 */

export const authToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.token

        if (!token) {
            res.status(401).json({ message: 'Токен не предоставлен' });
            return;
        }

        jwt.verify(token, JWT_TOKEN_SECRET, async (err: JsonWebTokenError | null, payload: any) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Jwt token истек' });
                }
                return res.status(403).json({ message: 'Недействительный токен' });
            }

            const user = await UserModel.findById(payload.userId).lean();
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });

            }
            
            const isRevoked = await TokenService.checkRevoked(payload['jti']);
            if (isRevoked) {
                TokenService.revokeAllTokensForUser(payload.userId);
                return res.status(401).json({ message: 'Токен был отозван' });
            }
            
            delete user.password;
            req.user = user;
            
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
        return;
    }
};