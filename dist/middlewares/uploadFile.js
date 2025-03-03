"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const formidable_1 = require("formidable");
const uploadFile = (req, res, next) => {
    const form = new formidable_1.IncomingForm();
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
exports.uploadFile = uploadFile;
//# sourceMappingURL=uploadFile.js.map