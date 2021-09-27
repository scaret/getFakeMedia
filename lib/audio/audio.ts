export interface fakeAudioTrackConstraints{
    sampleRate?: number;
    audioBuffer?: {
        data: ArrayBuffer;
        loop: boolean;
    }
}

const contexts:AudioContext[] = [];

export async function getAudioTrack(constaint: fakeAudioTrackConstraints){
    const {
        sampleRate = 48000
    } = constaint
    const context = new AudioContext({sampleRate});
    contexts.push(context);
    let destination: MediaStreamAudioDestinationNode;
    try{
        destination = new MediaStreamAudioDestinationNode(context);
    }catch(e){
        //@ts-ignore
        if (e.name === "TypeError"){
            destination = context.createMediaStreamDestination();
        }else{
            throw e;
        }
    }
    if (constaint.audioBuffer){
        const mp3Buffer = constaint.audioBuffer;
        if (constaint.audioBuffer.data){
            context.decodeAudioData(mp3Buffer.data, (buffer:AudioBuffer)=>{
                const audioSource = context.createBufferSource()
                console.log("buffer", buffer);
                audioSource.buffer = buffer;
                audioSource.loop = mp3Buffer.loop;
                audioSource.connect(destination);
                audioSource.start()
            })
        }
    }
    const audioTrack = destination.stream.getAudioTracks()[0];
    return audioTrack;
}

export async function resumeAudio(){
    contexts.forEach((ctx)=>{
        ctx.resume()
    })
}