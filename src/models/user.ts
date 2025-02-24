import {
    Types,
    Schema,
    Document
} from 'mongoose';
import { database } from '../consts/database';

/*
 * Модель устройства, с которого заходил пользователь
 */

// Интерфейс
export interface IDevice {
    deviceId: string; // Уникальный идентификатор устройства
    ip: string; // IP-адрес, с которого заходил пользователь
}

// Схема
const deviceSchema: Schema<IDevice> = new Schema({
    deviceId: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    }
});


/*
 * Модель пользователя
 */

// Интерфейс
export interface IUser extends Document {
    _id: Types.ObjectId;
    email?: string;
    //phone?: string;
    password?: string; // Хэшированный пароль пользователя
    devices?: IDevice[]; // Устройства пользователя
    role?: string; /* Роль пользователя (если это обычный пользователь, то роль отсутствует)
                    * Доступные роли:
                    * 1. Администратор (admin) - все страницы
                    */
    createdAt?: Date;
    updatedAt?: Date;
    isVerified?: Boolean; // Подтвердил ли пользователь аккаунт через почту
    lastVisitAt?: Date; // Дата последнего входа пользователя
    messageCount?: Number; // Количество отправленных пользователем сообщений
    verifiedTokenJti?: String; // Уникальный идентификатор токена для подтверждения email
}

// Схема
const userSchema: Schema<IUser> = new Schema(
    {
        email: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        // phone: {
        //     type: String,
        //     unique: true,
        //     sparse: true,
        //     trim: true,
        // },
        password: {
            type: String,
        },
        devices: [
            deviceSchema
        ],
        role: { 
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }, 
        isVerified: {
            type: Boolean,
            default: false
        },
        lastVisitAt: {
            type: Date,
            default: Date.now
        },
        verifiedTokenJti: {
            type: String,
        },
        messageCount :{
            type: Number,
            default: 0
        }
    },
    {
        versionKey: false
    }
);

const UserModel = database.model<IUser>('User', userSchema);
export default UserModel;