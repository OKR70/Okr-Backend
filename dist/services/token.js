"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const cookie_1 = __importDefault(require("./cookie"));
const issuedJWTToken_1 = __importDefault(require("../models/issuedJWTToken"));
const parseExpirationTime_1 = require("../helpers/parseExpirationTime");
/*
 * Сервис для работы с JWT токенами
 */
// Получаем данные для токенов
const { JWT_TOKEN_SECRET, JWT_TOKEN_EXPIRES_IN, } = process.env;
const TokenService = {
    // Генерация токена для отправки на Email
    generateToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const jti = (0, uuid_1.v4)();
            const tokenExpiresIn = (0, parseExpirationTime_1.parseExpirationTime)(JWT_TOKEN_EXPIRES_IN);
            yield new issuedJWTToken_1.default({
                jti,
                userId,
                expiredAt: Date.now() + tokenExpiresIn
            }).save();
            return jsonwebtoken_1.default.sign({
                jti,
                userId
            }, JWT_TOKEN_SECRET, {
                expiresIn: tokenExpiresIn
            });
        });
    },
    // Проверка токена на отозванность
    checkRevoked(jti) {
        return __awaiter(this, void 0, void 0, function* () {
            const revokedToken = yield issuedJWTToken_1.default.findOne({ jti });
            return revokedToken ? revokedToken.revoked : false;
        });
    },
    // Выход со всех устройств
    revokeAllTokensForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield issuedJWTToken_1.default.updateMany({ userId }, { revoked: true });
            }
            catch (error) {
                throw error;
            }
        });
    },
    // Установка cookie
    setTokenCookie(res, token) {
        const maxAge = (0, parseExpirationTime_1.parseExpirationTime)(JWT_TOKEN_EXPIRES_IN);
        cookie_1.default.setCookie(res, 'token', token, maxAge);
    },
    // Очищение cookie
    clearTokenCookie(res) {
        cookie_1.default.clearCookie(res, 'token');
    }
};
exports.default = TokenService;
//# sourceMappingURL=token.js.map