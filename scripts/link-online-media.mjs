import fs from "node:fs";
import path from "node:path";

/** preview / 产物目录下挂载本机在线媒体根目录，供 /media/online/* 直读 */
const linkPath = path.resolve("dist/media/online");
const target = "/data/resources/online";

fs.mkdirSync(path.dirname(linkPath), { recursive: true });
try {
    const st = fs.lstatSync(linkPath);
    if (st.isSymbolicLink() || st.isDirectory() || st.isFile()) {
        fs.rmSync(linkPath, { recursive: true, force: true });
    }
} catch {
    // not exists
}

fs.symlinkSync(target, linkPath);
console.log(`[online-media] ${linkPath} -> ${target}`);
