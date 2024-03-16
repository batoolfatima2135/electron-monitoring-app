const text = document.getElementById("heading");
const btn = document.getElementById("button");
const selfie = document.getElementById("selfie");
const screenshotDiv = document.getElementById("screenshots");
const video = document.getElementById("camera");

function captureAndDisplayScreenshot() {
  window.ipc.captureScreenshot();
  window.ipc.removeListener();
  window.ipc.getScreenshot(handleScreenshotData);
}

function handleScreenshotData(event, data) {
  const img = document.createElement("img");
  img.src = data.dataURL;
  Toastify({
    text: data.message,
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();

  screenshotDiv.appendChild(img);
}

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

btn.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.height = video.videoHeight;
  canvas.width = video.videoWidth;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  const img = canvas.toDataURL();
  window.ipc.sendSelfie(img);
  selfie.src = img;
});

setInterval(captureAndDisplayScreenshot, 20000);
