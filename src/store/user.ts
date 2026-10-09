import { User, UserRole } from "@/api/type";
import { model } from "@/packages/model";
import { decodeJwtPayload } from "@/util/jwt";

interface JWTPayLoad {
    exp: number;
    iss: string;
    role: UserRole;
    userid: number;
    username: string;
}

// 解析 token 获取用户信息
const token = localStorage.getItem("token");
let payload: JWTPayLoad | undefined;
if (token !== null && token.length > 0) {
    try {
        payload = decodeJwtPayload<JWTPayLoad>(token);
    } catch {
        // token 无效时静默清除，不弹错误提示
        localStorage.removeItem("token");
    }
}

export const $User = model<User>("USER", {
    Id: payload?.userid ?? 0,
    Name: payload?.username ?? "",
    Role: payload?.role ?? 1,
    Station: "",
});
