import {Clock} from "./Clock";
import {BackgroundReplacement} from "./BackgroundReplacement";

export interface fakeVideoTrackConstraints{
    type: "clock"|"background";
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
    else if (constraints.type === "background"){
        const background = new BackgroundReplacement(constraints);
        const result = background.start()
        return result;
    }else{
        throw new Error("Unknown model " + constraints.type)
    }
}
