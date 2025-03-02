"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
//import yaml from 'js-yaml';
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
//import expressUseragent from 'express-useragent';
/*
 * Главный файл
 */
// Импортируем middlewares
//import { authToken } from './middlewares/authToken';
// Импортирует роуты
const auth_1 = require("./routes/auth");
const absence_1 = require("./routes/absence");
const notFound_1 = require("./routes/notFound");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// Загружаем переменные окружения из .env файла
dotenv_1.default.config();
const app = (0, express_1.default)();
const { DATABASE_URL } = process.env;
const HTTP_PORT = process.env.HTTP_PORT;
const HOST = process.env.HOST || 'localhost';
// Подключение к базе данных
mongoose_1.default.set('strictQuery', false);
mongoose_1.default.connect(DATABASE_URL);
const database = mongoose_1.default.connection;
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
app.use((0, cookie_parser_1.default)());
const specs = (0, swagger_jsdoc_1.default)(options);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
// Найстрока, если front-end на другом сервере
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const apiRouter = express_1.default.Router();
apiRouter.use('/absence', absence_1.AbsenceRouter);
apiRouter.use('/auth', auth_1.AuthRouter);
apiRouter.use('/users', userRoutes_1.default);
// Чтобы все запросы начинались с /api
app.use('/api', apiRouter);
// Обработка страниц 404
app.use('*', notFound_1.NotFoundRouter);
// Запуск сервера
app.listen(HTTP_PORT, HOST, () => {
    console.log(`Server is running on http://localhost:${HTTP_PORT}`);
});
//# sourceMappingURL=index.js.map