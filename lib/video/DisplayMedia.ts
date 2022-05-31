import {fakeVideoTrackConstraints} from "./video";
import {getRTCTimer} from "../RTCTimer";

export class DisplayMedia{
    private constraints: fakeVideoTrackConstraints;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private frameHistory: {time: number, fromSetInterval: boolean}[] = []
    private frameHistoryTime = 2000;
    private startTime: number = 0;
    private interval: any = null;
    private frameMinInterval: number = 0;
    private trackEnded: boolean = false;
    private displayInfo: {
        stream: MediaStream;
        video: HTMLVideoElement;
    }|null = null
    private videoInfo?: {
        hookDrawFrame?: () => any;
        track: MediaStreamTrack;
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
    }
    constructor(constraints: fakeVideoTrackConstraints) {
        this.constraints = constraints;
        this.canvas = document.createElement("canvas")
        this.canvas.width = constraints.width;
        this.canvas.height = constraints.height;

        const ctx = this.canvas.getContext('2d')
        if (ctx){
            this.ctx = ctx
        }else{
            throw new Error("Not supported")
        }
    }
    drawFrame (fromSetInterval:boolean = false, tsIn?: number){
        const ts = Date.now()
        if (this.trackEnded){
            getRTCTimer().clearInterval(this.interval);
            if (this.displayInfo){
                this.displayInfo.stream.getTracks().forEach((track)=>{
                    track.stop()
                })
                this.displayInfo = null
            }
            return;
        }
        this.frameHistory = this.frameHistory.filter((item)=>{
            return ts - item.time < this.frameHistoryTime
        })
        const fps = this.frameHistory.length / Math.min(ts - this.startTime, this.frameHistoryTime) * 1000
        const frameInterval = this.frameHistory[this.frameHistory.length - 1] ? ts - this.frameHistory[this.frameHistory.length - 1].time : 99999
        if (
            // fps超了
            fps > this.constraints.frameRate ||
            // 与上一帧间隔短了
            this.frameMinInterval > frameInterval
        ){
            if (!fromSetInterval){
                window.requestAnimationFrame(this.drawFrame.bind(this, false));
            }
            return;
        }
        this.frameHistory.push({time: ts, fromSetInterval})

        if (this.displayInfo?.video?.videoWidth){
            if (
                this.canvas.width !== this.displayInfo.video.videoWidth ||
                this.canvas.height !== this.displayInfo.video.videoHeight
            )
            {
                console.log(`屏幕共享宽高修正 ${this.canvas.width}x${this.canvas.height}=>${this.displayInfo.video.videoWidth}x${this.displayInfo.video.videoHeight}`)
                this.canvas.width = this.displayInfo.video.videoWidth;
                this.canvas.height = this.displayInfo.video.videoHeight;
            }
            const ctx = this.ctx;
            ctx.drawImage(this.displayInfo.video, 0, 0)
        }

        if (this.videoInfo?.hookDrawFrame){
            this.videoInfo.hookDrawFrame()
        }
        if (!fromSetInterval){
            window.requestAnimationFrame(this.drawFrame.bind(this, false));
        }
    }
    start (){
        this.startTime = Date.now();
        this.frameMinInterval = Math.floor(1000 / this.constraints.frameRate)
        this.drawFrame(false, performance.now())
        this.interval = getRTCTimer().setInterval(this.drawFrame.bind(this, true), 0)
        //@ts-ignore
        const stream:MediaStream = this.canvas.captureStream(this.constraints.frameRate)
        const videoTrack = stream.getVideoTracks()[0];
        videoTrack.addEventListener("ended", ()=>{
            this.trackEnded = true
        })
        // setInterval(()=>{
        //     const cntFromSetInterval = this.frameHistory.filter((item)=>{
        //         return item.fromSetInterval;
        //     })
        //     console.log("cntFromSetInterval", cntFromSetInterval.length, "/", this.frameHistory.length)
        // }, this.frameHistoryTime)
        this.videoInfo  = {
            track: videoTrack,
            context: this.ctx,
            canvas: this.canvas,
        }

        navigator.mediaDevices.getDisplayMedia({
            video: {
                width: this.constraints.width,
                height: this.constraints.height,
                frameRate: this.constraints.frameRate,
            }
        }).then((stream)=>{
            const track:any = stream.getVideoTracks()[0]
            if (track?.focus){
               track.focus("no-focus-change");
            }

            const video = document.createElement("video");
            video.srcObject = stream;
            video.muted = true
            video.play()
            this.displayInfo = {
                stream,
                video,
            }
        })
        return this.videoInfo;
    }
}
