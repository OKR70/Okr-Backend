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
exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const user_1 = __importDefault(require("../models/user"));
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить всех пользователей
 *     description: Возвращает список всех пользователей, исключая их пароли.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Успешный запрос. Возвращает массив пользователей.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Ошибка сервера. Не удалось получить пользователей.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ошибка при получении пользователей
 *                 error:
 *                   type: string
 *                   example: Произошла ошибка на сервере
 */
/**
 * Получить всех пользователей
 */
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const roles = req.query.role ? (Array.isArray(req.query.role) ? req.query.role : [req.query.role]) : undefined;
        const group = req.query.group;
        const search = req.query.search;
        if (page < 1 || limit < 1) {
            res.status(400).json({ message: 'Параметры page и limit должны быть положительными числами' });
            return;
        }
        const query = {};
        if (roles) {
            query.role = { $in: roles };
        }
        if (group) {
            query.group = group;
        }
        if (search) {
            query.$or = [
                { fullname: { $regex: search, $options: 'i' } }
            ];
        }
        const users = yield user_1.default.find(query)
            .select('-password')
            .skip((page - 1) * limit)
            .limit(limit);
        const totalUsers = yield user_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);
        res.status(200).json({
            data: users,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages,
            },
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Ошибка при получении пользователей', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Ошибка при получении пользователей', error: 'Неизвестная ошибка' });
        }
    }
});
exports.getAllUsers = getAllUsers;
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     description: Возвращает информацию о пользователе по его ID, исключая пароль.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID пользователя
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Успешный запрос. Возвращает объект пользователя.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Пользователь не найден
 *       500:
 *         description: Ошибка сервера. Не удалось получить пользователя.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ошибка при получении пользователя
 *                 error:
 *                   type: string
 *                   example: Произошла ошибка на сервере
 */
/*
 * Получить пользователя по ID
 */
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield user_1.default.findById(userId).select('-password');
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Ошибка при получении пользователя', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Ошибка при получении пользователя', error: 'Неизвестная ошибка' });
        }
    }
});
exports.getUserById = getUserById;
/**
 * Редактировать пользователя
 */
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { fullname, group, role } = req.body;
        // Проверка что передан хотя бы один параметр
        if (!fullname && !group && !role) {
            res.status(400).json({ message: 'Необходимо указать хотя бы одно поле для обновления' });
            return;
        }
        const user = yield user_1.default.findById(id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }
        // Обновляем поля
        if (fullname)
            user.fullname = fullname;
        if (group)
            user.group = group;
        // Проверка и обновление ролей
        if (role) {
            // Проверка, что роль является массивом
            if (!Array.isArray(role)) {
                res.status(400).json({ message: 'Роль должна быть передана в виде массива' });
                return;
            }
            // Проверка на допустимые роли
            const validRoles = ['dean', 'professor', 'student'];
            for (const r of role) {
                if (!validRoles.includes(r)) {
                    res.status(400).json({ message: `Недопустимая роль: ${r}` });
                    return;
                }
            }
            // Проверка на роль dean
            const hasDeanRole = user.role.includes('dean'); // Пользователь уже имеет роль dean
            const requestHasDeanRole = role.includes('dean'); // Запрос содержит роль dean
            // Если пользователь уже имеет роль dean, но запрос её не содержит
            if (hasDeanRole && !requestHasDeanRole) {
                res.status(400).json({ message: 'Нельзя удалить роль "dean"' });
                return;
            }
            // Если пользователь не имеет роль dean, но запрос её содержит
            if (!hasDeanRole && requestHasDeanRole) {
                res.status(400).json({ message: 'Нельзя добавить роль "dean"' });
                return;
            }
            // Обновляем роли
            user.role = role;
        }
        // Сохраняем изменения
        yield user.save();
        // Возвращаем обновленного пользователя без пароля
        res.status(200).json({ message: 'Пользователь успешно обновлен', user });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Ошибка при обновлении пользователя', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Ошибка при обновлении пользователя', error: 'Неизвестная ошибка' });
        }
    }
});
exports.updateUser = updateUser;
//# sourceMappingURL=userController.js.map