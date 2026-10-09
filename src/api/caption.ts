import { captionInstance } from "./axios";
import {
    CaptionDetailResponse,
    CaptionHealthResponse,
    CaptionListParams,
    CaptionListResponse,
    CaptionSearchParams,
    CaptionSourceStatusResponse,
} from "./caption-types";

function buildCaptionQuery(params: CaptionListParams): string {
    const searchParams = new URLSearchParams();

    const appendValue = (key: string, value: string | number | boolean) => {
        searchParams.append(key, String(value));
    };

    const appendArray = (key: string, values?: string[]) => {
        values?.forEach((value) => {
            if (value.trim().length > 0) {
                appendValue(key, value.trim());
            }
        });
    };

    Object.entries(params).forEach(([key, value]) => {
        if (
            value === undefined ||
            value === null ||
            Array.isArray(value) ||
            value === ""
        ) {
            return;
        }

        appendValue(key, value);
    });

    appendArray("colors", params.colors);
    appendArray("patterns", params.patterns);
    appendArray("categories", params.categories);

    return searchParams.toString();
}

const caption = {
    list: (params: CaptionListParams): Promise<CaptionListResponse> => {
        const query = buildCaptionQuery(params);
        const url =
            query.length > 0 ? `/api/captions?${query}` : "/api/captions";

        return captionInstance.get(url);
    },
    search: (body: CaptionSearchParams): Promise<CaptionListResponse> =>
        captionInstance.post("/api/captions/search", body),
    detail: (id: string): Promise<CaptionDetailResponse> =>
        captionInstance.get(`/api/captions/${id}`),
    imageUrl: (id: string): string => `/caption-api/api/captions/${id}/image`,
    reprocess: (id: string) =>
        captionInstance.post(`/api/captions/${id}/reprocess`),
    reprocessCaption: (id: string) =>
        captionInstance.post(`/api/captions/${id}/reprocess-caption`),
    reprocessEmbedding: (id: string) =>
        captionInstance.post(`/api/captions/${id}/reprocess-embedding`),
    health: (): Promise<CaptionHealthResponse> =>
        captionInstance.get("/healthz"),
    sourceStatus: (): Promise<CaptionSourceStatusResponse> =>
        captionInstance.get("/api/source/status"),
};

export { caption };
