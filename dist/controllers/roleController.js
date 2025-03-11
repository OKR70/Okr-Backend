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
exports.removeRoleFromUser = exports.addRoleToUser = void 0;
const user_1 = __importDefault(require("../models/user"));
/**
 * Добавить роль пользователю
 */
const addRoleToUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, role } = req.body;
        // Проверка, что userId и role переданы
        if (!userId || !role) {
            res.status(400).json({ message: 'Необходимо указать userId и role' });
            return;
        }
        // Проверка, что роль является допустимой
        const validRoles = ['professor', 'student'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: 'Недопустимая роль' });
            return;
        }
        // Находим пользователя и добавляем роль
        const user = yield user_1.default.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }
        // Проверяем, что роль еще не добавлена
        if (user.role.includes(role)) {
            res.status(400).json({ message: 'Роль уже добавлена' });
            return;
        }
        // Добавляем роль
        user.role.push(role);
        yield user.save();
        // Возвращаем пользователя без пароля
        res.status(200).json({ message: 'Роль успешно добавлена', user });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Ошибка при добавлении роли', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Ошибка при добавлении роли', error: 'Неизвестная ошибка' });
        }
    }
});
exports.addRoleToUser = addRoleToUser;
/**
 * Удалить роль пользователя
 */
const removeRoleFromUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, role } = req.body;
        // Проверка, что userId и role переданы
        if (!userId || !role) {
            res.status(400).json({ message: 'Необходимо указать userId и role' });
            return;
        }
        // Проверка, что роль является допустимой
        const validRoles = ['professor', 'student'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: 'Недопустимая роль' });
            return;
        }
        // Находим пользователя и удаляем роль
        const user = yield user_1.default.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }
        // Проверяем, что роль существует
        if (!user.role.includes(role)) {
            res.status(400).json({ message: 'Роль не найдена' });
            return;
        }
        // Удаляем роль
        user.role = user.role.filter((r) => r !== role);
        yield user.save();
        // Возвращаем пользователя без пароля
        res.status(200).json({ message: 'Роль успешно удалена', user });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Ошибка при удалении роли', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Ошибка при удалении роли', error: 'Неизвестная ошибка' });
        }
    }
});
exports.removeRoleFromUser = removeRoleFromUser;
//# sourceMappingURL=roleController.js.map