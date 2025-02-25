import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import CookieService from './cookie';
import UserModel  from '../models/user';
import IssuedJWTTokenModel  from '../models/issuedJWTToken';
import { parseExpirationTime } from '../helpers/parseExpirationTime';

/*
 * Сервис для работы с JWT токенами
 */

// Получаем данные для токенов
const {
    JWT_TOKEN_SECRET,
    JWT_TOKEN_EXPIRES_IN,
} = process.env as {
    JWT_TOKEN_SECRET: string,
    JWT_TOKEN_EXPIRES_IN: string
};

const TokenService = {
    // Генерация токена для отправки на Email
    async generateToken(userId: string) {
        const jti = uuidv4();
        const tokenExpiresIn = parseExpirationTime(JWT_TOKEN_EXPIRES_IN);

        await new IssuedJWTTokenModel({
            jti,
            userId,
            expiredAt: Date.now() + tokenExpiresIn
        }).save();

        return jwt.sign(
            {
                jti,
                userId
            },
            JWT_TOKEN_SECRET,
            {
                expiresIn: tokenExpiresIn
            }
        )
    },

    // Проверка токена на отозванность
    async checkRevoked(jti: string) {
        const revokedToken = await IssuedJWTTokenModel.findOne({ jti });
        return revokedToken ? revokedToken.revoked : false;
    },

    // Выход со всех устройств
    async revokeAllTokensForUser(userId: string) {
        try {
            await IssuedJWTTokenModel.updateMany({ userId }, { revoked: true });
        } catch (error) {
            throw error;
        }
    },

    // Установка cookie
    setTokenCookie(res: Response, token: string) {
        const maxAge = parseExpirationTime(JWT_TOKEN_EXPIRES_IN);
        
        CookieService.setCookie(res, 'token', token, maxAge);
    },

    // Очищение cookie
    clearTokenCookie(res: Response) {
        CookieService.clearCookie(res, 'token');
    }
};

export default TokenService;