import {ArrayBufferInput, fakeAudioTrackConstraints, getAudioTrack} from "./audio/audio";
import {fakeVideoTrackConstraints, getVideoTrack} from "./video/video";

export interface videoTrackConstraintInput{
    width?: number;
    height?: number;
    frameRate?: number;
    content?: string;
    background?: string;
}

export interface audioTrackConstraintInput{
    sampleRate?: number;
    mono?: ArrayBufferInput;
    left?: boolean|ArrayBufferInput;
    right?: boolean|ArrayBufferInput;
    channelCount?: 1|2;
}

interface fakeMediaStreamConstraints{
    audio?: boolean|fakeAudioTrackConstraints
    video?: boolean|videoTrackConstraintInput
}

export const audioTracks:MediaStreamTrack[] = []
export const videoTracks:MediaStreamTrack[] = []

export function getFakeMedia(constrants: fakeMediaStreamConstraints){
    let audioTrack:MediaStreamTrack|null = null
    let videoTrack:MediaStreamTrack|null = null
    const tracks:MediaStreamTrack[] = [];
    if (constrants.audio){
        // promises.push(getAudioTrack().then((track)=>{
        //     audioTrack = track
        // }))
        audioTrack = getAudioTrack(constrants.audio === true ? {channelCount: 1} : constrants.audio);
        tracks.push(audioTrack)
        audioTracks.push(audioTrack)
    }
    if (constrants.video){
        const defaultVideoConstraints:fakeVideoTrackConstraints = {
            width: 1024,
            height: 768,
            frameRate: 120,
            content: "Video",
            background: "#ddd",
        };
        const videoConstraints = Object.assign({}, defaultVideoConstraints, constrants.video === true ? {} : constrants.video)
        videoTrack = getVideoTrack(videoConstraints);
        tracks.push(videoTrack)
        videoTracks.push(videoTrack)
    }
    return new MediaStream(tracks)
}