/* eslint-disable @typescript-eslint/ban-ts-comment */
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";

import { setupOnlineMediaMiddlewares } from "./scripts/online-media-middleware.mjs";

export default defineConfig({
    plugins: [pluginReact(), pluginSvgr()],
    html: {
        title: "视频浓缩",
        favicon: "./public/favicon.ico",
    },
    // @ts-expect-error
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["postcss-loader"],
                type: "css",
            },
        ],
    },
    // 实时监测：/media/online/* → /data/resources/online（dev / preview 均生效）
    dev: {
        setupMiddlewares: [setupOnlineMediaMiddlewares],
    },
    server: {
        port: 8031,
        compress: false,
        proxy: {
            "/v1/chat/completions": {
                target: "http://10.176.42.159:8000",
                changeOrigin: true,
                secure: false,
            },

            "/api/v1/enhance": {
                target: "http://10.176.42.159:8000",
                changeOrigin: true,
                secure: false,
                onProxyReq: (proxyReq, req: any) => {
                    const host = proxyReq.getHeader("host"); // ✅ 推荐用 getHeader
                    const targetUrl = `${host}${req.url}`;
                    console.log("Forwarded request to:", `http://${targetUrl}`);
                },
            },
            "/api": {
                target: "http://10.176.42.159:8005",
                // target: "http://192.168.31.138:8005",
                changeOrigin: true,
                secure: false,
                onProxyReq: (proxyReq, req: any) => {
                    const host = proxyReq.getHeader("host"); // ✅ 推荐用 getHeader
                    const targetUrl = `${host}${req.url}`;
                    console.log(targetUrl);
                    if (targetUrl.includes("image_path")) {
                        console.log(
                            `Prefix is api. Forwarded request to:`,
                            `http://${targetUrl}`,
                        );
                    }
                },
            },
            // SRS WebRTC 信令（/rtc/v1/play/），避免浏览器直连 1985 触发 CORS 卡住
            "/rtc": {
                target: "http://10.176.42.159:1985",
                changeOrigin: true,
                secure: false,
            },
            "/caption-api": {
                target: "http://10.176.42.159:8020",
                changeOrigin: true,
                secure: false,
                pathRewrite: { "^/caption-api": "" },
            },
            "/qwen": {
                target: "http://10.176.42.159:8000",
                changeOrigin: true,
                secure: false,
            },
            "/tileserver": {
                target: "http://10.176.42.159:8010",
                changeOrigin: true,
                secure: false,
                pathRewrite: { "^/tileserver": "" },
                onProxyReq: (proxyReq, req: any) => {
                    const host = proxyReq.getHeader("host"); // ✅ 推荐用 getHeader
                    const targetUrl = `${host}${req.url}`;
                    console.log(
                        `Prefix is tileserver. Forwarded request to:`,
                        `http://${targetUrl}`,
                    );
                },
            },
            "/osrm": {
                target: "http://10.176.42.159:8011",
                changeOrigin: true,
                secure: false,
                pathRewrite: { "^/osrm": "" },
                onProxyReq: (proxyReq, req: any) => {
                    const host = proxyReq.getHeader("host"); // ✅ 推荐用 getHeader
                    const targetUrl = `${host}${req.url}`;
                    console.log(
                        `Prefix is osrm. Forwarded request to:`,
                        `http://${targetUrl}`,
                    );
                },
            },
        },
    },
});
