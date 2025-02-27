// import multer from 'multer';
// import { storage } from '../consts/storage';

// /*
//  * Сервис для работы загруки файлов с помощью GridFS
//  */

// const FileUploadService = {
//   // Создать загрузчик файлов с настройками
//     createFileUploader(): multer.Multer {
//         return multer({
//             storage: storage as any,
//             limits: { fileSize: 10000000 }, // Ограничение на размер файла в 10MB
//             fileFilter(req: any, file: any, cb: any) {
//             if (!file.originalname.match(/\.(png|pdf)$/)) { // Фильтрация по разрешению файла (png и pdf)
//                 return cb(new Error('Недопустимый тип файла'));
//             }
//             cb(null, true);
//             },
//         });
//     },

//     // Загрузить файл
//     uploadFile(req: any, res: any, next: any): void {
//         const upload = this.createFileUploader();
//         upload.single('document')(req, res, next);
//     },
// };

// export default FileUploadService;