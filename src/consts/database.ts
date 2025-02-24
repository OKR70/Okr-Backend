import dotenv from 'dotenv';
import mongoose, { Connection } from 'mongoose';

/*
 * Подключение к базе данных
 */

dotenv.config();
const { DATABASE_URL } = process.env;

const database: Connection = mongoose.createConnection(DATABASE_URL as string);

database.on('connected', () => {
    console.log('Database connection established');
});

database.on('error', (err: Error) => {
    console.error('The connection to the database was lost:', err);
});

export { database };