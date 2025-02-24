import bcrypt from 'bcrypt';

/*
 * Сервис для хэширования и проверки пароля
 */

const { BCRYPT_ROUNDS } = process.env;

const rounds: number = Number(BCRYPT_ROUNDS);

const PasswordService = {
    // Получить хеш из строки
    hashPassword(password: string): string {
        return bcrypt.hashSync(password, rounds);
    },

    // Проверить соответствие пароля и хеша
    comparePasswords(password: string, hash: string): boolean {
        return bcrypt.compareSync(password, hash);
    }
};

export default PasswordService;
