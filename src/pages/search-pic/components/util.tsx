export function sayHello() {
    const now = new Date();
    const h = now.getHours();
    if (h <= 4) {
        return "夜深了";
    } else if (h <= 6) {
        return "新的一天";
    } else if (h <= 9) {
        return "早上好";
    } else if (h <= 13) {
        return "中午好";
    } else if (h <= 16) {
        return "下午好";
    } else if (h <= 19) {
        return "晚上好";
    } else {
        return "夜深了";
    }
}
