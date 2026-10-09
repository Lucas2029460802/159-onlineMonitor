declare module "@/libs/srs-sdk.js" {
    export class SrsRtcPlayerAsync {
        constructor();
        play(url: string): Promise<void>;
        close(): void;
        stream: MediaStream;
    }
}
