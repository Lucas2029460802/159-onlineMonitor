export function useVideoTime() {
    const searchParams = new URLSearchParams(window.location.search);
    const time = searchParams.get("time");
    const timeNumber = Number(time);
    return time === null ? 0 : timeNumber;
}
