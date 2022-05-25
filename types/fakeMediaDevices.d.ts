import { ChannelSettings, BufferTrackConstraints } from "./audio/BufferTrack";
import { VideoTypes } from "./video/video";
import { OscStereoConstraints } from "./audio/OscStereoTrack";
export interface videoTrackConstraintInput {
    type: VideoTypes;
    width?: number;
    height?: number;
    frameRate?: number;
    content?: string;
    bgColor?: string;
    bgImg?: CanvasImageSource;
}
export interface audioTrackConstraintInput {
    sampleRate?: number;
    mono?: ChannelSettings;
    left?: boolean | ChannelSettings;
    right?: boolean | ChannelSettings;
    channelCount?: 1 | 2;
}
interface fakeMediaStreamConstraints {
    audio?: boolean | BufferTrackConstraints | OscStereoConstraints;
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
