import { SearchCardItem, SearchMediaGenre, SearchOne } from "@/api/type";

const STORED_ROOTS = [
    "/data/resources/online/",
    "/media/online/",
    "data/resources/online/",
    "media/online/",
];

/** 列表里的 url / instances 原值，去掉目录前缀，保留相对路径键 */
export function onlineEventMediaKey(path: string): string {
    if (!path) return "";
    let key = path.trim().replace(/\\/g, "/");

    const fromQuery = key.match(/(?:^|[?&])image_path=([^&]*)/)?.[1];
    if (fromQuery) {
        try {
            key = decodeURIComponent(fromQuery);
        } catch {
            key = fromQuery;
        }
    }

    for (const root of STORED_ROOTS) {
        const at = key.indexOf(root);
        if (at >= 0) {
            key = key.slice(at + root.length);
            break;
        }
    }
    return key.replace(/^\/+/, "");
}

/**
 * 与离线大图类似：用相对路径直接取图。
 * 同源部署下由前端静态目录映射到 /data/resources/online，不再走 Go screenshot 接口。
 * 例：online_xxx/fullImage/gif/1.webp → /media/online/online_xxx/fullImage/gif/1.webp
 */
export function onlineEventMediaUrl(path: string): string {
    const key = onlineEventMediaKey(path);
    if (!key) return "";
    // 与离线 `api/video/screenshot?image_path=${src}` 一样保留路径斜杠，仅编码必要字符
    const safe = key
        .split("/")
        .map((seg) => encodeURIComponent(seg))
        .join("/");
    return `/media/online/${safe}`;
}

/** 按静/动模式把事件列表适配为卡片数据 */
export function adaptSearchListToCards(
    list: SearchOne[],
    genre: SearchMediaGenre,
): SearchCardItem[] {
    if (genre === "gif") {
        return list.map((event) => ({
            key: `gif-${event.id}-${event.event_id ?? event.url}`,
            imagePath: event.url,
            event,
        }));
    }

    const cards: SearchCardItem[] = [];
    for (const event of list) {
        const instances = event.instances?.filter(Boolean) ?? [];
        if (instances.length === 0) {
            cards.push({
                key: `png-${event.id}-url`,
                imagePath: event.url,
                event,
            });
            continue;
        }
        instances.forEach((path, instanceIndex) => {
            cards.push({
                key: `png-${event.id}-${instanceIndex}-${path}`,
                imagePath: path,
                event,
                instanceIndex,
            });
        });
    }
    return cards;
}
