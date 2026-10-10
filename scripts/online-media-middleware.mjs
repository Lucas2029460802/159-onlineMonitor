import fs from "node:fs";
import path from "node:path";

const ONLINE_ROOT = "/data/resources/online";
const URL_PREFIX = "/media/online/";

const MIME = {
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".json": "application/json",
    ".mp4": "video/mp4",
};

/**
 * 将 /media/online/* 映射到本机 /data/resources/online，不经 Go API。
 * @type {import('@rsbuild/core').RequestHandler}
 */
export function onlineMediaMiddleware(req, res, next) {
    const rawUrl = req.url || "";
    if (!rawUrl.startsWith(URL_PREFIX)) {
        next();
        return;
    }

    let rel = decodeURIComponent(rawUrl.slice(URL_PREFIX.length).split("?")[0]);
    rel = rel.replace(/^\/+/, "");
    if (!rel || rel.includes("\0")) {
        res.statusCode = 400;
        res.end("bad path");
        return;
    }

    const abs = path.resolve(ONLINE_ROOT, rel);
    const rootResolved = path.resolve(ONLINE_ROOT);
    if (abs !== rootResolved && !abs.startsWith(rootResolved + path.sep)) {
        res.statusCode = 403;
        res.end("forbidden");
        return;
    }

    fs.stat(abs, (err, st) => {
        if (err || !st.isFile()) {
            res.statusCode = 404;
            res.end("not found");
            return;
        }
        const ext = path.extname(abs).toLowerCase();
        res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
        res.setHeader("Content-Length", String(st.size));
        res.setHeader("Cache-Control", "public, max-age=60");
        fs.createReadStream(abs).pipe(res);
    });
}

/** @type {import('@rsbuild/core').SetupMiddlewaresFn} */
export function setupOnlineMediaMiddlewares(middlewares) {
    middlewares.unshift(onlineMediaMiddleware);
}
