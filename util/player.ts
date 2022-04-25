import {nanoid} from "nanoid";

export function secondsToTime(seconds: number) {
    if (isNaN(seconds)) {
        return '00:00:00'
    }
    return new Date(1000 * seconds).toISOString().substring(11, 11 + 8)
}

export function generateUserId() {
    return nanoid(9)
}
