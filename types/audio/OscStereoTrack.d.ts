export interface OscStereoConstraints {
    type: "oscstereo";
    sampleRate: number;
    frequency: number;
    gainLeft: number;
    gainRight: number;
}
export declare function getOscStereoTrack(constraint: OscStereoConstraints): {
    track: MediaStreamTrack;
    context: AudioContext;
    destination: MediaStreamAudioDestinationNode;
    oscillatorNode: OscillatorNode;
    gainNodeLeft: GainNode;
    gainNodeRight: GainNode;
    mergerNode: ChannelMergerNode;
    delayNode: DelayNode;
};
