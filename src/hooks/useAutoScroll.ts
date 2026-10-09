export default function useThrottle<A extends any[], R>(
    fn: (...args: A) => R,
    delay: number,
): (...args: A) => void {
    let timer: number | null = null;
    return function (...args: A) {
        if (timer !== null) {
            return;
        }
        fn(...args);
        timer = setTimeout(() => {
            timer = null;
        }, delay);
    };
}
