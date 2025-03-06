"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/user"));
const absence_1 = __importDefault(require("../models/absence"));
const hasRole_1 = require("../middlewares/hasRole");
const authToken_1 = require("../middlewares/authToken");
/*
 * Заявки на пропуски Протестировать первые 3 запроса
 */
const router = express_1.default.Router();
/*
 * Создание новой заявки
    "type": "medical",
    "endDate": "2024-12-31",
    "startDate": "2024-12-31",
    "statementInDeanery": ""
 */
router.post('/create', authToken_1.authToken, (0, hasRole_1.hasRole)('student'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, endDate, startDate, documentName, statementInDeanery } = req.body;
    if (!type || !startDate || (type === 'educational' && (!endDate || !documentName))) {
        return res.status(400).json({ message: 'Пропущено одно или несколько из обязательных полей' });
    }
    if (!['educational', 'family', 'medical'].includes(type)) {
        return res.status(400).json({ message: 'Неправильный тип заявки на пропуск' });
    }
    if (endDate && startDate > endDate) {
        return res.status(400).json({ message: 'Дата начала не может быть позже конца' });
    }
    if (documentName) {
        const filesDir = './src/files';
        // Путь к файлу
        const filePath = `${filesDir}/${documentName}`;
        // Проверка существования файла
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Файл не найден' });
        }
    }
    const { _id, fullname } = req.user;
    let newAbsence = new absence_1.default(Object.assign(Object.assign({ type, user: {
            _id,
            fullname
        }, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, (documentName && {
        documentName: documentName
    })), (type === 'family' && { statementInDeanery })));
    try {
        const absence = yield newAbsence.save();
        res.status(201).json(absence);
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
}));
/*
 * Получение всех заявок на пропуск
 */
router.get('/', authToken_1.authToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRoles = req.user.role;
        const query = req.query.query;
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const onlyMine = req.query.onlyMine ? req.query.onlyMine : false;
        const status = req.query.status;
        let filter = {};
        if (status) {
            const statusArray = status.split(',').map(s => s.trim());
            const validStatuses = ['pending', 'approved', 'rejected'];
            if (!statusArray.every(s => validStatuses.includes(s))) {
                return res.status(400).json({ message: 'Недопустимый статус' });
            }
            // Фильтруем только по статусам, которые указаны
            filter.status = { $in: statusArray };
        }
        if (onlyMine && userRoles.includes('student') || userRoles.includes('student') && userRoles.length === 1) {
            filter['user._id'] = new mongoose_1.default.Types.ObjectId(req.user._id);
        }
        const allAbsences = yield absence_1.default.find(filter);
        let filteredAbsences = allAbsences;
        if (query) {
            // Создаем массив объектов с ФИО и id заявки
            const searchItems = yield Promise.all(allAbsences.map((absence) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield user_1.default.findOne({ _id: absence.user._id });
                return {
                    _id: absence._id,
                    fullname: user === null || user === void 0 ? void 0 : user.fullname,
                };
            })));
            // Настройки для Fuse.js
            const fuseOptions = {
                keys: ['fullname'],
                threshold: 0.4,
            };
            const fuse = new fuse_js_1.default(searchItems, fuseOptions);
            const searchResults = fuse.search(query);
            // Возвращаем только id заявок, которые соответствуют поисковому запросу
            const filteredAbsencesIds = searchResults.map(result => result.item._id);
            // Ищем заявки по _id
            filteredAbsences = allAbsences.filter(absence => filteredAbsencesIds.includes(absence._id));
        }
        const totalSize = filteredAbsences.length;
        const paginatedAbsences = filteredAbsences.slice(skip, skip + limit);
        res.status(200).json({
            totalSize,
            items: paginatedAbsences
        });
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
}));
/*
 * Изменение конкретной заявки на пропуск
 */
router.patch('/:id', authToken_1.authToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, endDate, startDate, documentName, statementInDeanery } = req.body;
        if (endDate && startDate > endDate) {
            return res.status(400).json({ message: 'Дата начала не может быть позже конца' });
        }
        const absenceId = req.params.id;
        const userRoles = req.user.role;
        const absence = yield absence_1.default.findById(absenceId);
        if (!absence) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }
        if (userRoles.includes('student') && userRoles.length === 1) {
            if (absence.user._id !== req.user.id || !['educational'].includes(absence.type)) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }
        }
        if (documentName) {
            const filesDir = './src/files';
            // Путь к файлу
            const filePath = `${filesDir}/${documentName}`;
            // Проверка существования файла
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'Файл не найден' });
            }
            absence.documentName = documentName;
        }
        if (status) {
            if (!userRoles.some(role => role === 'dean')) {
                return res.status(403).json({ message: 'Только деканат может подтвердить/одобрить статус заявки' });
            }
            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({ message: 'Неверный статус' });
            }
            absence.status = status;
        }
        else {
            absence.status = 'pending';
        }
        if (startDate) {
            absence.startDate = new Date(startDate);
        }
        if (endDate) {
            absence.endDate = new Date(endDate);
        }
        if (statementInDeanery) {
            absence.statementInDeanery = statementInDeanery;
        }
        // Сохраняем обновленную заявку
        yield absence.save();
        res.status(200).json(absence);
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
}));
/*
 * Получение конкретной заявки на пропуск
 */
router.get('/:id', authToken_1.authToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const absenceId = req.params.id;
        const userRoles = req.user.role;
        const userId = req.user._id;
        const absence = yield absence_1.default.findById(absenceId).lean();
        if (!absence) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }
        // Если пользователь только студент, он может получить только свою заявку
        if (userRoles.includes('student') && userRoles.length === 1) {
            if (absence.user._id.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }
        }
        const documentUrl = `/api/file/${absence.documentName}`;
        delete absence.documentName;
        res.status(200).json({
            absence,
            documentUrl
        });
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
}));
module.exports = router;
//# sourceMappingURL=absence.js.map