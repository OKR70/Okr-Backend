"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = void 0;
/*
 * Проверка наличия роли у пользователя
 */
const hasRole = (...roles) => {
    return (req, res, next) => {
        for (const role of roles) {
            if (req.user && role === req.user.role) {
                return next();
            }
        }
        return res.status(403).json({ error: 'Недостаточно прав' });
    };
};
exports.hasRole = hasRole;
//# sourceMappingURL=hasRole.js.map