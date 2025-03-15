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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const multer_1 = __importDefault(require("multer"));
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const absence_1 = __importDefault(require("../models/absence"));
const hasRole_1 = require("../middlewares/hasRole");
const authToken_1 = require("../middlewares/authToken");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/files');
    },
    filename: (req, file, cb) => {
        const fileExtension = path_1.default.extname(file.originalname); // Получаем расширение файла
        const newFileName = `${(0, uuid_1.v4)()}${fileExtension}`; // Генерируем новое имя с расширением
        cb(null, newFileName);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
/*
 * Заявки на пропуски
 */
const router = express_1.default.Router();
/*
 * Создание новой заявки
 */
router.post('/create', authToken_1.authToken, (0, hasRole_1.hasRole)('student'), upload.single('document'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, endDate, startDate, statementInDeanery } = req.body;
    if (!type || !startDate || (type === 'educational' && (!endDate || !req.file))) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: 'Пропущено одно или несколько из обязательных полей' });
    }
    if (!['educational', 'family', 'medical'].includes(type)) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: 'Неправильный тип заявки на пропуск' });
    }
    if (endDate && startDate > endDate) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: 'Дата начала не может быть позже конца' });
    }
    let documentName;
    if (req.file) {
        documentName = req.file.filename;
    }
    const { _id, fullname } = req.user;
    const startDateToDate = new Date(startDate);
    let absence = new absence_1.default(Object.assign(Object.assign({ type, user: {
            _id,
            fullname
        }, startDate: startDateToDate, endDate: endDate ? new Date(endDate) : new Date(startDateToDate.getTime() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now()) }, (documentName && { documentName })), (type === 'family' && statementInDeanery && { statementInDeanery })));
    try {
        yield absence.save();
        const _a = absence.toObject(), { createdAt } = _a, absenceResponse = __rest(_a, ["createdAt"]);
        res.status(201).json({ absence: absenceResponse });
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
        const search = req.query.search;
        const page = parseInt(req.query.page) || 1;
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
        const allAbsences = yield absence_1.default.find(filter)
            .sort({ createdAt: -1 }) // Сортируем в обратном порядке по createdAt
            .select('-createdAt');
        let filteredAbsences = allAbsences;
        if (search) {
            // Создаем массив объектов с ФИО и id заявки
            const searchItems = yield Promise.all(allAbsences.map((absence) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                return {
                    _id: absence._id,
                    fullname: (_a = absence.user) === null || _a === void 0 ? void 0 : _a.fullname,
                };
            })));
            // Настройки для Fuse.js
            const fuseOptions = {
                keys: ['fullname'],
                threshold: 0.4,
            };
            const fuse = new fuse_js_1.default(searchItems, fuseOptions);
            const searchResults = fuse.search(search);
            // Возвращаем только id заявок, которые соответствуют поисковому запросу
            const filteredAbsencesIds = searchResults.map(result => result.item._id);
            // Ищем заявки по _id
            filteredAbsences = allAbsences.filter(absence => filteredAbsencesIds.includes(absence._id));
            filteredAbsences.sort((a, b) => {
                var _a, _b, _c, _d;
                if (((_a = a.user) === null || _a === void 0 ? void 0 : _a.fullname) < ((_b = b.user) === null || _b === void 0 ? void 0 : _b.fullname))
                    return -1;
                if (((_c = a.user) === null || _c === void 0 ? void 0 : _c.fullname) > ((_d = b.user) === null || _d === void 0 ? void 0 : _d.fullname))
                    return 1;
                return 0;
            });
        }
        const totalSize = filteredAbsences.length;
        const paginatedAbsences = filteredAbsences.slice((page - 1) * limit, page * limit);
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
router.patch('/:id', authToken_1.authToken, upload.single('document'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, status, endDate, startDate, statementInDeanery } = req.body;
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
        if (req.file) {
            absence.documentName = req.file.filename;
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
        if (type && !['educational', 'family', 'medical'].includes(type)) {
            return res.status(400).json({ message: 'Неправильный тип заявки на пропуск' });
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
        const _a = absence.toObject(), { createdAt } = _a, absenceResponse = __rest(_a, ["createdAt"]);
        res.status(200).json(absenceResponse);
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
        const hasDocument = absence.documentName !== null && absence.documentName !== undefined;
        const documentUrl = `/file/${absence.documentName}`;
        delete absence.documentName, absence.createdAt;
        res.status(200).json(Object.assign({ absence,
            hasDocument }, (hasDocument && { documentUrl })));
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
}));
module.exports = router;
//# sourceMappingURL=absence.js.map