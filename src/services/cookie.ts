import { Response } from "express";

/*
 * Сервис для работы с cookie
 */

const {
    SERVER_TYPE
} = process.env as {
    SERVER_TYPE: string
};

interface CookieOptions {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'none' | 'lax';
}

const CookieService = {
    getCookieOptions(maxAge?: number): CookieOptions & { maxAge?: number } {
        return {
            httpOnly: true,
            secure: SERVER_TYPE === 'PROD',
            sameSite: SERVER_TYPE === 'PROD' ? 'none' : 'lax',
            ...(maxAge && { maxAge })
        };
    },

    setCookie(res: Response, name: string, value: string, maxAge?: number) {
        res.cookie(`${name}`, value, this.getCookieOptions(maxAge));
    },

    clearCookie(res: Response, name: string) {
        res.clearCookie(`${name}`, this.getCookieOptions());
    }
};

export default CookieService;