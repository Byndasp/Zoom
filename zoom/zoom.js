export default class Zoom {
  constructor({
                container = '.zoom-image',
                zoomType = {
                  zoom: 'zoom-container',
                  button: 'button',
                  preview: 'preview',
                },
                btnZoomIn = null,
                btnZoomOut = null,
                scaleStep = 0.12,
                scaleCurrent = 1,
                scaleMin = 0.12,
                btnControl = false,
                wheelControl = true,
                doubleClickControl = true,
                hoverZoom = false,
                zoomContainer = null,
                zoomContainerScale = 2
              }) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.zoomType = zoomType;
    this.image = this.container.querySelector('img');
    this.btnZoomIn = typeof btnZoomIn === 'string' ? document.querySelector(btnZoomIn) : btnZoomIn;
    this.btnZoomOut = typeof btnZoomOut === 'string' ? document.querySelector(btnZoomOut) : btnZoomOut;
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
    this.hoverZoom = hoverZoom;
    this.zoomContainerScale = zoomContainerScale;
    this.zoomContainer = typeof zoomContainer === 'string' ? document.querySelector(zoomContainer) : zoomContainer;

    this.init();
  }

  init() {
    if (this.container === null) return;
    if (this.btnControl) this.createBtn();
    if (this.hoverZoom) this.createZoomPreview();

    this.initEvents();
    if (!this.hoverZoom) this.centerElement();
    this.image.ondragstart = () => false;
  }

  initEvents() {
    if (this.wheelControl) {
      this.container.addEventListener('wheel', ev => this.handleWheel(ev));
      this.container.addEventListener('mouseover', () => {
        window.addEventListener('wheel', this.constructor.disableScroll, {passive: false});
      });
      this.container.addEventListener('mouseout', () => {
        window.removeEventListener('wheel', this.constructor.disableScroll, {passive: true});
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

  createContainer() {

  }

  createZoomPreview() {
    this.container.style.width = `${this.imageW}px`;
    this.container.style.height = `${this.imageH}px`;

    if (this.zoomContainer === null) {
      this.zoomContainer = document.createElement('div');
      this.zoomContainer.classList.add('zoom-container');
      this.container.appendChild(this.zoomContainer);
    }

    this.zoomContainer.style.backgroundImage = `url(${this.image.src})`;
    this.zoomContainer.style.backgroundSize = `${this.imageW * this.zoomContainerScale}px ${this.imageH * this.zoomContainerScale}px`;

    this.container.addEventListener('mouseover', e => this.handleZoomContainer(e));
    this.container.addEventListener('mouseout', () => {
      this.container.removeEventListener('mouseover', () => this.handleZoomContainer());
      this.showHideZoomContainer(false)
    });
  }

  createBtn() {
    if (this.btnZoomOut === null) {
      this.btnZoomOut = document.createElement('span');
      this.btnZoomOut.classList.add('btn-zoom-out');
      this.container.appendChild(this.btnZoomOut);
    }

    if (this.btnZoomIn === null) {
      this.btnZoomIn = document.createElement('span');
      this.btnZoomIn.classList.add('btn-zoom-in');
      this.container.appendChild(this.btnZoomIn);
    }

    this.btnZoomIn.addEventListener('click', () => this.zoomInOut(true));
    this.btnZoomOut.addEventListener('click', () => this.zoomInOut(false));
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

    // Get coordinates of image wrapper
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
      console.log(ev);
      // Get cursor or touch position
      const {
        clientX,
        clientY,
      } = ev.targetTouches ? ev.targetTouches[0] : ev;

      // Check border coordinates of image wrapper
      const borderX = clientX > left && clientX < right;
      const borderY = clientY > top && clientY < bottom;

      // Calculate image position inside wrapper
      imageX = this.targetOffsetX + parseInt(clientX, 10) - parseInt(startClientX, 10);
      imageY = this.targetOffsetY + parseInt(clientY, 10) - parseInt(startClientY, 10);

      // Check border position of image wrapper
      if (borderX && borderY) {
        this.moveElementTo(imageX, imageY);
      } else {
        document.removeEventListener('touchmove', imageMove);
        document.removeEventListener('mousemove', imageMove);
        window.removeEventListener('touchmove', this.constructor.disableScroll, {passive: true});
        this.updateCoordinates(imageX, imageY);
      }
    };

    // move the this.image on mousemove
    document.addEventListener('touchmove', imageMove);
    document.addEventListener('mousemove', imageMove);
    window.addEventListener('touchmove', this.constructor.disableScroll, {passive: false});

    this.image.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', imageMove);
      window.removeEventListener('touchmove', this.constructor.disableScroll, {passive: true});
      this.updateCoordinates(imageX, imageY);
      this.image.ontouchend = null;
    });

    this.image.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', imageMove);
      this.updateCoordinates(imageX, imageY);
      this.image.onmouseup = null;
    });
  }

  handleZoomContainer() {
    const {
      left,
      right,
      top,
      bottom,
    } = this.container.getBoundingClientRect();

    let zoomContainerX = null;
    let zoomContainerY = null;

    const zoomContainerMove = (ev) => {
      const {
        clientX,
        clientY,
      } = ev;
      const containerX = clientX - left;
      const containerY = clientY - top;

      const borderX = clientX - this.zoomContainer.clientWidth / 2 > left && clientX + this.zoomContainer.clientWidth / 2 < right;
      const borderY = clientY - this.zoomContainer.clientHeight / 2 > top && clientY + this.zoomContainer.clientHeight / 2 < bottom;

      const bgPosX = (containerX - this.zoomContainer.clientWidth) * this.zoomContainerScale;
      const bgPosY = (containerY - this.zoomContainer.clientHeight) * this.zoomContainerScale;

      if (borderX) zoomContainerX = containerX - this.zoomContainer.clientWidth / 2;
      if (borderY) zoomContainerY = containerY - this.zoomContainer.clientHeight / 2;

      this.zoomContainer.style.backgroundPosition = `-${bgPosX}px -${bgPosY}px`;
      this.zoomContainer.style.transform = `translate3d(${zoomContainerX}px, ${zoomContainerY}px, 0)`;
    };

    this.container.addEventListener('mousemove', e => zoomContainerMove(e));
    this.showHideZoomContainer();
  }

  showHideZoomContainer(show = true) {
    this.zoomContainer.classList.toggle('active', show);
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
