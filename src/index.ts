import express from 'express';
import cors from 'cors';
//import yaml from 'js-yaml';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
//import expressUseragent from 'express-useragent';

/*
 * Главный файл
 */

// Импортируем middlewares
//import { authToken } from './middlewares/authToken';

// Импортирует роуты
import { AuthRouter } from './routes/auth';
import { AbsenceRouter } from './routes/absence';
import { NotFoundRouter } from './routes/notFound';
import userRoutes from './routes/userRoutes';

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

apiRouter.use('/absence', AbsenceRouter);
apiRouter.use('/auth', AuthRouter);
apiRouter.use('/users', userRoutes);

// Чтобы все запросы начинались с /api
app.use('/api', apiRouter);

// Обработка страниц 404
app.use('*', NotFoundRouter);

// Запуск сервера
app.listen(HTTP_PORT, HOST, () => {
    console.log(`Server is running on http://localhost:${HTTP_PORT}`);
});