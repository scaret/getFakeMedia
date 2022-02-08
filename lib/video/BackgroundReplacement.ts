import {fakeVideoTrackConstraints} from "./video";
import {SelfieSegmentation} from "../../selfie_segmentation/selfie_segmentation";
import {autoplayBanner, hideAutoPlayBanner, showAutoPlayBanner} from "../autoplayBanner";

export class BackgroundReplacement {
    private constraints: fakeVideoTrackConstraints;
    camera: {
        track?: MediaStreamTrack;
        stream?: MediaStream;
        imageCaptureVideo?: HTMLVideoElement;
        imageCaptureCanvas?: HTMLCanvasElement;
        imageCaptureContext?: CanvasRenderingContext2D;
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
            const url = `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`
            // const url = `/selfie_segmentation/locateFiles/${file}`
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

        const settings = this.camera.track?.getSettings()
        if (!this.camera.imageCaptureCanvas || !settings?.width || !settings?.height || !this.camera.imageCaptureContext || !this.camera.imageCaptureVideo){
            console.error("Env not ready")
            return;
        }
        this.camera.imageCaptureCanvas.width = settings.width
        this.camera.imageCaptureCanvas.height = settings.height
        this.camera.imageCaptureContext.drawImage(this.camera.imageCaptureVideo, 0, 0)
        this.selfieSegmentation.send({
            image: this.camera.imageCaptureCanvas
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
        navigator.mediaDevices.getUserMedia({
            video: {
                width: this.constraints.width,
                height: this.constraints.height,
                frameRate: this.constraints.frameRate,
            }
        }).then((mediaStream)=>{
            this.camera.stream = mediaStream
            this.camera.track = mediaStream.getVideoTracks()[0]
            this.camera.imageCaptureCanvas = document.createElement("canvas")
            this.camera.imageCaptureCanvas.className = "imageCaptureCanvas"
            // document.body.appendChild(this.camera.imageCaptureCanvas)
            const imageCaptureContext = this.camera.imageCaptureCanvas.getContext("2d")
            if (!imageCaptureContext){
                throw new Error("Context Error")
            }
            this.camera.imageCaptureContext = imageCaptureContext;
            this.camera.imageCaptureVideo = document.createElement("video")
            this.camera.imageCaptureVideo.srcObject = mediaStream
            this.camera.imageCaptureVideo.setAttribute("playsinline", "playsinline")
            this.camera.imageCaptureVideo.setAttribute("muted", "muted")
            this.camera.imageCaptureVideo.setAttribute("autoplay", "autoplay")
            this.camera.imageCaptureVideo.className = "imageCaptureVideo"
            // document.body.appendChild(this.camera.imageCaptureVideo)
            this.camera.imageCaptureVideo.play()
            this.camera.imageCaptureVideo.addEventListener("playing", ()=>{
                console.log("Playing", this.frameRequest.current)
                if (!this.frameRequest.current){
                    this.requestFrame()
                }
            })
            autoplayBanner.addEventListener("click", ()=>{
                if (this.camera.imageCaptureVideo){
                    this.camera.imageCaptureVideo.play()
                }
            })
            this.camera.imageCaptureVideo.addEventListener("pause", ()=>{
                console.log("Paused", this.frameRequest.current)
                showAutoPlayBanner()
            })
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
