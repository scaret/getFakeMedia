const canvasElement =
    document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResults(results){
    console.log("onResults", results);
    setTimeout(()=>{
        requestFrame()
    }, 50)

    // Draw the overlays.
    canvasCtx.save();

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.drawImage(
        results.segmentationMask, 0, 0, canvasElement.width,
        canvasElement.height);

    canvasCtx.globalCompositeOperation = 'source-in';
    // This can be a color or a texture or whatever...
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
        bgImg, 0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.restore();
}

const selfieSegmentation = new SelfieSegmentation({locateFile: (file) => {
    return `./locateFiles/${file}`;
}});
selfieSegmentation.onResults(onResults);

let imageCapture = null
const bgImg = document.createElement("img")
bgImg.src = "mountain.jpeg"
let timer = null
const main = async ()=>{
    const mediaStream = await navigator.mediaDevices.getUserMedia({video: true})
    imageCapture = new ImageCapture(mediaStream.getVideoTracks()[0])
    const options = {
        "selfieMode": true,
        "modelSelection": 1,
    }
    selfieSegmentation.setOptions(options)
    requestFrame()
}

const requestFrame = async ()=>{
    const imageBitMap = await imageCapture.grabFrame()
    await selfieSegmentation.send({image: imageBitMap});
}
main()
