import {
    Request,
    Response,
    NextFunction
} from 'express';
import { createClient } from 'redis';

const client = createClient();

client.on('error', (error) => console.log('Ошибка подключения к Redis:', error));
client.connect().then(() => {
    console.log('Подключение к Redis установлено');
});

export const cacheResponse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const cacheKey = `cache:${req.url}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
        res.send(JSON.parse(cachedData));
    } else {
        res.locals.cacheKey = cacheKey;
        next();
    }
};