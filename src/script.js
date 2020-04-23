var video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models')
  //faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
        video: true
      })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (err) {
        console.log("Something went wrong!");
      });
  }
}

video.addEventListener('play', () => {
    //Resize the detection
    const displaySize = {
      width: video.width,
      height: video.height
    }

    const canvas = faceapi.createCanvasFromMedia(video)
    faceapi.matchDimensions(canvas, displaySize)
    document.body.append(canvas)
    setInterval(async () => {

      const detections = await faceapi.detectSingleFace(video,
        new faceapi.TinyFaceDetectorOptions())

      /*
         const detections = await faceapi.detectAllFaces(video,
           new faceapi.SsdMobilenetv1Options())
           */
      //console.log(detections)
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, resizedDetections)

    }, 100)
  }

)