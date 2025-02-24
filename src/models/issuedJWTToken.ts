import {
    Schema,
    Document
} from 'mongoose';
import { database } from '../consts/database';

/*
 * Модель выданных JWT токенов
 */

// Интерфейс
export interface IIssuedJWTToken extends Document {
    jti: string; // Уникальный идентификатор токена
    userId: string; // ID пользователя, которому выдан токен
    //deviceId: string; // Идентификатор устройства
    revoked: boolean; // Статус отзыва токена
    expiredAt: Date; // Время истечения токена
}

// Схема
const issuedJWTTokenSchema: Schema<IIssuedJWTToken> = new Schema(
    {
        jti: { 
            type: String,
            required: true,
            unique: true
        },
        userId: { 
            type: String,
            required: true 
        },
        // deviceId: { 
        //     type: String,
        //     required: true
        // },
        revoked: { 
            type: Boolean,
            default: false // По умолчанию токен не отозван
        },
        expiredAt: { 
            type: Date,
            required: true
        }
    },
    {
        versionKey: false
    }
);

const IssuedJWTTokenModel = database.model<IIssuedJWTToken>('IssuedJWTToken', issuedJWTTokenSchema);
export default IssuedJWTTokenModel;