import { IUser } from './models/user';
import { IAdmin } from './models/admin';
import { IGridFsFile } from './consts/consts'

/*
 * Глобальная настройка Express
 */

declare global {
    namespace Express {
        interface Request { // Запрос
            user?: IUser;
            admin?: IAdmin;
            files?: { [key: string]: any };
        }
        interface Response { // Ответ
            cookie(name: string, value: string, options?: any): this;
        }
    }
}