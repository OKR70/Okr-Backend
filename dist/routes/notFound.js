"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
/*
 * Обработка несуществующих страниц
 */
router.use('*', (_, res) => {
    res.status(404).json({
        type: 'error',
        message: 'Страница не найдена'
    });
});
module.exports = router;
//# sourceMappingURL=notFound.js.map