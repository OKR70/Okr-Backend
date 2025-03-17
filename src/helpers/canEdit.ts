import { IUser } from '../models/user';
import { Role } from '../consts/consts';
import { IAbsence } from '../models/absence';

export const canEdit = (userId: string, userRoles: Role[], absence: IAbsence) => {
    if (userRoles.includes('dean') ||
        userRoles.includes('student') &&
        !['educational'].includes(absence.type) &&
        userId === absence.user._id.toString()
    ) {
        return true;
    } else {
        return false;
    }
}