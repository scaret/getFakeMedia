import { fakeAudioTrackConstraints } from "./audio/audio";
interface fakeMediaStreamConstraints {
    audio: boolean | fakeAudioTrackConstraints;
}
declare const getFakeMedia: (constrants: fakeMediaStreamConstraints) => Promise<MediaStream>;
declare const resume: () => void;
export { getFakeMedia, resume, };
