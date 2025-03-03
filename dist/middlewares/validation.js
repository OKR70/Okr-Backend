"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmailAndPassword = void 0;
const express_validator_1 = require("express-validator");
/*
 * Проверка email и password пользователя на соответствие регулярным выражениям
 */
exports.validateEmailAndPassword = [
    (0, express_validator_1.body)('login')
        .isEmail()
        .withMessage('Некорректный email')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Пароль должен содержать не менее 8 символов')
        .matches(/[a-z]/).withMessage('Пароль должен содержать хотя бы одну строчную букву')
        .matches(/[A-Z]/).withMessage('Пароль должен содержать хотя бы одну заглавную букву')
        .matches(/\d/).withMessage('Пароль должен содержать хотя бы одну цифру')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Пароль должен содержать хотя бы один специальный символ'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
//# sourceMappingURL=validation.js.map