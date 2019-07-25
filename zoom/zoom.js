export default class Zoom {
  constructor({
    container = '.zoom-image',
    zoomInBtn = null,
    zoomOutBtn = null,
    scaleStep = 0.12,
    scaleCurrent = 1,
    scaleMin = 0.12,
    btnControl = false,
    wheelControl = true,
    doubleClickControl = true,
  }) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.image = this.container.querySelector('img');
    this.zoomInBtn = typeof zoomInBtn === 'string' ? document.querySelector(zoomInBtn) : zoomInBtn;
    this.zoomOutBtn = typeof zoomOutBtn === 'string' ? document.querySelector(zoomOutBtn) : zoomOutBtn;
    this.scaleStep = scaleStep;
    this.scaleCurrent = scaleCurrent;
    this.scaleMin = scaleMin;
    this.imageW = this.image.clientWidth;
    this.imageH = this.image.clientHeight;
    this.containerW = this.container.clientWidth;
    this.containerH = this.container.clientHeight;
    this.targetOffsetX = 0;
    this.targetOffsetY = 0;
    this.btnControl = btnControl;
    this.wheelControl = wheelControl;
    this.doubleClickControl = doubleClickControl;

    this.init();
  }

  init() {
    if (this.container === null) return;
    if (this.btnControl) this.createBtn();

    this.initEvents();
    this.centerElement();
    this.image.ondragstart = () => false;
  }

  initEvents() {
    if (this.wheelControl) {
      this.container.addEventListener('wheel', ev => this.handleWheel(ev));
      this.container.addEventListener('mouseover', () => {
        window.addEventListener('wheel', this.constructor.disableScroll, { passive: false });
      });
      this.container.addEventListener('mouseout', () => {
        window.removeEventListener('wheel', this.constructor.disableScroll, { passive: true });
      });
    }
    if (this.doubleClickControl) this.image.addEventListener('dblclick', () => this.zoomInOut(true));
    this.image.addEventListener('mousedown', ev => this.handleStart(ev));
    this.image.addEventListener('touchstart', ev => this.handleStart(ev));
  }

  centerElement() {
    this.targetOffsetX = (this.containerW - this.imageW) / 2;
    this.targetOffsetY = (this.containerH - this.imageH) / 2;

    this.moveElementTo();
  }

  createBtn() {
    if (this.zoomOutBtn === null) {
      this.zoomOutBtn = document.createElement('span');
      this.zoomOutBtn.classList.add('btn-zoom-out');
      this.container.appendChild(this.zoomOutBtn);
    }

    if (this.zoomInBtn === null) {
      this.zoomInBtn = document.createElement('span');
      this.zoomInBtn.classList.add('btn-zoom-in');
      this.container.appendChild(this.zoomInBtn);
    }

    this.zoomInBtn.addEventListener('click', () => this.zoomInOut(true));
    this.zoomOutBtn.addEventListener('click', () => this.zoomInOut(false));
  }

  zoomInOut(condition) {
    if (condition) {
      this.scaleCurrent += this.scaleStep;
    } else if (this.scaleCurrent > this.scaleMin) {
      this.scaleCurrent -= this.scaleStep;
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
    } = this.container.getBoundingClientRect();
    let {
      targetOffsetX: imageX,
      targetOffsetY: imageY,
    } = this;

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
        window.removeEventListener('touchmove', this.constructor.disableScroll, { passive: true });
        this.updateCoordinates(imageX, imageY);
      }
    };

    // move the this.image on mousemove
    document.addEventListener('touchmove', imageMove);
    document.addEventListener('mousemove', imageMove);
    window.addEventListener('touchmove', this.constructor.disableScroll, { passive: false });

    this.image.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', imageMove);
      window.removeEventListener('touchmove', this.constructor.disableScroll, { passive: true });
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
    scale = this.scaleCurrent,
  ) {
    this.image.style.cssText = `transform : 
    translate3d(${offsetX}px, ${offsetY}px, 0) 
    scale3d(${scale}, ${scale}, 1);`;
  }

  static disableScroll(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }
}
