import {Clock} from "./Clock";
import {BackgroundReplacement} from "./BackgroundReplacement";
import {RandomColor} from "./RandomColor";
import {DisplayMedia} from "./DisplayMedia";

export type VideoTypes = "clock"|"background"|"randomcolor"

export interface fakeVideoTrackConstraints{
    type: VideoTypes;
    width: number;
    height: number;
    frameRate: number;
    content: string;
    bgColor?: string;
    bgImg?: CanvasImageSource;
}



export function getVideoTrack(constraints: fakeVideoTrackConstraints){
    if (constraints.type === "clock"){
        const clock = new Clock(constraints);
        const result = clock.start()
        return result;
    }
    else if (constraints.type === "randomcolor"){
        const randomColor = new RandomColor(constraints);
        const result = randomColor.start()
        return result;
    }
    else if (constraints.type === "background"){
        const background = new BackgroundReplacement(constraints);
        const result = background.start()
        return result;
    }else if (constraints.type === "display"){
        const background = new DisplayMedia(constraints);
        const result = background.start()
        return result;
    }else{
        throw new Error("Unknown model " + constraints.type)
    }
}
