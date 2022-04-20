export function secondsToTime(seconds: number) {
    return new Date(1000 * seconds).toISOString().substring(11, 11 + 8)
}