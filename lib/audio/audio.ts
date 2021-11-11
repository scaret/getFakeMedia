const brysj:ArrayBuffer = require("./brysj.mp3")
const bbdbbjyy:ArrayBuffer = require("./bbdbbjyy.mp3")
const mmdmmjwp:ArrayBuffer = require("./mmdmmjwp.mp3")

export type BUILTIN_AB = "brysj"|"bbdbbjyy"|"mmdmmjwp";

const builtinABMap = {
    brysj,
    bbdbbjyy,
    mmdmmjwp,
};

export interface ChannelSettings{
    data: ArrayBuffer | BUILTIN_AB;
    loop: boolean;
    gain: number;
    noise?: {
        gain: number;
    }
}

export interface fakeAudioTrackConstraints{
    sampleRate?: number;
    mono?: ChannelSettings;
    left?: boolean|ChannelSettings;
    right?: boolean|ChannelSettings;
    channelCount?: 1|2;
}

const ctxMap: {
    [sampleRate: number]: AudioContext
} = {};

function addNoise(options: {
    context: AudioContext,
    destination:AudioNode,
    inputNode: AudioNode,
    gain: number,
    output?: number,
    input?: number,
  }){

    const scriptNode = options.context.createScriptProcessor(4096, 1, 1);
    scriptNode.connect(options.destination, options.output || 0, options.input || 0);
    options.inputNode.connect(scriptNode, 0, 0);

    scriptNode.onaudioprocess = function(audioProcessingEvent) {
        // The input buffer is the song we loaded earlier
        var inputBuffer = audioProcessingEvent.inputBuffer;

        // The output buffer contains the samples that will be modified and played
        var outputBuffer = audioProcessingEvent.outputBuffer;

        // Loop through the output channels (in this case there is only one)
        for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            var inputData = inputBuffer.getChannelData(channel);
            var outputData = outputBuffer.getChannelData(channel);

            // Loop through the 4096 samples
            for (var sample = 0; sample < inputBuffer.length; sample++) {
                // make output equal to the same as the input
                // add noise to each output sample
                outputData[sample] = inputData[sample];
                outputData[sample] += ((Math.random() * 2) - 1) * options.gain;
            }
        }
    }
}

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
    if (context.state !== "running"){
        const btn = document.createElement("h1")
        btn.innerText = "受浏览器自动播放策略影响，需点击此处以恢复音频播放"
        btn.onclick = ()=>{
            context.resume().then(()=>{
                console.log("context状态目前已恢复至", context.state)
            }).catch(e =>{
                console.error(e.name, e.message, e)
            });
            btn.parentNode?.removeChild(btn);
        }
        btn.style.position = "fixed";
        btn.style.background = "yellow";
        btn.style.top = "0";
        btn.style.width = "100%"

        document.body.appendChild(btn)
    }
    let destination: MediaStreamAudioDestinationNode;
    try{
        destination = new MediaStreamAudioDestinationNode(context, {channelCount});
    }catch(e){
        //@ts-ignore
        if (e.name === "TypeError"){
            destination = context.createMediaStreamDestination();
        }else{
            console.error(e);
            throw e;
        }
    }

    if (channelCount === 1){
        const mono: ChannelSettings = constraint.mono || {
            data: brysj.slice(0),
            loop: true,
            gain: 1,
        };
        const data = typeof mono.data === "string" ? builtinABMap[mono.data].slice(0) : mono.data;
        context.decodeAudioData(data, (buffer:AudioBuffer)=>{
            const audioSource = context.createBufferSource()
            audioSource.buffer = buffer;
            audioSource.loop = mono.loop;
            const gainNode = context.createGain();
            gainNode.gain.value = mono.gain;
            audioSource.connect(gainNode);
            if (mono.noise){
                addNoise({
                    context,
                    destination,
                    inputNode: gainNode,
                    gain: mono.noise.gain,
                })
            }else{
                gainNode.connect(destination);
            }
            audioSource.start()
        })
    } else if (channelCount === 2){
        const merger = context.createChannelMerger(channelCount);
        merger.connect(destination);
        if (constraint.left !== false){
            const left:ChannelSettings = typeof constraint.left === "object" ? constraint.left : {
                data: bbdbbjyy.slice(0),
                loop: true,
                gain: 1,
            };
            const data = (typeof left.data === "string") ? builtinABMap[left.data] : left.data
            context.decodeAudioData(data, (buffer:AudioBuffer)=>{
                const audioSource = context.createBufferSource()
                audioSource.buffer = buffer;
                audioSource.loop = left.loop;
                const gainNode = context.createGain();
                gainNode.gain.value = left.gain;
                audioSource.connect(gainNode)
                if (left.noise){
                    addNoise({
                        context,
                        destination: merger,
                        inputNode: gainNode,
                        gain: left.noise.gain,
                        output: 0,
                        input: 0,
                    })
                }else{
                    gainNode.connect(merger, 0, 0);
                }
                audioSource.start(0)
            })
        }
        if (constraint.right !== false){
            const right:ChannelSettings = typeof constraint.right === "object" ? constraint.right : {
                data: mmdmmjwp.slice(0),
                loop: true,
                gain: 1,
            };
            const data = (typeof right.data === "string" ? builtinABMap[right.data].slice(0) : right.data);
            context.decodeAudioData(data, (buffer:AudioBuffer)=>{
                const audioSource = context.createBufferSource()
                audioSource.buffer = buffer;
                audioSource.loop = right.loop;
                const gainNode = context.createGain();
                gainNode.gain.value = right.gain;
                audioSource.connect(gainNode)
                if (right.noise){
                    addNoise({
                        context,
                        destination: merger,
                        inputNode: gainNode,
                        gain: right.noise.gain,
                        output: 0,
                        input: 1,
                    })
                }else{
                    gainNode.connect(merger, 0, 1);
                }
                audioSource.start(0)
            })
        }
    }
    const track = destination.stream.getAudioTracks()[0];
    return {
        track,
        context,
        destination,
    };
}