import fs from 'fs';
import { IncomingForm } from 'formidable';

export const uploadFile = (req: any, res: any, next: any) => {
    const uploadDir = './src/files';
    
    // Проверка существования директории
    if (!fs.existsSync(uploadDir)) {
        try {
            // Создание директории, если она не существует
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log(`Директория ${uploadDir} создана`);
        } catch (err) {
            console.error(`Ошибка создания директории ${uploadDir}:`, err);
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

        req.body = fields;
        req.files = files;
        
        next();
    });
};