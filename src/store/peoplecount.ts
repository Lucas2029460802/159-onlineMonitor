import { model } from "@/packages/model";
import { SurveillanceCameraInfo } from "@/pages/online/types";
export interface PeopleCountModel {
    svInfo: SurveillanceCameraInfo[];
    selectedTreeIds: string[];
    MAX_CARD_ROW: number;
    cardSvIds: (string | null)[];
}

export const $PC = model<PeopleCountModel>("PEOPLECOUNT", {
    svInfo: [],
    selectedTreeIds: [],
    MAX_CARD_ROW: window.screen.availWidth <= 1600 ? 1 : 2,
    cardSvIds: Array(8).fill(null), // 最多8个
});
