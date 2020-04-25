var video = document.getElementById('video')
var container = document.getElementById('container')
var isFaceDetectCalled = 0 // Flag for set time out

//set video and container dimensions
// container.style.width = window.innerWidth + "px"
// video.style.height = window.innerHeight + "px"
// video.style.width = window.innerWidth + "px"
var displaySize = {
  width: video.width,
  height: video.height
}
// container.style.height = window.innerHeight + "px"

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
        console.log("Error : " + err);
      });
  }
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    faceapi.matchDimensions(canvas, displaySize)
    document.body.append(canvas)

    //Detect and crop function
    async function detectAndCrop() {
      isFaceDetectCalled = 1
      const detections = await faceapi.detectSingleFace(video,
        new faceapi.TinyFaceDetectorOptions())

      /*
         const detections = await faceapi.detectAllFaces(video,
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

      var detectX = resizedDetections._box._x
      var detectY = resizedDetections._box._y
      var detectWidth = resizedDetections._box._width
      var detectHeight = resizedDetections._box._height

      //Crop
      var croppedSquareLength = detectWidth > detectHeight ? detectWidth : detectHeight
      container.style.width = croppedSquareLength + 50 + "px"
      container.style.height = croppedSquareLength + 50 + "px"
      container.style.borderRadius = "90%"

      video.style.marginLeft = -detectX + "px"
      video.style.marginTop = (-detectY + 50) + "px"

      setTimeout(detectAndCrop, 1000)

      //Draw detections
      // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      // faceapi.draw.drawDetections(canvas, resizedDetections)

    }

    detectAndCrop()
  }

)