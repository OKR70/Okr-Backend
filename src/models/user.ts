import {
    Types,
    Schema,
    Document
} from 'mongoose';
import { database } from '../consts/database';

/*
 * Модель пользователя
 */

// Интерфейс
export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string // Имя пользователя
    surname: string // Фамилия пользователя
    login: string
    password: string
    role: ("dean" | "professor" | "student")[]; /* Роль пользователя
                                                * Деканат (dean) - возможность одобрить заявку на пропуск, назначить роли преподавателю
                                                * Преподаватель (professor) - возможность смотреть все заявки на пропуски?
                                                * Студент (student) - создать/редактировать заявку на пропуск, просматривать свои заявки на пропуск
                                                */
}

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
 *         name:
 *           type: string
 *           description: Имя пользователя
 *           example: Иван
 *         surname:
 *           type: string
 *           description: Фамилия пользователя
 *           example: Иванов
 *         login:
 *           type: string
 *           description: Логин пользователя
 *           example: ivan_ivanov
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
 *         - name
 *         - surname
 *         - login
 *         - password
 *         - role
 */

// Схема
const userSchema: Schema<IUser> = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        surname: {
            type: String,
            required: true
        },
        login: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
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
    },
    {
        versionKey: false
    }
);

const UserModel = database.model<IUser>('User', userSchema);
export default UserModel;