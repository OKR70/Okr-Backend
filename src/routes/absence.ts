import express, {
    Request,
    Response
} from 'express';
import Fuse from 'fuse.js';
import UserModel from '../models/user';
import AbsenceModel from '../models/absence';
import { hasRole } from '../middlewares/hasRole';
import { authToken } from '../middlewares/authToken';
import { uploadFile } from '../middlewares/uploadFile'

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
    uploadFile,
    async (req: Request, res: Response): Promise<any> => {
    const {
        type,
        endDate,
        startDate,
        estimatedEndDate,
        statementInDeanery,
    } = req.body;

    if (!type || !startDate || !endDate) {
        return res.status(400).json({ message: 'Пропущено одно или несколько из обязательных полей' });
    }

    if (type === 'educational' && !req.files?.document) {
        return res.status(400).json({ message: 'Документ обязателен для учебной заявки' });
    }

    const {
        _id,
        fullname
    } = req.user!;
    
    let newAbsence = new AbsenceModel({
        type,
        user: {
            _id,
            fullname
        },
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ...(req.files?.document && {
            document: {
                filename: req.files.document.name,
                data: req.files.document.data,
                contentType: req.files.document.type
            }
        })
    });

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

        const absence = await newAbsence.save();
        res.status(201).json(absence);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
})

/*
 * Получение всех заявок на пропуск
 */
router.get(
    '/',
    authToken,
    async (req: Request, res: Response) => {
        try {
            const userRoles = req.user!.role;
            const query = req.query.query as string;
            const skip = parseInt(req.query.skip as string) || 0;
            const limit = parseInt(req.query.limit as string) || 10;
            
            let finalAbsences;
            let finalTotalSize = 0;
            if (userRoles.some(role => ['dean', 'professor'].includes(role))) {
                const [
                    absences,
                    totalSize
                ] = await Promise.all([
                    AbsenceModel.find(),
                    AbsenceModel.countDocuments()
                ]);
                
                finalAbsences = absences;
                finalTotalSize = totalSize;
            } else if (userRoles.includes('student')) {
                const [
                    absences,
                    totalSize
                ] = await Promise.all([
                    AbsenceModel.find({ userId: req.user!.id }),
                    AbsenceModel.countDocuments({ userId: req.user!.id }),
                ]);

                finalAbsences = absences;
                finalTotalSize = totalSize;
            }

            if (query) {
                // Создаем массив объектов с ФИО и id заявки
                const searchItems = await Promise.all(finalAbsences!.map(async absence => {
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
                const filteredAbsences = searchResults.map(result => result.item._id);
                
                // Получаем заявки по id с пагинацией и общее количество найденных документов
                const [
                    paginatedAbsences,
                    totalSize
                ] = await Promise.all([
                    AbsenceModel.find({ _id: { $in: filteredAbsences } })
                        .skip(skip)
                        .limit(limit),
                    AbsenceModel.countDocuments({ _id: { $in: filteredAbsences } })
                ]);

                finalAbsences = paginatedAbsences;
                finalTotalSize = totalSize;
            }
            
            res.status(200).json({
                totalSize: finalTotalSize,
                items: finalAbsences
            });
        } catch (error) {
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

router.patch(
    '/:id',
    authToken,
    async (req: Request, res: Response): Promise<any> => {
        try {
            const absenceId = req.params.id;
            const userRoles = req.user!.role;

            const absence = await AbsenceModel.findById(absenceId);

            if (!absence) {
                return res.status(404).json({ message: 'Заявка не найдена' });
            }

            if (userRoles.includes('student') && !userRoles.includes('dean')) {
                if (userRoles.includes('student') && (
                    absence.user._id !== req.user!.id || 
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
            await absence.save();
            res.status(200).json(absence);
        } catch (error) {
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

export { router as AbsenceRouter };