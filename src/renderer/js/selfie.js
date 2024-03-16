const selfie = document.getElementById("selfie");
window.ipc.getSelfie((event, data) => {
  console.log(data);
  selfie.src = data;
});
