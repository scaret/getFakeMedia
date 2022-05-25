import {autoplayBanner, showAutoPlayBanner} from "../autoplayBanner";

export const ctxMap: {
    [sampleRate: number]: AudioContext
} = {};

export function getContext(sampleRate: number){
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
    context.resume().catch(showAutoPlayBanner);
    return context
}

autoplayBanner.addEventListener("click", ()=>{
    for (let sampleRate in ctxMap){
        (function(context){
            context.resume().then(()=>{
                console.log("context状态目前已恢复至", context.state)
            }).catch(e =>{
                console.error(e.name, e.message, e)
            });
        })(ctxMap[sampleRate])
    }
})
