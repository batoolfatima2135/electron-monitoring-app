const selfie = document.getElementById("image");
console.log(selfie);
window.ipc.getSelfie((event, data) => {
  console.log(data);
  selfie.src = data;
});
