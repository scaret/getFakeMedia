import { fakeVideoTrackConstraints } from "./video";
export declare class BackgroundReplacement {
    private constraints;
    camera: {
        track?: MediaStreamTrack;
        stream?: MediaStream;
        imageCaptureVideo?: HTMLVideoElement;
        imageCaptureCanvas?: HTMLCanvasElement;
        imageCaptureContext?: CanvasRenderingContext2D;
    };
    frameRequest: {
        current: number;
        total: number;
        startTime: number;
    };
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private frameHistory;
    private frameHistoryTime;
    private startTime;
    private interval;
    private frameMinInterval;
    private trackEnded;
    private videoInfo?;
    private selfieSegmentation;
    constructor(constraints: fakeVideoTrackConstraints);
    requestFrame(): Promise<void>;
    drawBackground(): void;
    start(): {
        hookDrawFrame?: (() => any) | undefined;
        track: MediaStreamTrack;
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
    };
}
