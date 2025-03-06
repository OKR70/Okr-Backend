import express, {
    Request,
    Response
} from 'express';
import FileService from '../services/file';
import { authToken } from '../middlewares/authToken';

const router = express();

/*
 * Получить документ с сервера
 */
router.get(
    '/:documentName',
    authToken,
    async (req: Request, res: Response): Promise<any> => {
        try {
            await FileService.downloadFile(req, res);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }
);

module.exports = router;