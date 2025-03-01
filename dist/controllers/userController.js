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
exports.getUserById = exports.getAllUsers = void 0;
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
/*
 * Получить всех пользователей
 */
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const role = req.query.role;
        const search = req.query.search;
        if (page < 1 || limit < 1) {
            res.status(400).json({ message: 'Параметры page и limit должны быть положительными числами' });
            return;
        }
        const query = {};
        if (role) {
            query.role = role;
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
        if (page > totalPages) {
            res.status(404).json({ message: 'Страница не существует' });
            return;
        }
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
//# sourceMappingURL=userController.js.map