export default function useThrottle<A extends any[], R>(
    fn: (...args: A) => R,
    delay: number,
): (...args: A) => void {
    let timer: number | null = null;
    return function (...args: A) {
        console.log("timer is ", timer, Date.now());
        if (timer !== null) {
            return;
        }
        timer = setTimeout(() => {
            timer = null;
        }, delay);
        fn(...args);
        console.log(timer);
    };
}
