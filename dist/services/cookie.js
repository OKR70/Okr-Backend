"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Сервис для работы с cookie
 */
const { SERVER_TYPE } = process.env;
const CookieService = {
    getCookieOptions(maxAge) {
        return Object.assign({ httpOnly: true, secure: SERVER_TYPE === 'PROD', sameSite: SERVER_TYPE === 'PROD' ? 'none' : 'lax' }, (maxAge && { maxAge }));
    },
    setCookie(res, name, value, maxAge) {
        res.cookie(`${name}`, value, this.getCookieOptions(maxAge));
    },
    clearCookie(res, name) {
        res.clearCookie(`${name}`, this.getCookieOptions());
    }
};
exports.default = CookieService;
//# sourceMappingURL=cookie.js.map