import express, {
    Request,
    Response
} from 'express';
import * as fs from 'fs';
import { uploadFile } from '../middlewares/uploadFile'
import { authToken } from '../middlewares/authToken';

const router = express();

/*
 * Загрузка документа на сервер
 */

router.post(
    '/upload',
    authToken,
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
    '/:documentName',
    authToken,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const documentName = req.params.documentName;

            // Путь к директории с файлами
            const filesDir = './src/files';

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
);

module.exports = router;