"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheResponse = void 0;
const redis_1 = require("redis");
const client = (0, redis_1.createClient)();
client.on('error', (error) => console.log('Ошибка подключения к Redis:', error));
client.connect().then(() => {
    console.log('Подключение к Redis установлено');
});
const cacheResponse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `cache:${req.url}`;
    const cachedData = yield client.get(cacheKey);
    if (cachedData) {
        res.send(JSON.parse(cachedData));
    }
    else {
        res.locals.cacheKey = cacheKey;
        next();
    }
});
exports.cacheResponse = cacheResponse;
//# sourceMappingURL=cache.js.map