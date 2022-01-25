import {fakeVideoTrackConstraints} from "./video";
import {SelfieSegmentation} from "../../selfie_segmentation/selfie_segmentation";

export class BackgroundReplacement {
    private constraints: fakeVideoTrackConstraints;
    camera: {
        track?: MediaStreamTrack;
        imageCapture?: ImageCapture;
    } = {}
    frameRequest:{
        current: number,
        total: number,
        startTime: number,
    } = {
        current: 0,
        total: 0,
        startTime: 0,
    };
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
    private selfieSegmentation = new SelfieSegmentation({
        locateFile: (file)=>{
            // const url = `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`
            const url = `/selfie_segmentation/locateFiles/${file}`
            return url;
        }
    })
    constructor(constraints: fakeVideoTrackConstraints) {
        const options = {
            "selfieMode": true,
            "modelSelection": 1,
        }
        this.selfieSegmentation.setOptions(options)
        this.constraints = constraints;
        this.canvas = document.createElement("canvas")
        this.canvas.width = constraints.width;
        this.canvas.height = constraints.height;
        const ctx = this.canvas.getContext('2d')
        if (ctx){
            this.ctx = ctx
        }else{
            throw new Error('Not Supported')
        }
    }
    async requestFrame(){
        this.frameRequest.startTime = Date.now()
        this.frameRequest.current++
        this.frameRequest.total++
        if (!this.camera.imageCapture){
            return;
        }
        let imageBitMap
        try{
            imageBitMap = await this.camera.imageCapture.grabFrame()
        }catch(e:any){
            console.error(e.name, e.message, this.camera.track?.readyState, e)
            await new Promise((res)=>{
                setTimeout(res, 100)
            })
            this.frameRequest.current--
            this.requestFrame()
            return;
        }
        this.selfieSegmentation.send({
            // @ts-ignore
            image: imageBitMap
        })
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
        this.selfieSegmentation.onResults((results)=>{
            this.frameRequest.current--
            const timeout = this.frameMinInterval - (Date.now() - this.frameRequest.startTime)
            setTimeout(()=>{
                if (!this.trackEnded && this.frameRequest.current === 0){
                    this.requestFrame()
                }
            },  timeout)
            if (this.canvas && this.ctx){
                // Draw the overlays.
                this.ctx.save();

                // 人像识别蒙板
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(
                    results.segmentationMask, 0, 0, this.canvas.width,
                    this.canvas.height);

                // 人的部分
                this.ctx.globalCompositeOperation = 'source-in';
                // This can be a color or a texture or whatever...
                this.ctx.drawImage(
                    results.image, 0, 0, this.canvas.width, this.canvas.height);

                // 背景的部分
                this.ctx.globalCompositeOperation = 'destination-atop';
                this.drawBackground()

                this.ctx.restore();

                if (this.videoInfo?.hookDrawFrame){
                    this.videoInfo.hookDrawFrame()
                }

            }
        })
        // document.body.appendChild(this.camera.video)
        navigator.mediaDevices.getUserMedia({
            video: {
                width: this.constraints.width,
                height: this.constraints.height,
                frameRate: this.constraints.frameRate,
            }
        }).then((mediaStream)=>{
            this.camera.track = mediaStream.getVideoTracks()[0]
            this.camera.imageCapture = new ImageCapture(this.camera.track)
            const settings = this.camera.track.getSettings()
            this.requestFrame()
        })
        if (this.canvas){
            this.canvas.width = this.constraints.width
            this.canvas.height = this.constraints.height
        }
        this.drawBackground()
        // @ts-ignore
        const stream:MediaStream = this.canvas.captureStream(this.constraints.frameRate)
        const videoTrack = stream.getVideoTracks()[0];
        videoTrack.addEventListener("ended", ()=>{
            this.trackEnded = true
        })
        this.videoInfo  = {
            track: videoTrack,
            context: this.ctx,
            canvas: this.canvas,
        }
        return this.videoInfo;
    }
}
