export declare type BUILTIN_AB = "brysj" | "bbdbbjyy" | "mmdmmjwp";
export interface ChannelSettings {
    data: ArrayBuffer | BUILTIN_AB;
    loop: boolean;
    gain: number;
    noise?: {
        gain: number;
    };
}
export interface BufferTrackConstraints {
    type: "buffertrack";
    sampleRate?: number;
    mono?: ChannelSettings;
    left?: boolean | ChannelSettings;
    right?: boolean | ChannelSettings;
    channelCount?: 1 | 2;
}
export declare function getBufferTrack(constraint: BufferTrackConstraints): {
    track: MediaStreamTrack;
    context: AudioContext;
    destination: MediaStreamAudioDestinationNode;
};
