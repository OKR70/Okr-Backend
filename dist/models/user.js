"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const database_1 = require("../consts/database");
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Уникальный идентификатор пользователя
 *           example: 64f7a9b1d4b3f5a1c8f8f8f8
 *         fullname:
 *           type: string
 *           description: ФИО пользователя
 *           example: Иван Иванович Иванов
 *         login:
 *           type: string
 *           description: Логин пользователя
 *           example: ivan_ivanov@example1.com
 *         password:
 *           type: string
 *           description: Пароль пользователя (не возвращается в ответах)
 *           example: password123
 *         role:
 *           type: string
 *           enum: [dean, professor, student]
 *           description: Роль пользователя
 *           example: student
 *       required:
 *         - _id
 *         - fullname
 *         - login
 *         - password
 *         - role
 */
// Схема
const userSchema = new mongoose_1.Schema({
    fullname: {
        type: String,
        required: true
    },
    group: String,
    login: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    role: {
        type: [
            {
                type: String,
                enum: ["dean", "professor", "student"]
            }
        ],
        required: true,
        default: ["student"]
    }
}, {
    versionKey: false
});
const UserModel = database_1.database.model('User', userSchema);
exports.default = UserModel;
//# sourceMappingURL=user.js.map