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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsenceRouter = void 0;
const express_1 = __importDefault(require("express"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const user_1 = __importDefault(require("../models/user"));
const absence_1 = __importDefault(require("../models/absence"));
const hasRole_1 = require("../middlewares/hasRole");
const authToken_1 = require("../middlewares/authToken");
// import { uploadFile } from '../middlewares/uploadFile'
/*
 * Заявки на пропуски
 */
const router = express_1.default.Router();
exports.AbsenceRouter = router;
/*
 * Создание новой заявки
 */
router.post('/create', authToken_1.authToken, (0, hasRole_1.hasRole)('student'), 
// uploadFile,
(req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { type, endDate, startDate, estimatedEndDate, statementInDeanery, } = req.body;
    if (!type || !startDate || !endDate) {
        return res.status(400).json({ message: 'Пропущено одно или несколько из обязательных полей' });
    }
    if (type === 'educational' && !((_a = req.files) === null || _a === void 0 ? void 0 : _a.document)) {
        return res.status(400).json({ message: 'Документ обязателен для учебной заявки' });
    }
    const { _id, fullname } = req.user;
    let newAbsence = new absence_1.default(Object.assign({ type, user: {
            _id,
            fullname
        }, startDate: new Date(startDate), endDate: new Date(endDate) }, (((_b = req.files) === null || _b === void 0 ? void 0 : _b.document) && {
        document: {
            filename: req.files.document.name,
            data: req.files.document.data,
            contentType: req.files.document.type
        }
    })));
    try {
        switch (type) {
            case 'medical':
                newAbsence.estimatedEndDate = estimatedEndDate ? new Date(estimatedEndDate) : undefined;
                break;
            case 'family':
                newAbsence.statementInDeanery = statementInDeanery;
                break;
            default:
                return res.status(400).json({ message: 'Неправильный тип заявки' });
        }
        const absence = yield newAbsence.save();
        res.status(201).json(absence);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
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
        let finalAbsences;
        let finalTotalSize = 0;
        if (userRoles.some(role => ['dean', 'professor'].includes(role))) {
            const [absences, totalSize] = yield Promise.all([
                absence_1.default.find(),
                absence_1.default.countDocuments()
            ]);
            finalAbsences = absences;
            finalTotalSize = totalSize;
        }
        else if (userRoles.includes('student')) {
            const [absences, totalSize] = yield Promise.all([
                absence_1.default.find({ userId: req.user.id }),
                absence_1.default.countDocuments({ userId: req.user.id }),
            ]);
            finalAbsences = absences;
            finalTotalSize = totalSize;
        }
        if (query) {
            // Создаем массив объектов с ФИО и id заявки
            const searchItems = yield Promise.all(finalAbsences.map((absence) => __awaiter(void 0, void 0, void 0, function* () {
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
            const filteredAbsences = searchResults.map(result => result.item._id);
            // Получаем заявки по id с пагинацией и общее количество найденных документов
            const [paginatedAbsences, totalSize] = yield Promise.all([
                absence_1.default.find({ _id: { $in: filteredAbsences } })
                    .skip(skip)
                    .limit(limit),
                absence_1.default.countDocuments({ _id: { $in: filteredAbsences } })
            ]);
            finalAbsences = paginatedAbsences;
            finalTotalSize = totalSize;
        }
        res.status(200).json({
            totalSize: finalTotalSize,
            items: finalAbsences
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}));
router.patch('/:id', authToken_1.authToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const absenceId = req.params.id;
        const userRoles = req.user.role;
        const absence = yield absence_1.default.findById(absenceId);
        if (!absence) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }
        if (userRoles.includes('student') && !userRoles.includes('dean')) {
            if (userRoles.includes('student') && (absence.user._id !== req.user.id ||
                !['educational', 'family'].includes(absence.type))) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }
        }
        if (req.body.status) {
            if (!userRoles.some(role => role === 'dean')) {
                return res.status(403).json({ message: 'Только деканат может подтвердить/одобрить статус заявки' });
            }
            if (!['approved', 'rejected'].includes(req.body.status)) {
                return res.status(400).json({ message: 'Неверный статус' });
            }
        }
        Object.assign(absence, req.body);
        // Сохраняем обновленную заявку
        yield absence.save();
        res.status(200).json(absence);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}));
//# sourceMappingURL=absence.js.map