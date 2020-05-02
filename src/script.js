var video = document.getElementById('video')
var container = document.getElementById('container')

var displaySize = {
  width: video.width,
  height: video.height
}

// Promise.all([
//   faceapi.nets.tinyFaceDetector.loadFromUri('/models')
//   //faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
// ]).then(startVideo)


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

startVideo()

video.addEventListener('play', () => {
    //const canvas = faceapi.createCanvasFromMedia(video)
    // faceapi.matchDimensions(canvas, displaySize)
    // document.body.append(canvas)
    const canvas_box = document.createElement("canvas")
    canvas_box.width = video.offsetWidth
    canvas_box.height = video.offsetHeight
    canvas_box.style.position = "absolute"

    document.body.append(canvas_box)
    var ctx = canvas_box.getContext("2d")
    ctx.strokeStyle = "#0000FF"
    ctx.lineWidth = 7;

    var webWorker = new Worker('src/faceDetectWorker.js')

    //Detect and crop function
    async function detectAndCrop() {
      console.log('creating canvas, calling worker')

      const frame = await createImageBitmap(video);
      //ctx.drawImage(video, 0, 0, canvas_frame.width, canvas_frame.height)
      //var frame = ctx.getImageData(0, 0, canvas_frame.width, canvas_frame.height)
      //console.log(frame)
      var message = {
        videoFrame: frame,
        width: video.width,
        height: video.height
      }
      console.log('message:', message)

      try {
        webWorker.postMessage(message, [frame])

        webWorker.onmessage = (e) => {
          if (e.data.boundingBox !== 'undefined') {
            var detectX = e.data.boundingBox.xmin
            var detectY = e.data.boundingBox.ymin
            var detectWidth = e.data.boundingBox.width
            var detectHeight = e.data.boundingBox.height

            //Crop
            var croppedSquareLength = detectWidth > detectHeight ? detectWidth : detectHeight
            container.style.width = croppedSquareLength + 50 + "px"
            container.style.height = croppedSquareLength + 50 + "px"
            container.style.borderRadius = "90%"

            console.log('detectX = ', detectX)
            console.log('detectY = ', detectY)
            video.style.marginLeft = -detectX + "px"
            video.style.marginTop = (-detectY + 50) + "px"

            //Draw detection            
            ctx.clearRect(0, 0, canvas_box.width, canvas_box.height)
            ctx.beginPath();
            ctx.rect(detectX, detectY, detectWidth, detectHeight)
            ctx.stroke()
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