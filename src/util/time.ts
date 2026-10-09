export function time2string(estimated: number | undefined): string {
    if (estimated !== undefined) {
        const hours = Math.floor(estimated / 3600);
        const minutes = Math.floor((estimated % 3600) / 60);
        const seconds = Math.floor(estimated % 60);

        // 根据是否有小时动态生成带单位的时间片段
        const timeFragments = [];
        if (hours > 0) {
            timeFragments.push(`${String(hours).padStart(2, "0")}时`);
            timeFragments.push(`${String(minutes).padStart(2, "0")}分`);
        } else {
            timeFragments.push(`${String(minutes).padStart(2, "0")}分`);
        }
        timeFragments.push(`${String(seconds).padStart(2, "0")}秒`);

        return timeFragments.join("");
    }
    return "计算中...";
}

export function date2string(inputDate: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor(
        (now.getTime() - inputDate.getTime()) / 1000,
    );
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    // const diffInMonths = now.getMonth() + 1 - (inputDate.getMonth() + 1);
    const diffInYears = now.getFullYear() - inputDate.getFullYear();

    const hours = String(inputDate.getHours()).padStart(2, "0");
    const minutes = String(inputDate.getMinutes()).padStart(2, "0");
    const seconds = String(inputDate.getSeconds()).padStart(2, "0");

    // if (diffInSeconds < 60) {
    //     return `${diffInSeconds}秒前`;
    // } else if (diffInMinutes < 60) {
    //     return `${diffInMinutes}分钟前`;
    // } else if (diffInDays < 1) {
    //     return `${diffInHours}小时前`;
    // } else if (diffInDays < 2) {
    //     // 昨天的格式：昨天 10:30
    //     return `昨天${inputDate.getHours()}:${String(inputDate.getMinutes()).padStart(2, "0")}`;
    // } else if (diffInYears === 0) {
    //     // 同年，格式：x月x日
    //     return `${inputDate.getMonth() + 1}月${inputDate.getDate()}日`;
    // } else {
    //     // 跨年，格式：x年x月x日
    return `${inputDate.getFullYear()}年${inputDate.getMonth() + 1}月${inputDate.getDate()}日 ${hours}时${minutes}分${seconds}秒`;
    // }
}

export function date2ChineseString(inputDate: Date): string {
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth() + 1;
    const day = inputDate.getDate();
    const hour = inputDate.getHours().toString();
    const minutes = inputDate.getMinutes().toString();
    const seconds = inputDate.getSeconds().toString();
    return `${year}年${month}月${day}日 ${hour.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
}
