export interface ArrayBufferInput {
    data: ArrayBuffer;
    loop: boolean;
}
export interface fakeAudioTrackConstraints {
    sampleRate?: number;
    mono?: ArrayBufferInput;
    left?: boolean | ArrayBufferInput;
    right?: boolean | ArrayBufferInput;
    channelCount?: 1 | 2;
}
export declare function getAudioTrack(constraint: fakeAudioTrackConstraints): {
    track: MediaStreamTrack;
    context: AudioContext;
    destination: MediaStreamAudioDestinationNode;
};
