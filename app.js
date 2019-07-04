import Zoom from "./module/zoom.js";

const zoomedImages = document.querySelectorAll('.zoom-img_wrap');
for (let i = 0; i < zoomedImages.length; i += 1) {
  new Zoom({ selector: zoomedImages[i] });
}
