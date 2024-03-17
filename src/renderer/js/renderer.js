const text = document.getElementById("heading");
const btn = document.getElementById("button");
const monitorBtn = document.getElementById("monitor");
const selfie = document.getElementById("selfie");
const screenshotDiv = document.getElementById("screenshots");
const video = document.getElementById("camera");
const active = document.getElementById("activeTime");

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  // Pad single digit numbers with leading zeros
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return `<p class="w-32">${formattedHours}</p>
          <p class="-mt-2">:</p>
          <p class="w-32">${formattedMinutes}</p>
          <p class="-mt-2">:</p>
          <p class="w-32">${formattedSeconds}</p>`;
}

function captureAndDisplayScreenshot() {
  window.ipc.captureScreenshot();
  window.ipc.removeListener();
  window.ipc.getScreenshot(handleScreenshotData);
}

function handleScreenshotData(event, data) {
  const img = document.createElement("img");
  img.src = data.dataURL;
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
});

monitorBtn.addEventListener("click", () => {
  window.ipc.startMonitoring();
  Toastify({
    text: "Monitoring started",
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(45deg, #874da2 0%, #c43a30 100%);",
    },
  }).showToast();
});

window.ipc.getActiveTime((event, data) => {
  active.innerHTML = formatTime(data);
});

setInterval(captureAndDisplayScreenshot, 20000);
