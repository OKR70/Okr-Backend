import express, {
    Request,
    Response,
    NextFunction
} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { createClient } from 'redis';
import swaggerJsdoc from 'swagger-jsdoc';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

/*
 * Главный файл
 */

// Импортируем middlewares
//import { authToken } from './middlewares/authToken';
//import { cacheResponse } from './middlewares/cache';

// Импортирует роуты
import userRoutes from './routes/userRoutes';
import rolesRoutes from './routes/rolesRoutes';

// Загружаем переменные окружения из .env файла
dotenv.config();

const app = express();
const {
    DATABASE_URL
} = process.env;

const HTTP_PORT = process.env.HTTP_PORT as unknown as number;
const HOST = process.env.HOST || 'localhost';

// Подключение к базе данных
mongoose.set('strictQuery', false);
mongoose.connect(DATABASE_URL as string);
const database = mongoose.connection;

database.on('error', (error) => console.log('Database connection error:', error));
database.once('connected', () => console.log('Database Connected'));

// Обработка необработанных исключений
process.on('uncaughtException', (exception) => console.log(`ERROR:`, exception));

// При использовании Nginx
app.set('trust proxy', true);

// Настройка Swagger
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'OKR project API',
            version: '1.0.0',
            description: 'API documentation for OKR project',
        },
        servers: [
            {
                url: `http://localhost:${HTTP_PORT}`,
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Путь к файлам с маршрутами
};

app.use(cookieParser());

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Найстрока, если front-end на другом сервере
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const apiRouter = express.Router();

//apiRouter.use(cacheResponse);

apiRouter.use('/absence', require('./routes/absence'));
apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/file', require('./routes/file'));
apiRouter.use('/users', userRoutes);
apiRouter.use('/roles', rolesRoutes);

// Чтобы все запросы начинались с /api
app.use('/api', apiRouter);

// Обработка страниц 404
app.use('*', require('./routes/notFound'));

// app.use(async (req: Request, res: Response, next: NextFunction) => {
//     if (res.locals.cacheKey) {
//         const client = createClient();
//         await client.connect();
//         await client.set(res.locals.cacheKey, JSON.stringify(res.locals.data), { EX: 60 }); // Кэширование на 1 минуту
//         await client.quit();
//     }
//     next();
// });

// Запуск сервера
app.listen(HTTP_PORT, HOST, () => {
    console.log(`Server is running on http://localhost:${HTTP_PORT}`);
});