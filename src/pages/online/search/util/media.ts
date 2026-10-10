import {
    SearchCardItem,
    SearchMediaGenre,
    SearchOne,
} from "@/api/type";

export function onlineEventMediaUrl(path: string): string {
    return `/api/video/online/event/screenshot?image_path=${encodeURIComponent(path)}`;
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
