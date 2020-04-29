self.importScripts('faceEnvWorkerPatch.js')
self.importScripts('face-api.min.js');
var env = faceapi.env.createBrowserEnv();
console.log("environment : ", faceapi.env)
env.createCanvasElement = function () {
    return new OffscreenCanvas(640, 480);
};

faceapi.nets.tinyFaceDetector.loadFromUri('/models').then(
    async () => {
            this.console.log("Try to load")
            var test_canvas = new OffscreenCanvas(90, 90)
            const detections = await faceapi.detectSingleFace(test_canvas,
                new faceapi.TinyFaceDetectorOptions())
            loaded = true
            console.log('Model Loaded')
        },
        (err) => {
            console.log("failed")
            this.console.log(err)

        }
);

var loaded = false

this.onmessage = async function handler(e) {

    if (!loaded) {


        return;
    }

    console.log("in worker !")

    this.console.log(e.data.videoFrame)
    if (e.data.videoFrame !== 'undefined') {
        this.console.log("Got the frame ! Detecting")
        frame = e.data.videoFrame
        this.displaySize = {
            width: e.data.width,
            height: e.data.height
        }

        var canvas = new OffscreenCanvas(this.displaySize.width, this.displaySize.height)
        //faceapi.matchDimensions(canvas, displaySize)
        // canvas.width = this.displaySize.width;
        // canvas.height = this.displaySize.height;
        canvas.getContext('bitmaprenderer').transferFromImageBitmap(frame);

        const detections = await faceapi.detectSingleFace(canvas,
            new faceapi.TinyFaceDetectorOptions())

        this.console.log('detections: ', detections)
        /*
           const detections = await faceapi.detectAllFaces(frame,
             new faceapi.SsdMobilenetv1Options())
             */

        try {
            console.log('xmin : ' + detections._box._x)
            console.log('ymin : ' + detections._box._y)
            console.log('width : ' + detections._box._width)
            console.log('height : ' + detections._box._height)
        } catch (err) {
            console.log(err)
        }
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        console.log('xmin : ' + resizedDetections.box.x)
        console.log('ymin : ' + resizedDetections.box.y)
        console.log('width : ' + resizedDetections.box.width)
        console.log('height : ' + resizedDetections.box.height)

        //Send Bounding box to main thread
        var message = {
            boundingBox: {
                xmin: resizedDetections.box.x,
                ymin: resizedDetections.box.y,
                width: resizedDetections.box.width,
                height: resizedDetections.box.height
            }
        }

        this.postMessage(message)

    }
}