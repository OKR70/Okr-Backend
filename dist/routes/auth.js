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
exports.AuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user"));
const admin_1 = __importDefault(require("../models/admin"));
const token_1 = __importDefault(require("../services/token"));
const password_1 = __importDefault(require("../services/password"));
const authToken_1 = require("../middlewares/authToken");
const validation_1 = require("../middlewares/validation");
const router = express_1.default.Router();
exports.AuthRouter = router;
/*
 * Авторизация
 */
router.post('/register', validation_1.validateEmailAndPassword, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { login, fullname, password, isAdmin } = req.body;
    try {
        const existingUser = yield user_1.default.findOne({ login });
        const existingAdmin = yield admin_1.default.findOne({ login });
        if (existingUser || existingAdmin) {
            return res.status(409).json({ message: "Пользователь с таким login уже существует" });
        }
        // Проверяем пароль
        const hashedPassword = password_1.default.hashPassword(password);
        // Создаем нового пользователя
        let newUser;
        if (!isAdmin) {
            newUser = new user_1.default({
                login,
                fullname,
                password: hashedPassword
            });
        }
        else {
            newUser = new admin_1.default({
                login,
                password: hashedPassword
            });
        }
        yield newUser.save();
        // Генерируем токен
        const token = yield token_1.default.generateToken(newUser._id.toString());
        token_1.default.setTokenCookie(res, token);
        return res.status(201).json({ user: newUser });
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
}));
/*
 * Роут для авторизации пользователя
 */
router.post('/login', validation_1.validateEmailAndPassword, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { login, isAdmin, password, } = req.body;
    try {
        let user;
        // Находим пользователя по email
        if (!isAdmin) {
            user = yield user_1.default.findOne({ login });
        }
        else {
            user = yield admin_1.default.findOne({ login });
        }
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        // Проверяем пароль
        const isPasswordValid = password_1.default.comparePasswords(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный пароль' });
        }
        // Генерируем токен
        const token = yield token_1.default.generateToken(user._id.toString());
        token_1.default.setTokenCookie(res, token);
        return res.status(201).json({ user: user });
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
}));
router.post('/logout', authToken_1.authToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Отзываем токены в базе данных.
        yield token_1.default.revokeAllTokensForUser(req.user._id.toString());
        // Очищаем cookie
        token_1.default.clearTokenCookie(res);
        return res.status(204).json();
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
}));
//# sourceMappingURL=auth.js.map