export interface OfflineTimerOptions {
    from: {
        native: boolean;
        webAudio: boolean;
        worker: boolean;
    };
    minInterval: number;
}
export declare type SOURCES = "native" | "worker" | "webAudio";
export interface OfflineTimer {
    id: number;
    handler: () => any;
    interval: number;
    lastCalledAt: number;
    cnt: number;
    cntMax: number;
}
declare class RTCTimer {
    options: OfflineTimerOptions;
    history: {
        source: SOURCES;
        ts: number;
    }[];
    timers: (OfflineTimer | undefined)[];
    nativeTimer: any;
    private worker;
    constructor(options?: OfflineTimerOptions);
    setInterval(handler: () => any, interval: number): void;
    clearInterval(timerId: number): void;
}
export declare const rtcTimer: RTCTimer;
export {};
