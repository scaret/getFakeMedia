import { ArrayBufferInput, fakeAudioTrackConstraints } from "./audio/audio";
export interface videoTrackConstraintInput {
    width?: number;
    height?: number;
    frameRate?: number;
    content?: string;
    background?: string;
}
export interface audioTrackConstraintInput {
    sampleRate?: number;
    mono?: ArrayBufferInput;
    left?: boolean | ArrayBufferInput;
    right?: boolean | ArrayBufferInput;
    channelCount?: 1 | 2;
}
interface fakeMediaStreamConstraints {
    audio?: boolean | fakeAudioTrackConstraints;
    video?: boolean | videoTrackConstraintInput;
}
export declare const audioTracks: MediaStreamTrack[];
export declare const videoTracks: MediaStreamTrack[];
declare class FakeMediaStream {
    audio?: {
        track: MediaStreamTrack;
        context: AudioContext;
        destination: MediaStreamAudioDestinationNode;
    };
    video?: {
        track: MediaStreamTrack;
        context: CanvasRenderingContext2D;
        canvas: HTMLCanvasElement;
        hookDrawFrame?: () => any;
    };
    getMediaStream(): MediaStream;
}
export declare function getFakeMedia(constrants: fakeMediaStreamConstraints): FakeMediaStream;
export {};
