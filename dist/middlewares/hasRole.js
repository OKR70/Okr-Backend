"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = void 0;
/*
 * Проверка наличия роли у пользователя
 */
const hasRole = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.user) {
            for (const role of roles) {
                if (req.user.role.includes(role)) {
                    return next();
                }
            }
        }
        res.status(403).json({ error: 'Недостаточно прав' });
        return;
    });
};
exports.hasRole = hasRole;
//# sourceMappingURL=hasRole.js.map