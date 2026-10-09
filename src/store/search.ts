import { model } from "@/packages/model";

export interface SearchModel {
    image: File | null;
}

export const $Search = model<SearchModel>("SEARCH", {
    image: null,
});
