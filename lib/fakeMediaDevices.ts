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

class FakeMediaStream{
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
    }
    getMediaStream (){
        const tracks:MediaStreamTrack[] = [];
        if (this.audio){
            tracks.push(this.audio.track);
        }
        if (this.video){
            tracks.push(this.video.track);
        }
        const mediaStream = new MediaStream(tracks);
        return mediaStream;
    }
}

export function getFakeMedia(constrants: fakeMediaStreamConstraints){
    const fakeMediaStream = new FakeMediaStream();
    if (constrants.audio){
        // promises.push(getAudioTrack().then((track)=>{
        //     audioTrack = track
        // }))
        fakeMediaStream.audio = getAudioTrack(constrants.audio === true ? {channelCount: 1} : constrants.audio);
        audioTracks.push(fakeMediaStream.audio.track)
    }
    if (constrants.video){
        const defaultVideoConstraints:fakeVideoTrackConstraints = {
            width: 1024,
            height: 768,
            frameRate: 60,
            content: "Video",
            background: "#ddd",
        };
        const videoConstraints = Object.assign({}, defaultVideoConstraints, constrants.video === true ? {} : constrants.video)
        const videoTrackInfo = getVideoTrack(videoConstraints);
        fakeMediaStream.video = videoTrackInfo;
        videoTracks.push(videoTrackInfo.track)
    }
    return fakeMediaStream;
}