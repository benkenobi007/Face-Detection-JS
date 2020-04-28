var video = document.getElementById('video')
var container = document.getElementById('container')

var displaySize = {
  width: video.width,
  height: video.height
}

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

    var webWorker = new Worker('src/faceDetectWorker.js')

    var canvas_frame = document.createElement('canvas');
    canvas_frame.height = video.height
    canvas_frame.width = video.width
    var ctx = canvas_frame.getContext('2d');

    //Detect and crop function
    async function detectAndCrop() {
      console.log('creating canvas, calling worker')
      ctx.drawImage(video, 0, 0, canvas_frame.width, canvas_frame.height)
      var frame = ctx.getImageData(0, 0, canvas_frame.width, canvas_frame.height)

      var message = {
        videoFrame: frame
      }
      try {
        webWorker.postMessage(message)

        webWorker.onmessage = (e) => {
          if (e.boundingBox !== 'undefined') {
            var detectX = e.boundingBox.x
            var detectY = e.boundingBox.y
            var detectWidth = e.boundingBox.width
            var detectHeight = e.boundingBox.height

            //Crop
            var croppedSquareLength = detectWidth > detectHeight ? detectWidth : detectHeight
            container.style.width = croppedSquareLength + 50 + "px"
            container.style.height = croppedSquareLength + 50 + "px"
            container.style.borderRadius = "90%"

            video.style.marginLeft = -detectX + "px"
            video.style.marginTop = (-detectY + 50) + "px"
          }
        }
      } catch (err) {
        console.log(err)
      }
      setTimeout(detectAndCrop, 1000)

      //Draw detections
      // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      // faceapi.draw.drawDetections(canvas, resizedDetections)

    }

    detectAndCrop()
  }

)