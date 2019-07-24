export default class Zoom {
  constructor({
    selector = '.zoom-image',
    zoomInBtn = null,
    zoomOutBtn = null,
    scaleStep = 0.12,
    targetScale = 1,
    zoomMin = 0.1,
  }) {
    this.selector = typeof selector === 'string' ? document.querySelector(selector) : selector;
    this.image = this.selector.querySelector('img');
    this.zoomInBtn = typeof zoomInBtn === 'string' ? document.querySelector(zoomInBtn) : zoomInBtn;
    this.zoomOutBtn = typeof zoomOutBtn === 'string' ? document.querySelector(zoomOutBtn) : zoomOutBtn;
    this.scaleStep = scaleStep;
    this.targetScale = targetScale;
    this.targetOffsetX = 0;
    this.targetOffsetY = 0;
    this.zoomMin = zoomMin;
    this.imageW = this.image.clientWidth;
    this.imageH = this.image.clientHeight;
    this.selectorW = this.selector.clientWidth;
    this.selectorH = this.selector.clientHeight;

    this.init();
  }

  init() {
    if (this.selector === null) return;
    this.createBtn();
    this.centerElement();
    this.image.addEventListener('mousedown', ev => this.handleMouseDown(ev));
    this.image.addEventListener('dblclick', () => this.zoomInOut(true));
    this.image.ondragstart = () => false;
  }

  centerElement() {
    this.targetOffsetX = (this.selectorW - this.imageW) / 2;
    this.targetOffsetY = (this.selectorH - this.imageH) / 2;
    this.moveElementTo();
  }

  createBtn() {
    if (this.zoomOutBtn === null) {
      this.zoomOutBtn = document.createElement('span');
      this.zoomOutBtn.classList.add('btn-zoom-out');
      this.selector.appendChild(this.zoomOutBtn);
    }

    if (this.zoomInBtn === null) {
      this.zoomInBtn = document.createElement('span');
      this.zoomInBtn.classList.add('btn-zoom-in');
      this.selector.appendChild(this.zoomInBtn);
    }

    this.zoomInBtn.addEventListener('click', () => this.zoomInOut(true));
    this.zoomOutBtn.addEventListener('click', () => this.zoomInOut(false));
  }

  zoomInOut(condition) {
    if (condition) {
      this.targetScale += this.scaleStep;
    } else if (this.targetScale - this.scaleStep > this.zoomMin) {
      this.targetScale -= this.scaleStep;
    }
    this.moveElementTo();
  }

  handleMouseDown(event) {
    const {
      offsetX,
      offsetY,
    } = event;
    const {
      left,
      right,
      top,
      bottom,
    } = this.selector.getBoundingClientRect();
    const { pageYOffset } = window;
    const offsetScaledX = offsetX * this.targetScale;
    const offsetScaledY = offsetY * this.targetScale;
    const imageHalfScaledW = (this.imageW * this.targetScale) / 2;
    const imageHalfScaledH = (this.imageH * this.targetScale) / 2;
    let imageX;
    let imageY;

    // centers the this.image at (pageX, pageY) coordinates
    const imageMove = (ev) => {
      const { pageX, pageY } = ev;
      imageX = pageX - left - offsetX;
      imageY = pageY - top - pageYOffset - offsetY;

      // Fix pointer position on image if scaled
      if (this.targetScale !== 1) {
        imageX -= offsetScaledX - imageHalfScaledW - (offsetX - (this.imageW / 2));
        imageY -= offsetScaledY - imageHalfScaledH - (offsetY - (this.imageH / 2));
      }

      // Prevent wrong position of image
      this.image.style.right = 'auto';
      this.image.style.bottom = 'auto';

      // Check border position of image wrapper
      if (pageX >= left && pageX <= right && pageY - pageYOffset >= top && pageY - pageYOffset <= bottom) {
        this.targetOffsetX = imageX;
        this.targetOffsetY = imageY;
        this.moveElementTo();
      } else {
        document.removeEventListener('mousemove', imageMove);
      }
    };

    // move the this.image on mousemove
    document.addEventListener('mousemove', imageMove);

    // drop the this.image, remove unneeded handlers
    this.image.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', imageMove);
      this.image.onmouseup = null;
    });
  }

  moveElementTo() {
    this.image.style.cssText = `transform : 
    translate3d(${this.targetOffsetX}px, ${this.targetOffsetY}px, 0) 
    scale3d(${this.targetScale}, ${this.targetScale}, 1);`;
  }
}
