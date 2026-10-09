import { model } from "@/packages/model";

export interface UIModel {
    messageContent: string;
    messageType: "success" | "danger" | "warning";
    messageDisplay: boolean;
    login: boolean;
    showAddTask: boolean;
}

const token = localStorage.getItem("token");
if (token === null && window.location.pathname !== "/login") {
    window.location.href = "/login";
}

export const $UI = model<UIModel>("UI", {
    messageContent: "",
    messageType: "success",
    messageDisplay: false,
    login: token !== null && token.length > 0,
    showAddTask: false,
});
