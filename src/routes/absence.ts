import express, {
    Request,
    Response
} from 'express';
import path from 'path';
import * as fs from 'fs';
import Fuse from 'fuse.js';
import multer from 'multer';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import UserModel from '../models/user';
import AbsenceModel from '../models/absence';
import { hasRole } from '../middlewares/hasRole';
import { authToken } from '../middlewares/authToken';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/files');
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname); // Получаем расширение файла
        const newFileName = `${uuidv4()}${fileExtension}`; // Генерируем новое имя с расширением
        cb(null, newFileName);
    }
});
  
const upload = multer({ storage: storage });

/*
 * Заявки на пропуски
 */

const router = express.Router();

/* 
 * Создание новой заявки
 */
router.post(
    '/create',
    authToken,
    hasRole('student'),
    upload.single('document'),
    async (req: Request, res: Response): Promise<any> => {
    const {
        type,
        endDate,
        startDate,
        statementInDeanery
    } = req.body;

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

    const {
        _id,
        fullname
    } = req.user!;
    
    const startDateToDate = new Date(startDate);
    let absence = new AbsenceModel({
        type,
        user: {
            _id,
            fullname
        },
        startDate: startDateToDate,
        endDate: endDate ? new Date(endDate) : new Date(startDateToDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now()),
        ...(documentName && { documentName }),
        ...(type === 'family' && statementInDeanery && { statementInDeanery })
    });

    try {
        await absence.save();
        const { createdAt, ...absenceResponse } = absence.toObject();
        res.status(201).json({ absence: absenceResponse });
    } catch (err) {
        res.status(500).json({ message: err });
    }
})

/*
 * Получение всех заявок на пропуск
 */
router.get(
    '/',
    authToken,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const userRoles = req.user!.role;
            const query = req.query.query as string;
            const skip = parseInt(req.query.skip as string) || 0;
            const limit = parseInt(req.query.limit as string) || 10;
            const onlyMine = req.query.onlyMine ? req.query.onlyMine : false;
            const status = req.query.status as string;

            let filter: any = {};
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
                filter['user._id'] = new mongoose.Types.ObjectId(req.user!._id);
            }

            const allAbsences = await AbsenceModel.find(filter)
                .sort({ createdAt: -1 }) // Сортируем в обратном порядке по createdAt
                .select('-createdAt');
                
            let filteredAbsences = allAbsences;
            if (query) {
                // Создаем массив объектов с ФИО и id заявки
                const searchItems = await Promise.all(allAbsences!.map(async absence => {
                    const user = await UserModel.findOne({ _id: absence.user._id });
                    return {
                        _id: absence._id,
                        fullname: user?.fullname,
                    };
                }));
                
                // Настройки для Fuse.js
                const fuseOptions = {
                    keys: ['fullname'],
                    threshold: 0.4,
                };
                
                const fuse = new Fuse(searchItems, fuseOptions);
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
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }
);

/*
 * Изменение конкретной заявки на пропуск
 */
router.patch(
    '/:id',
    authToken,
    upload.single('document'),
    async (req: Request, res: Response): Promise<any> => {
        try {
            const {
                type,
                status,
                endDate,
                startDate,
                statementInDeanery
            } = req.body;
            
            if (endDate && startDate > endDate) {
                return res.status(400).json({ message: 'Дата начала не может быть позже конца' });
            }
            
            const absenceId = req.params.id;
            const userRoles = req.user!.role;

            const absence = await AbsenceModel.findById(absenceId);

            if (!absence) {
                return res.status(404).json({ message: 'Заявка не найдена' });
            }

            if (userRoles.includes('student') && userRoles.length === 1) {
                if (absence.user._id !== req.user!.id || !['educational'].includes(absence.type)) {
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
            } else {
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
            await absence.save();
            const { createdAt, ...absenceResponse } = absence.toObject();
            res.status(200).json(absenceResponse);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }
);

/*
 * Получение конкретной заявки на пропуск
 */
router.get(
    '/:id',
    authToken,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const absenceId = req.params.id;
            const userRoles = req.user!.role;
            const userId = req.user!._id;

            const absence = await AbsenceModel.findById(absenceId).lean();

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
            
            res.status(200).json({
                absence,
                hasDocument,
                ...(hasDocument && { documentUrl })
            });
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }
);

module.exports = router;