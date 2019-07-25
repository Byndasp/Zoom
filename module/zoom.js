export default class Zoom {
  constructor({
      selector = '.zoom-image',
      zoomInBtn = null,
      zoomOutBtn = null,
      scaleStep = 0.12,
      scaleTarget = 1,
      scaleMin = 0.12,
      btnControl = false,
      wheelControl = true,
    }) {
    this.selector = typeof selector === 'string' ? document.querySelector(selector) : selector;
    this.image = this.selector.querySelector('img');
    this.zoomInBtn = typeof zoomInBtn === 'string' ? document.querySelector(zoomInBtn) : zoomInBtn;
    this.zoomOutBtn = typeof zoomOutBtn === 'string' ? document.querySelector(zoomOutBtn) : zoomOutBtn;
    this.scaleStep = scaleStep;
    this.scaleTarget = scaleTarget;
    this.scaleMin = scaleMin;
    this.imageW = this.image.clientWidth;
    this.imageH = this.image.clientHeight;
    this.selectorW = this.selector.clientWidth;
    this.selectorH = this.selector.clientHeight;
    this.targetOffsetX = 0;
    this.targetOffsetY = 0;
    this.btnControl = btnControl;
    this.wheelControl = wheelControl;

    this.init();
  }

  init() {
    if (this.selector === null) return;
    if (this.btnControl) this.createBtn();
    if (this.wheelControl) this.selector.addEventListener('wheel', ev => this.handleWheel(ev));
    this.centerElement();
    this.image.addEventListener('mousedown', ev => this.handleStart(ev));
    this.image.addEventListener('touchstart', ev => this.handleStart(ev));
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
      this.scaleTarget += this.scaleStep;
    } else if (this.scaleTarget > this.scaleMin) {
      this.scaleTarget -= this.scaleStep;
    }
    this.moveElementTo();
  }

  handleWheel(event) {
    this.zoomInOut(event.wheelDelta > 0);
  }

  handleStart(event) {
    const {
      clientX: startClientX,
      clientY: startClientY,
    } = event.targetTouches ? event.targetTouches[0] : event;
    const {
      left,
      right,
      top,
      bottom,
    } = this.selector.getBoundingClientRect();
    let imageX;
    let imageY;

    const disableScroll = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    };

    // centers the this.image at (pageX, pageY) coordinates
    const imageMove = (ev) => {
      const {
        clientX,
        clientY,
      } = ev.targetTouches ? ev.targetTouches[0] : ev;

      // Calculate image position inside wrapper
      imageX = this.targetOffsetX + parseInt(clientX, 10) - parseInt(startClientX, 10);
      imageY = this.targetOffsetY + parseInt(clientY, 10) - parseInt(startClientY, 10);

      // Check border position of image wrapper
      if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
        this.moveElementTo(imageX, imageY);
      } else {
        document.removeEventListener('touchmove', imageMove);
        document.removeEventListener('mousemove', imageMove);
        window.removeEventListener('touchmove', disableScroll, { passive: false });
        this.updateCoordinates(imageX, imageY);
      }
    };

    // move the this.image on mousemove
    document.addEventListener('touchmove', imageMove);
    document.addEventListener('mousemove', imageMove);
    window.addEventListener('touchmove', disableScroll, { passive: false });

    this.image.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', imageMove);
      window.removeEventListener('touchmove', disableScroll, { passive: false });
      this.updateCoordinates(imageX, imageY);
      this.image.ontouchend = null;
    });

    this.image.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', imageMove);
      this.updateCoordinates(imageX, imageY);
      this.image.onmouseup = null;
    });
  }

  updateCoordinates(
    offsetX,
    offsetY,
  ) {
    this.targetOffsetX = offsetX;
    this.targetOffsetY = offsetY;
  }

  moveElementTo(
    offsetX = this.targetOffsetX,
    offsetY = this.targetOffsetY,
    scale = this.scaleTarget,
  ) {
    this.image.style.cssText = `transform : 
    translate3d(${offsetX}px, ${offsetY}px, 0) 
    scale3d(${scale}, ${scale}, 1);`;
  }
}
