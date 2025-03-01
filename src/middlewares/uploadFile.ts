import { IncomingForm } from 'formidable';

export const uploadFile = (req: any, res: any, next: any) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Ошибка парсинга файла:', err);
            return res.status(500).json({ message: 'Ошибка парсинга файла' });
        }

        req.body = fields;
        req.files = files;

        next();
    });
};