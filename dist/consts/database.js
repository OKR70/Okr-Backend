"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
/*
 * Подключение к базе данных
 */
dotenv_1.default.config();
const { DATABASE_URL } = process.env;
const database = mongoose_1.default.createConnection(DATABASE_URL);
exports.database = database;
database.on('connected', () => {
    console.log('Database connection established');
});
database.on('error', (err) => {
    console.error('The connection to the database was lost:', err);
});
//# sourceMappingURL=database.js.map