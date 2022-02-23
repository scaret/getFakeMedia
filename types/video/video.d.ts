export declare type VideoTypes = "clock" | "background" | "randomcolor";
export interface fakeVideoTrackConstraints {
    type: VideoTypes;
    width: number;
    height: number;
    frameRate: number;
    content: string;
    bgColor?: string;
    bgImg?: CanvasImageSource;
}
export declare function getVideoTrack(constraints: fakeVideoTrackConstraints): {
    hookDrawFrame?: (() => any) | undefined;
    track: MediaStreamTrack;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
};
