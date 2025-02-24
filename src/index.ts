import express from 'express';
import cors from 'cors';
//import yaml from 'js-yaml';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
//import cookieParser from 'cookie-parser';
//import expressUseragent from 'express-useragent';

/*
 * Главный файл
 */

// Импортируем middlewares
//import { authToken } from './middlewares/authToken';

// Импортирует роуты
import { AuthRouter } from './routes/auth';
import { NotFoundRouter } from './routes/notFound';

// Загружаем переменные окружения из .env файла
dotenv.config();

const app = express();
const {
    HTTP_PORT,
    DATABASE_URL
} = process.env;

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

// Найстрока, если front-end на другом сервере
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const apiRouter = express.Router();

apiRouter.use('/auth', AuthRouter);

// Чтобы все запросы начинались с /api
app.use('/api', apiRouter);

// Обработка страниц 404
app.use('*', NotFoundRouter);

// Запуск сервера
app.listen(HTTP_PORT, () => {
    console.log(`Server is running on http://localhost:${HTTP_PORT}`);
});