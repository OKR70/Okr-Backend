import mongoose, {
    Types,
    Schema,
    Document,
} from 'mongoose';
import { database } from '../consts/database';

export interface IAbsence extends Document {
    type: 'medical' | 'family' | 'educational';
    user: {
        _id: Types.ObjectId;
        fullname: String;
    };
    status: 'pending' | 'approved' | 'rejected';
    startDate: Date;
    endDate: Date;
    document?: {
        filename: string;
        data: Buffer;
        contentType: string;
    };
    statementInDeanery?: boolean; // для семейных
    estimatedEndDate?: Date; // для больничных
}

const absenceSchema = new Schema<IAbsence>({
    type: {
        type: String,
        enum: ['medical', 'family', 'educational'],
        required: true
    },
    user: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        fullname: { 
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    document: {
        filename: String,
        data: Buffer,
        contentType: String
    },
    statementInDeanery: Boolean,
    estimatedEndDate: Date
});

const AbsenceModel = database.model('Absence', absenceSchema);

export default AbsenceModel;