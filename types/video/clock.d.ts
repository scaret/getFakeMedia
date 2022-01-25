import { fakeVideoTrackConstraints } from "./video";
export declare class Clock {
    private constraints;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private frameHistory;
    private frameHistoryTime;
    private startTime;
    private interval;
    private frameMinInterval;
    private trackEnded;
    private videoInfo?;
    constructor(constraints: fakeVideoTrackConstraints);
    drawFrame(fromSetInterval?: boolean, tsIn?: number): void;
    drawBackground(): void;
    start(): {
        hookDrawFrame?: (() => any) | undefined;
        track: MediaStreamTrack;
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
    };
}
