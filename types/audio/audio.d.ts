export declare type BUILTIN_AB = "brysj" | "bbdbbjyy" | "mmdmmjwp";
export interface ChannelSettings {
    data: ArrayBuffer | BUILTIN_AB;
    loop: boolean;
    gain: number;
    noise?: {
        gain: number;
    };
}
export interface fakeAudioTrackConstraints {
    sampleRate?: number;
    mono?: ChannelSettings;
    left?: boolean | ChannelSettings;
    right?: boolean | ChannelSettings;
    channelCount?: 1 | 2;
}
export declare function getAudioTrack(constraint: fakeAudioTrackConstraints): {
    track: MediaStreamTrack;
    context: AudioContext;
    destination: MediaStreamAudioDestinationNode;
};
