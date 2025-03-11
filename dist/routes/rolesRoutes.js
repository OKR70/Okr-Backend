"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleController_1 = require("../controllers/roleController");
const hasRole_1 = require("../middlewares/hasRole");
const authToken_1 = require("../middlewares/authToken");
const router = express_1.default.Router();
/**
 * Добавить роль пользователю
 */
router.patch('/add', authToken_1.authToken, (0, hasRole_1.hasRole)('dean'), roleController_1.addRoleToUser);
/**
 * Удалить роль рользователя
 */
router.delete('/delete', authToken_1.authToken, (0, hasRole_1.hasRole)('dean'), roleController_1.removeRoleFromUser);
exports.default = router;
//# sourceMappingURL=rolesRoutes.js.map