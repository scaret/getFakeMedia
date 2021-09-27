import {fakeAudioTrackConstraints, getAudioTrack} from "./audio/audio";

interface fakeMediaStreamConstraints{
    audio: boolean|fakeAudioTrackConstraints
}

export function getFakeMedia(constrants: fakeMediaStreamConstraints){
    let audioTrack:MediaStreamTrack|null = null
    const promises:Promise<any>[] = [];
    const tracks:MediaStreamTrack[] = [];
    if (constrants.audio){
        // promises.push(getAudioTrack().then((track)=>{
        //     audioTrack = track
        // }))
        audioTrack = getAudioTrack(constrants.audio === true ? {channelCount: 1} : constrants.audio);
        tracks.push(audioTrack)
    }
    return new MediaStream(tracks)
}