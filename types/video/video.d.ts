export interface fakeVideoTrackConstraints {
    width: number;
    height: number;
    frameRate: number;
    content: string;
    background: string;
}
export declare function getVideoTrack(constraints: fakeVideoTrackConstraints): {
    hookDrawFrame?: (() => any) | undefined;
    track: MediaStreamTrack;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
};
