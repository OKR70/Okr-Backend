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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const formidable_1 = require("formidable");
/*
 * Сервис для работы с файлами
 */
// Путь к директории с файлами
const filesDir = './src/files';
const FileService = {
    // Загрузить файл на сервер
    uploadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Проверка существования директории
            if (!fs_1.default.existsSync(filesDir)) {
                try {
                    // Создание директории, если она не существует
                    fs_1.default.mkdirSync(filesDir, { recursive: true });
                    console.log(`Директория ${filesDir} создана`);
                }
                catch (err) {
                    console.error(`Ошибка создания директории ${filesDir}:`, err);
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
                try {
                    req.files = files;
                }
                catch (err) {
                    return res.status(400).json({ message: err });
                }
            });
        });
    },
    downloadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const documentName = req.params.documentName;
                // Путь к файлу
                const filePath = `${filesDir}/${documentName}`;
                // Проверка существования файла
                if (!fs_1.default.existsSync(filePath)) {
                    return res.status(404).json({ message: 'Файл не найден' });
                }
                // Чтение файла
                const fileBuffer = fs_1.default.readFileSync(filePath);
                // Возвращение файла в ответе
                res.set("Content-Disposition", `attachment; filename="${documentName}"`);
                res.set("Content-Type", "application/octet-stream");
                res.send(fileBuffer);
            }
            catch (err) {
                res.status(500).json({ message: err });
            }
        });
    }
};
exports.default = FileService;
//# sourceMappingURL=file.js.map