"use strict";
/*
 * Перевод времени в миллисекунды
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExpirationTime = void 0;
const parseExpirationTime = (timeString) => {
    const timeValue = parseInt(timeString);
    if (timeString.endsWith('d')) {
        return timeValue * 24 * 60 * 60 * 1000;
    }
    else if (timeString.endsWith('m')) {
        return timeValue * 60 * 1000;
    }
    throw new Error('Invalid expiration time format');
};
exports.parseExpirationTime = parseExpirationTime;
//# sourceMappingURL=parseExpirationTime.js.map