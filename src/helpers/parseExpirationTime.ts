
/*
 * Перевод времени в миллисекунды
 */

export const parseExpirationTime = (timeString: string) => {
    const timeValue = parseInt(timeString);
    if (timeString.endsWith('d')) {
        return timeValue * 24 * 60 * 60 * 1000;
    } else if (timeString.endsWith('m')) {
        return timeValue * 60 * 1000;
    }
    throw new Error('Invalid expiration time format');
};