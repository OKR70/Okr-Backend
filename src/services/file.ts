import fs from 'fs';
import { IncomingForm } from 'formidable';
import {
    Request,
    Response
} from 'express';

/*
 * Сервис для работы с файлами
 */

// Путь к директории с файлами
const filesDir = './src/files';

const FileService = {
    // Загрузить файл на сервер
    async uploadFile(req: Request, res: Response) {
        // Проверка существования директории
        if (!fs.existsSync(filesDir)) {
            try {
                // Создание директории, если она не существует
                fs.mkdirSync(filesDir, { recursive: true });
                console.log(`Директория ${filesDir} создана`);
            } catch (err) {
                console.error(`Ошибка создания директории ${filesDir}:`, err);
                return res.status(500).json({ message: 'Ошибка создания директории для файлов' });
            }
        }

        const form = new IncomingForm({
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
                req.files = files as any;
            } catch (err) {
                return res.status(400).json({ message: err });
            }
        });
    },

    async downloadFile(req: Request, res: Response) {
        try {
            const documentName = req.params.documentName;

            // Путь к файлу
            const filePath = `${filesDir}/${documentName}`;

            // Проверка существования файла
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'Файл не найден' });
            }

            // Чтение файла
            const fileBuffer = fs.readFileSync(filePath);

            // Возвращение файла в ответе
            res.set("Content-Disposition", `attachment; filename="${documentName}"`);
            res.set("Content-Type", "application/octet-stream");
            res.send(fileBuffer);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }
};

export default FileService;