import { fakeAudioTrackConstraints } from "./audio/audio";
interface fakeMediaStreamConstraints {
    audio: boolean | fakeAudioTrackConstraints;
}
export declare function getFakeMedia(constrants: fakeMediaStreamConstraints): MediaStream;
export {};
