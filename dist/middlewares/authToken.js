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
exports.authToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const token_1 = __importDefault(require("../services/token"));
const { JWT_TOKEN_SECRET } = process.env;
/*
 * Аутентификация
 */
const authToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
        console.log(req.cookies);
        if (!token) {
            res.status(401).json({ message: 'Токен не предоставлен' });
            return;
        }
        jsonwebtoken_1.default.verify(token, JWT_TOKEN_SECRET, (err, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Jwt token истек' });
                }
                return res.status(403).json({ message: 'Недействительный токен' });
            }
            const user = yield user_1.default.findById(payload.userId);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            const isRevoked = yield token_1.default.checkRevoked(payload['jti']);
            if (isRevoked) {
                token_1.default.revokeAllTokensForUser(payload.userId);
                throw new Error('Токен был отозван');
            }
            req.user = user;
            next();
        }));
    }
    catch (error) {
        console.error('Ошибка при проверке токена:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
        return;
    }
});
exports.authToken = authToken;
//# sourceMappingURL=authToken.js.map