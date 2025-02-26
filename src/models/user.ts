import {
    Types,
    Schema,
    Document
} from 'mongoose';
import { Role } from '../consts/role';
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
    role: Role[]; /* Роль пользователя
                   * Деканат (dean) - возможность одобрить заявку на пропуск, назначить роли преподавателю
                   * Преподаватель (professor) - возможность смотреть все заявки на пропуски?
                   * Студент (student) - создать/редактировать заявку на пропуск, просматривать свои заявки на пропуск
                   */
}

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