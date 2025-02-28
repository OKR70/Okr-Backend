// import {
//     Types,
//     Schema,
//     Document
// } from 'mongoose';
// import { database } from '../consts/database';

// /*
//  * Модель пользователя
//  */

// // Интерфейс
// export interface IAdmin extends Document {
//     _id: Types.ObjectId;
//     fullname: String, // ФИО пользователя
//     login: string
//     password: string
// }

// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     User:
//  *       type: object
//  *       properties:
//  *         _id:
//  *           type: string
//  *           description: Уникальный идентификатор пользователя
//  *           example: 64f7a9b1d4b3f5a1c8f8f8f8
//  *         fullname:
//  *           type: string
//  *           description: ФИО пользователя
//  *           example: Иван Иванович Иванов
//  *         login:
//  *           type: string
//  *           description: Логин пользователя
//  *           example: ivan_ivanov@example1.com
//  *         password:
//  *           type: string
//  *           description: Пароль пользователя (не возвращается в ответах)
//  *           example: password123
//  *         role:
//  *           type: string
//  *           enum: [dean, professor, student]
//  *           description: Роль пользователя
//  *           example: student
//  *       required:
//  *         - _id
//  *         - fullname
//  *         - login
//  *         - password
//  *         - role
//  */

// // Схема
// const adminSchema: Schema<IAdmin> = new Schema(
//     {
//         fullname: {
//             type: String,
//             required: true
//         },
//         login: {
//             type: String,
//             unique: true,
//             required: true
//         },
//         password: {
//             type: String,
//             required: true
//         },
//         role: { 
//             type: [
//                 { 
//                     type: String,
//                     enum: ["dean", "professor", "student"]
//                 }
//             ],
//             required: true,
//             default: ["student"]
//         }
//     },
//     {
//         versionKey: false
//     }
// );

// const UserModel = database.model<IAdmin>('User', adminSchema);
// export default UserModel;