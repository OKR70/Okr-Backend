import express, { 
    Request,
    Response
} from 'express';

const router = express.Router();

/*
 * Обработка несуществующих страниц
 */

router.use('*', (_: Request, res: Response) => {
    res.status(404).json({
        type: 'error',
        message: 'Страница не найдена'
    });
});

module.exports = router;