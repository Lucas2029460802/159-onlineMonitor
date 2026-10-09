export type CaptionObjectType =
    | "person"
    | "face"
    | "motor_vehicle"
    | "non_motor_vehicle";

export type CaptionStatus = "pending" | "processing" | "completed" | "failed";

export type CaptionEmbeddingStatus =
    | "blocked"
    | "pending"
    | "processing"
    | "completed"
    | "failed";

export type CaptionListSortBy =
    | "capture_time"
    | "ingested_at"
    | "updated_at"
    | "device_id"
    | "plate_no"
    | "object_type"
    | "caption_status"
    | "embedding_status";

export type CaptionSearchSortBy = CaptionListSortBy | "relevance";

export type CaptionSortOrder = "asc" | "desc";

export type CaptionSourceDetailCode = "11" | "12" | "13" | "14";

export interface CaptionPair {
    [key: string]: unknown;
}

export interface CaptionRecord {
    id: string;
    source_type: string;
    source_detail_code: string;
    object_type: CaptionObjectType;
    object_id: string;
    image_id: string;
    source_id: string;
    device_id: string;
    plate_no: string;
    capture_time: Date | string;
    ingested_at: Date | string;
    updated_at: Date | string;
    source_url: string;
    image_url: string;
    image_storage_path: string;
    image_sha1: string;
    image_width: number;
    image_height: number;
    caption_text: string;
    caption_status: CaptionStatus;
    caption_model: string;
    caption_error: string;
    embedding_status: CaptionEmbeddingStatus;
    embedding_error: string;
    embedding_started_at: Date | string | null;
    embedding_completed_at: Date | string | null;
    colors: string[];
    patterns: string[];
    categories: string[];
    pairs: CaptionPair[];
    raw_ext: Record<string, unknown> | null;
    deleted_at: Date | string | null;
    score?: number;
    hit?: string;
}

export interface CaptionListParams {
    page?: number;
    size?: number;
    sort_by?: CaptionListSortBy;
    sort_order?: CaptionSortOrder;
    device_id?: string;
    plate_no?: string;
    capture_time_from?: string;
    capture_time_to?: string;
    object_type?: CaptionObjectType;
    caption_status?: CaptionStatus;
    embedding_status?: CaptionEmbeddingStatus;
    object_id?: string;
    image_id?: string;
    has_caption?: boolean;
    source_detail_code?: string;
    colors?: string[];
    patterns?: string[];
    categories?: string[];
}

export interface CaptionSearchParams
    extends Omit<CaptionListParams, "sort_by"> {
    query: string;
    sort_by?: CaptionSearchSortBy;
}

export interface CaptionListResponse {
    items: CaptionRecord[] | null;
    total: number;
    page: number;
    size: number;
    TotalNum?: number;
    PageRecordNum?: number;
    RecordStartNo?: number;
}

export type CaptionDetailResponse = CaptionRecord;

export interface CaptionHealthResponse {
    status?: string;
    ok?: boolean;
    message?: string;
    [key: string]: unknown;
}

export interface CaptionPipelineStatus {
    queue_size?: number;
    inflight_batches?: number;
    total_processed?: number;
    [key: string]: unknown;
}

export interface CaptionStoreStatus {
    total_records?: number;
    caption_status_counts?: Partial<Record<CaptionStatus, number>>;
    embedding_status_counts?: Partial<Record<CaptionEmbeddingStatus, number>>;
    [key: string]: unknown;
}

export interface CaptionSourceStatusResponse {
    store?: CaptionStoreStatus;
    caption_pipeline?: CaptionPipelineStatus;
    embedding_pipeline?: CaptionPipelineStatus;
    [key: string]: unknown;
}
