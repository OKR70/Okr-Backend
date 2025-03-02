import { IUser } from './models/user';
import { IGridFsFile } from './consts/consts'

/*
 * Глобальная настройка Express
 */

declare global {
    namespace Express {
        interface Request { // Запрос
            user?: IUser;
            files?: { [key: string]: any };
        }
        interface Response { // Ответ
            cookie(name: string, value: string, options?: any): this;
        }
    }
}