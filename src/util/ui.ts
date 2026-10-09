import { $UI } from "@/store/ui";

export const Message = {
    warning: (reason: string, msg: string) => {
        $UI.update(reason, (draft) => {
            draft.messageDisplay = true;
            draft.messageContent = msg;
            draft.messageType = "warning";
        });
    },
    success: (reason: string, msg: string) => {
        $UI.update(reason, (draft) => {
            draft.messageDisplay = true;
            draft.messageContent = msg;
            draft.messageType = "success";
        });
    },
    danger: (reason: string, msg: string) => {
        $UI.update(reason, (draft) => {
            draft.messageDisplay = true;
            draft.messageContent = msg;
            draft.messageType = "danger";
        });
    },
};
