// Srs.ts 真正的ts版本，另一个只是伪装成ts的js文件
export class SrsError extends Error {
    constructor(name: string, message: string) {
        super(message);
        this.name = name;
        this.stack = new Error().stack;
    }
}

interface Session {
    sdp: string;
    simulator: string;
    [key: string]: any;
}

interface UrlConfig {
    apiUrl: string;
    streamUrl: string;
    schema: string;
    urlObject: any;
    port: number;
    tid: string;
}

interface Internal {
    defaultPath: string;
    prepareUrl: (webrtcUrl: string) => UrlConfig;
    parse: (url: string) => any;
    fill_query: (query_string: string, obj: any) => void;
}

export class SrsRtcPlayerAsync {
    pc: RTCPeerConnection;
    stream: MediaStream;
    ontrack?: (event: RTCTrackEvent) => void;
    private __internal: Internal;

    constructor() {
        this.pc = new RTCPeerConnection();
        this.stream = new MediaStream();

        this.pc.ontrack = (event) => {
            this.stream.addTrack(event.track);
            this.ontrack?.(event);
        };

        this.__internal = {
            defaultPath: "/rtc/v1/play/",
            prepareUrl: (webrtcUrl: string): UrlConfig => {
                const urlObject = this.__internal.parse(webrtcUrl);
                const schema =
                    urlObject.user_query.schema ?? window.location.protocol;
                let port = urlObject.port || 1985;
                if (schema === "https:") port = urlObject.port || 443;

                let api =
                    urlObject.user_query.play || this.__internal.defaultPath;
                if (!api.endsWith("/")) api += "/";

                let apiUrl =
                    schema + "//" + urlObject.server + ":" + port + api;
                for (const key in urlObject.user_query) {
                    if (key !== "api" && key !== "play") {
                        apiUrl += "&" + key + "=" + urlObject.user_query[key];
                    }
                }
                apiUrl = apiUrl.replace(api + "&", api + "?");

                return {
                    apiUrl,
                    streamUrl: urlObject.url,
                    schema,
                    urlObject,
                    port,
                    tid: Math.floor(Math.random() * 1e7)
                        .toString(16)
                        .slice(0, 7),
                };
            },
            parse: (url: string) => {
                const a = document.createElement("a");
                a.href = url
                    .replace("rtmp://", "http://")
                    .replace("webrtc://", "http://")
                    .replace("rtc://", "http://");

                let vhost = a.hostname;
                let app = a.pathname.substring(1, a.pathname.lastIndexOf("/"));
                const stream = a.pathname.slice(
                    a.pathname.lastIndexOf("/") + 1,
                );

                app = app.replace("...vhost...", "?vhost=");
                if (app.indexOf("?") >= 0) {
                    const params = app.slice(app.indexOf("?"));
                    app = app.slice(0, app.indexOf("?"));
                    if (params.includes("vhost=")) {
                        vhost = params.split("vhost=")[1].split("&")[0];
                    }
                }

                if (/\d+\.\d+\.\d+\.\d+/.test(a.hostname)) {
                    vhost = "__defaultVhost__";
                }

                let schema = "rtmp";
                if (url.includes("://")) schema = url.split("://")[0];

                let port =
                    Number(a.port) ||
                    (schema === "http" ? 80 : schema === "https" ? 443 : 1935);
                if ((schema === "webrtc" || schema === "rtc") && !port)
                    port = 1985;

                const ret = {
                    url,
                    schema,
                    server: a.hostname,
                    port,
                    vhost,
                    app,
                    stream,
                };
                this.__internal.fill_query(a.search, ret);
                return ret;
            },
            fill_query: (query_string: string, obj: any) => {
                obj.user_query = {};
                if (!query_string) return;

                const qs = query_string.startsWith("?")
                    ? query_string.slice(1)
                    : query_string;
                const queries = qs.split("&");
                for (const q of queries) {
                    const [key, value] = q.split("=");
                    obj[key] = value;
                    obj.user_query[key] = value;
                }

                if (obj.domain) obj.vhost = obj.domain;
            },
        };
    }

    async play(url: string): Promise<Session> {
        const conf = this.__internal.prepareUrl(url);

        this.pc.addTransceiver("audio", { direction: "recvonly" });
        this.pc.addTransceiver("video", { direction: "recvonly" });

        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);

        const session: Session = await new Promise((resolve, reject) => {
            const data = {
                api: conf.apiUrl,
                tid: conf.tid,
                streamurl: conf.streamUrl,
                clientip: null,
                sdp: offer.sdp,
            };
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                if (xhr.readyState !== xhr.DONE) return;
                if (xhr.status !== 200 && xhr.status !== 201)
                    return reject(xhr);
                const resp = JSON.parse(xhr.responseText);
                return resp.code ? reject(xhr) : resolve(resp);
            };
            xhr.open("POST", conf.apiUrl, true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(JSON.stringify(data));
        });

        await this.pc.setRemoteDescription({
            type: "answer",
            sdp: session.sdp,
        });
        session.simulator = `${conf.schema}//${conf.urlObject.server}:${conf.port}/rtc/v1/nack/`;

        return session;
    }

    close() {
        this.pc?.close();
        this.pc = null as any;
    }
}
