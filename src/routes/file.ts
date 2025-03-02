import express, {
    Request,
    Response
} from 'express';
import * as fs from 'fs';
import { uploadFile } from '../middlewares/uploadFile'

const router = express();

/*
 * Загрузка документа на сервер
 */

router.post(
    '/upload',
    uploadFile,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const document = (Object.entries(
                Object.values(req.files!)[0]
            )[0][1] as any);
            const filename = (document as any).newFilename;

            return res.status(201).json({ filename });
        } catch (err) {
            return res.status(500).json({ message: err })
        }
    }
);

/*
 * Загрузить документ клиенту
 */
router.get(
    '/:filename',
    async (req: Request, res: Response): Promise<any> => {
        try {
            const filename = req.params.filename;

            // Путь к директории с файлами
            const filesDir = './src/files';

            // Путь к файлу
            const filePath = `${filesDir}/${filename}`;

            // Проверка существования файла
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'Файл не найден' });
            }

            // Чтение файла
            const fileBuffer = fs.readFileSync(filePath);

            // Возвращение файла в ответе
            res.set("Content-Disposition", `attachment; filename="${filename}"`);
            res.set("Content-Type", "application/octet-stream");
            res.send(fileBuffer);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }
);

module.exports = router;