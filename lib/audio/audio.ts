const brysj = require("./brysj.mp3")
const bbdbbjyy = require("./bbdbbjyy.mp3")
const mmdmmjnn = require("./mmdmmjnn.mp3")

export interface ArrayBufferInput{
    data: ArrayBuffer;
    loop: boolean;
}

export interface fakeAudioTrackConstraints{
    sampleRate?: number;
    mono?: ArrayBufferInput;
    left?: boolean|ArrayBufferInput;
    right?: boolean|ArrayBufferInput;
    channelCount?: 1|2;
}

const ctxMap: {
    [sampleRate: number]: AudioContext
} = {};

export function getAudioTrack(constraint: fakeAudioTrackConstraints){
    const {
        sampleRate = 48000,
        channelCount = 1,
    } = constraint

    let context:AudioContext = ctxMap[sampleRate];
    if (!context){
        if (window.AudioContext){
            context = new AudioContext({sampleRate});
        }else{
            //@ts-ignore
            context = new webkitAudioContext({sampleRate});
        }
        ctxMap[sampleRate] = context;
    }
    let destination: MediaStreamAudioDestinationNode;
    try{
        destination = new MediaStreamAudioDestinationNode(context, {channelCount});
        console.log("ChannelCount", channelCount);
    }catch(e){
        console.error(e)
        //@ts-ignore
        if (e.name === "TypeError"){
            destination = context.createMediaStreamDestination();
        }else{
            throw e;
        }
    }
    if (channelCount === 1){
        const mono: ArrayBufferInput = constraint.mono || {
            data: brysj.slice(0),
            loop: true
        };
        context.decodeAudioData(mono.data, (buffer:AudioBuffer)=>{
            const audioSource = context.createBufferSource()
            audioSource.buffer = buffer;
            audioSource.loop = mono.loop;
            audioSource.connect(destination);
            audioSource.start()
        })
    } else if (channelCount === 2){
        const merger = context.createChannelMerger(channelCount);
        merger.connect(destination);
        const duration = 1.764;
        if (constraint.left !== false){
            const left = typeof constraint.left === "object" ? constraint.left : {
                data: bbdbbjyy.slice(0),
                loop: true,
            };
            context.decodeAudioData(left.data, (buffer:AudioBuffer)=>{
                const audioSource = context.createBufferSource()
                audioSource.buffer = buffer;
                audioSource.loop = left.loop;
                audioSource.connect(merger, 0, 0);
                audioSource.start(0)
            })
        }
        if (constraint.right !== false){
            const right = typeof constraint.right === "object" ? constraint.right : {
                data: mmdmmjnn.slice(0),
                loop: true
            };
            context.decodeAudioData(right.data, (buffer:AudioBuffer)=>{
                const audioSource = context.createBufferSource()
                audioSource.buffer = buffer;
                audioSource.loop = right.loop;
                audioSource.connect(merger, 0, 1);
                audioSource.start(0)
            })
        }
    }
    const audioTrack = destination.stream.getAudioTracks()[0];
    return audioTrack;
}