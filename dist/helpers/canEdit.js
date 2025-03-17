"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canEdit = void 0;
const canEdit = (userId, userRoles, absence) => {
    if (userRoles.includes('dean') ||
        userRoles.includes('student') &&
            !['educational'].includes(absence.type) &&
            userId === absence.user._id.toString()) {
        return true;
    }
    else {
        return false;
    }
};
exports.canEdit = canEdit;
//# sourceMappingURL=canEdit.js.map