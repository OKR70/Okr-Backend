
import { User } from './models/user.js';

/*
 * Глобальная настройка Express
 */

declare global {
    namespace Express {
        interface Request { // Запрос
            user?: User;
        }
        interface Response { // Ответ
            cookie(name: string, value: string, options?: any): this;
        }
    }
}