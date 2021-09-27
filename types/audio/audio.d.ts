export interface fakeAudioTrackConstraints {
    sampleRate?: number;
    audioBuffer?: {
        data: ArrayBuffer;
        loop: boolean;
    };
}
export declare function getAudioTrack(constaint: fakeAudioTrackConstraints): Promise<MediaStreamTrack>;
export declare function resumeAudio(): Promise<void>;
