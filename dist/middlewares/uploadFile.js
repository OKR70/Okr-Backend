"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const fs_1 = __importDefault(require("fs"));
const formidable_1 = require("formidable");
const uploadFile = (req, res, next) => {
    const uploadDir = './src/files';
    // Проверка существования директории
    if (!fs_1.default.existsSync(uploadDir)) {
        try {
            // Создание директории, если она не существует
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
            console.log(`Директория ${uploadDir} создана`);
        }
        catch (err) {
            console.error(`Ошибка создания директории ${uploadDir}:`, err);
            return res.status(500).json({ message: 'Ошибка создания директории для файлов' });
        }
    }
    const form = new formidable_1.IncomingForm({
        uploadDir: './src/files', // Директория для сохранения файлов
        keepExtensions: true, // Сохранять расширения файлов
        maxFileSize: 15 * 1024 * 1024, // Максимальный размер файла (15MB)
        allowEmptyFiles: false // Запретить пустые файлы
    });
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Ошибка парсинга файла:', err);
            return res.status(500).json({ message: 'Ошибка парсинга файла' });
        }
        req.body = fields;
        req.files = files;
        next();
    });
};
exports.uploadFile = uploadFile;
//# sourceMappingURL=uploadFile.js.map