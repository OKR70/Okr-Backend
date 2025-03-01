import {
    Types,
    Schema,
    Document
} from 'mongoose';
import { Role } from '../consts/consts';
import { database } from '../consts/database';

/*
 * Модель пользователя
 */

// Интерфейс
export interface IUser extends Document {
    _id: Types.ObjectId;
    fullname: String, // ФИО пользователя
    group?: string,
    login: string,
    password?: string
    role: Role[]; /* Роль пользователя
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
const userSchema: Schema<IUser> = new Schema(
    {
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
    },
    {
        versionKey: false
    }
);

const UserModel = database.model<IUser>('User', userSchema);
export default UserModel;