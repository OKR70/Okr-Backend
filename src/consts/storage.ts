// import { GridFsStorage } from 'multer-gridfs-storage';

// /*
//  * Настройка GridFS
//  */

// const {
//     DATABASE_URL
// } = process.env as {
//     DATABASE_URL: string
// };

// const storage = new GridFsStorage({
//     url: DATABASE_URL,
//     file: (req, file) => {
//     return new Promise((resolve, reject) => {
//         const filename = file.originalname;
//         const fileInfo = {
//             filename: filename,
//             bucketName: 'documents',
//         };
//         resolve(fileInfo);
//     });
//     },
// });

// export { storage };