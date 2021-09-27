import {fakeAudioTrackConstraints, getAudioTrack} from "./audio/audio";


interface fakeMediaStreamConstraints{
    audio: boolean|fakeAudioTrackConstraints
}

const getFakeMedia = (constrants: fakeMediaStreamConstraints)=>{
    let audioTrack:MediaStreamTrack|null = null
    const promises:Promise<any>[] = [];
    const tracks:MediaStreamTrack[] = [];
    if (constrants.audio){
        // promises.push(getAudioTrack().then((track)=>{
        //     audioTrack = track
        // }))
        const audioConstaint = constrants.audio === true ? {} : constrants.audio;
        promises.push(getAudioTrack(audioConstaint).then((track)=>{
            audioTrack = track;
            tracks.push(track)
        }))
    }
    return Promise.all(promises).then(()=>{
        return new MediaStream(tracks)
    })
}

const resume = ()=>{

}

export {
    getFakeMedia,
    resume,
}