import Zoom from "./zoom/zoom.js";

const zoomedImages = document.querySelectorAll('.zoom-img_wrap');
for (let i = 0; i < zoomedImages.length; i += 1) {
  new Zoom({
    container: zoomedImages[i],
    btnControl: true
  });
}
