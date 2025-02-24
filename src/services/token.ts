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
    async generateEmailToken(email: string, deviceId: string) {
        const jti = uuidv4();
        const emailTokenExpiresIn = parseExpirationTime(JWT_TOKEN_EXPIRES_IN);
        
        return jwt.sign(
            {
                jti,
                email,
                deviceId
            },
            JWT_SECRET_EMAIL,
            {
                expiresIn: emailTokenExpiresIn
            }
        )
    },

    // Проверка токена на отозванность
    async checkRevoked(jti: string) {
        const revokedToken = await IssuedJWTTokenModel.findOne({ jti });
        return revokedToken ? revokedToken.revoked : false;
    },

    // Обновление токенов
    async updateTokens(refreshToken: string, userIp: string) {
        try {
            const payload: any = jwt.verify(refreshToken, JWT_SECRET_REFRESH);

            const user = await UserModel.findById(payload.userId);
            if (!user) {
                throw new Error('Пользователь не найден');
            }

            // Проверка зарегестрированности устройства
            if (!user.devices || !user.devices.some((device) => device.deviceId === payload.deviceId)) {
                await this.revokeAllTokensForUser(payload.userId);
                throw new Error('Устройство не зарегистрировано у этого пользователя');
            }

            // Проверяем тип токена
            if (payload['type'] !== 'refresh') {
                await this.revokeAllTokensForUser(payload.userId);
                throw new Error('Access token не может быть использован для обновления');
            }

            // Проверяем отозван ли токен
            if (await this.checkRevoked(payload['jti'])) {
                await this.revokeAllTokensForUser(payload.userId);
                throw new Error('Токен был отозван');
            }

            // Отзываем все предыдущие refresh-токены для устройства
            await IssuedJWTTokenModel.updateMany(
                { userId: payload.userId, deviceId: payload.deviceId },
                { revoked: true }
            );

            return await this.generateTokens(payload.userId, payload.deviceId, userIp);
        } catch (error) {
            throw error;
        }
    },

    // // Выход с одного устройства
    // async logoutDevice(userId: string, deviceId: string) {
    //     try {
    //         await IssuedJWTTokenModel.updateMany({ userId, deviceId }, { revoked: true });

    //         const user = await UserModel.findById(userId);

    //         if (user && user.devices) {
    //             const deviceIndex = user.devices.findIndex((device) => device.deviceId === deviceId);

    //             if (deviceIndex !== -1) {
    //                 user.devices.splice(deviceIndex, 1);

    //                 await user.save();
    //             }
    //         }
    //     } catch (error) {
    //         throw error;
    //     }
    // },

    // Выход со всех устройств
    async revokeAllTokensForUser(userId: string) {
        try {
            await IssuedJWTTokenModel.updateMany({ userId }, { revoked: true });
        } catch (error) {
            throw error;
        }
    },

    // Установка cookie
    setRefreshTokenAndDeviceIdCookie(res: Response, refreshToken: string) {
        const maxAge = parseExpirationTime(JWT_TOKEN_EXPIRES_IN);

        CookieService.setCookie(res, 'refreshToken', refreshToken, maxAge);
    },

    // Очищение cookie
    clearRefreshTokenAndDeviceIdCookie(res: Response) {
        CookieService.clearCookie(res, 'refreshToken');
    }
};

export default TokenService;