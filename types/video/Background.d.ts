/// <reference types="w3c-image-capture" />
import { fakeVideoTrackConstraints } from "./video";
export declare class Background {
    private constraints;
    camera: {
        track?: MediaStreamTrack;
        imageCapture?: ImageCapture;
        video: HTMLVideoElement;
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
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
    drawFrame(fromSetInterval?: boolean, tsIn?: number): void;
    start(): {
        hookDrawFrame?: (() => any) | undefined;
        track: MediaStreamTrack;
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
    };
}
