import {fakeVideoTrackConstraints} from "./video";

export class RandomColor{
    private constraints: fakeVideoTrackConstraints;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private frameHistory: {time: number, fromSetInterval: boolean}[] = []
    private frameHistoryTime = 2000;
    private startTime: number = 0;
    private interval: any = null;
    private frameMinInterval: number = 0;
    private trackEnded: boolean = false;
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
            clearInterval(this.interval);
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

        const ctx = this.ctx;

        this.drawBackground()

        // STARTOF随机颜色
        const imageData = ctx.getImageData(0, 0, this.constraints.width, this.constraints.height)
        for (let left = 0; left < this.constraints.width; left++){
            for (let top = 0 ; top < this.constraints.height; top++) {
                let randomNum = Math.floor(Math.random() * 16777216)
                imageData.data[(left * this.constraints.height + top) * 4 + 0] = randomNum % 256
                randomNum = randomNum >> 8
                imageData.data[(left * this.constraints.height + top) * 4 + 1] = randomNum % 256
                randomNum = randomNum >> 8
                imageData.data[(left * this.constraints.height + top) * 4 + 2] = randomNum % 256
                randomNum = randomNum >> 8
                imageData.data[(left * this.constraints.height + top) * 4 + 3] = 255
            }
        }
        ctx.putImageData(imageData, 0, 0)
        // ENDOF随机颜色

        // STARTOF写字
        ctx.save();

        const now = new Date(ts);
        ctx.font = "44px serif";
        ctx.fillStyle = "black";
        const text1 = `${this.constraints.content}`
        ctx.fillText(text1, this.constraints.width - 480, this.constraints.height - 150)
        const text2 = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`
        ctx.fillText(text2, this.constraints.width - 480, this.constraints.height - 100)
        const text3 = `Capture${this.canvas.width}x${this.canvas.height} fps${fps} `
        ctx.fillText(text3, this.constraints.width - 480, this.constraints.height - 50)
        ctx.restore();
        // ENDOF写字

        if (this.videoInfo?.hookDrawFrame){
            this.videoInfo.hookDrawFrame()
        }
        if (!fromSetInterval){
            window.requestAnimationFrame(this.drawFrame.bind(this, false));
        }
    }
    drawBackground(){
        if (this.constraints.bgColor){
            this.ctx.fillStyle = this.constraints.bgColor;
            this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        }
        if (this.constraints.bgImg){
            this.ctx.drawImage(this.constraints.bgImg, 0, 0, this.canvas.width, this.canvas.height)
        }
    }
    start (){
        this.startTime = Date.now();
        this.frameMinInterval = Math.floor(1000 / this.constraints.frameRate)
        this.drawFrame(false, performance.now())
        // this.interval = setInterval(this.drawFrame.bind(this, true), 0)
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
        return this.videoInfo;
    }
}
