export interface fakeVideoTrackConstraints{
    width: number;
    height: number;
    frameRate: number;
    content: string;
    background: string;
}

class Clock{
    private constraints: fakeVideoTrackConstraints;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private frameHistory: {time: Date}[] = []
    private frameHistoryTime = 2000;
    private startTime: number = 0;
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
    drawFrame (){
        var now = new Date();
        this.frameHistory = this.frameHistory.filter((item)=>{
            return now.getTime() - item.time.getTime() < this.frameHistoryTime
        })
        const fps = this.frameHistory.length / Math.min(now.getTime() - this.startTime, this.frameHistoryTime) * 1000
        if (fps > this.constraints.frameRate){
            window.requestAnimationFrame(this.drawFrame.bind(this));
            return;
        }
        this.frameHistory.push({time: now})

        const ctx = this.ctx;

        ctx.save();
        ctx.fillStyle = this.constraints.background;
        ctx.fillRect(0,0,this.constraints.width,this.constraints.height);

        ctx.font = "44px serif";
        ctx.fillStyle = "black";
        const text1 = `${this.constraints.content}`
        ctx.fillText(text1, this.constraints.width - 480, this.constraints.height - 150)
        const text2 = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`
        ctx.fillText(text2, this.constraints.width - 480, this.constraints.height - 100)
        const text3 = `Capture${this.canvas.width}x${this.canvas.height} fps${fps} `
        ctx.fillText(text3, this.constraints.width - 480, this.constraints.height - 50)

        ctx.translate(150,150);
        ctx.rotate(-Math.PI/2);
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";

        // Hour marks
        ctx.save();
        for (var i=0;i<12;i++){
            ctx.beginPath();
            ctx.rotate(Math.PI/6);
            ctx.moveTo(100,0);
            ctx.lineTo(120,0);
            ctx.stroke();
        }
        ctx.restore();

        // Minute marks
        ctx.save();
        ctx.lineWidth = 5;
        for (i=0;i<60;i++){
            if (i%5!=0) {
                ctx.beginPath();
                ctx.moveTo(117,0);
                ctx.lineTo(120,0);
                ctx.stroke();
            }
            ctx.rotate(Math.PI/30);
        }
        ctx.restore();

        var sec = now.getSeconds();
        var min = now.getMinutes();
        var hr  = now.getHours();
        hr = hr>=12 ? hr-12 : hr;

        ctx.fillStyle = "black";

        // write Hours
        ctx.save();
        ctx.rotate( hr*(Math.PI/6) + (Math.PI/360)*min + (Math.PI/21600)*sec )
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(-20,0);
        ctx.lineTo(80,0);
        ctx.stroke();
        ctx.restore();

        // write Minutes
        ctx.save();
        ctx.rotate( (Math.PI/30)*min + (Math.PI/1800)*sec )
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(-28,0);
        ctx.lineTo(112,0);
        ctx.stroke();
        ctx.restore();

        // Write seconds
        ctx.save();
        ctx.rotate((now.getTime() % 60000) / 1000 * Math.PI/30);
        ctx.strokeStyle = "#D40000";
        ctx.fillStyle = "#D40000";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-30,0);
        ctx.lineTo(83,0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0,0,10,0,Math.PI*2,true);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(95,0,10,0,Math.PI*2,true);
        ctx.stroke();
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.arc(0,0,3,0,Math.PI*2,true);
        ctx.fill();
        ctx.restore();

        //
        // write Minutes
        ctx.save();
        ctx.rotate( (Math.PI/1000 * 2) * (Date.now() % 1000))
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-28,0);
        ctx.lineTo(120,0);
        ctx.stroke();
        ctx.restore();
        //

        ctx.beginPath();
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#325FA2';
        ctx.arc(0,0,142,0,Math.PI*2,true);
        ctx.stroke();

        ctx.restore();

        window.requestAnimationFrame(this.drawFrame.bind(this));
    }
    start (){
        this.startTime = Date.now();
        this.drawFrame()
        //@ts-ignore
        return this.canvas.captureStream(this.constraints.frameRate)
    }
}

export function getVideoTrack(constraints: fakeVideoTrackConstraints){
    const clock = new Clock(constraints);
    const mediaStream:MediaStream = clock.start()
    return mediaStream.getVideoTracks()[0];
}