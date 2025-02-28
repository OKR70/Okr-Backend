"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
/*
 * Сервис для хэширования и проверки пароля
 */
const { BCRYPT_ROUNDS } = process.env;
const rounds = Number(BCRYPT_ROUNDS);
const PasswordService = {
    // Получить хеш из строки
    hashPassword(password) {
        return bcrypt_1.default.hashSync(password, rounds);
    },
    // Проверить соответствие пароля и хеша
    comparePasswords(password, hash) {
        return bcrypt_1.default.compareSync(password, hash);
    }
};
exports.default = PasswordService;
//# sourceMappingURL=password.js.map