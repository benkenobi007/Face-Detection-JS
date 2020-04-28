// Web worker for face detection
faceapi.nets.tinyFaceDetector.loadFromUri('/models')
this.onmessage = async function handler(e) {
    console.log("in worker !")
    if (e.videoFrame !== 'undefined') {
        frame = e.videoFrame
        const detections = await faceapi.detectSingleFace(frame,
            new faceapi.TinyFaceDetectorOptions())

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
            setTimeout(detectAndCrop, 1000)
        }
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        console.log('xmin : ' + resizedDetections._box._x)
        console.log('ymin : ' + resizedDetections._box._y)
        console.log('width : ' + resizedDetections._box._width)
        console.log('height : ' + resizedDetections._box._height)

        //Send Bounding box to main thread
        var message = {
            boundingBox: {
                xmin: resizedDetections._box._x,
                ymin: resizedDetections._box._y,
                width: resizedDetections._box._width,
                height: resizedDetections._box._height
            }
        }

        this.postMessage(message)

    }
}