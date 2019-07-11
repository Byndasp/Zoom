export default class Zoom {
  constructor({
    selector = '.zoom-image',
    zoomInBtn = null,
    zoomOutBtn = null,
    zoomStep = 0.12,
    zoomCurrent = 1,
    zoomMin = 0.1,
  }) {
    this.selector = typeof selector === 'string' ? document.querySelector(selector) : selector;
    this.image = this.selector.querySelector('img');
    this.zoomInBtn = typeof zoomInBtn === 'string' ? document.querySelector(zoomInBtn) : zoomInBtn;
    this.zoomOutBtn = typeof zoomOutBtn === 'string' ? document.querySelector(zoomOutBtn) : zoomOutBtn;
    this.zoomStep = zoomStep;
    this.zoomCurrent = zoomCurrent;
    this.zoomMin = zoomMin;
    this.imageW = this.image.offsetWidth;
    this.imageH = this.image.offsetHeight;

    this.init();
  }

  init() {
    if (this.selector === null) return;
    this.createBtn();
    this.image.addEventListener('mousedown', ev => this.handleMouseDown(ev));
    this.image.addEventListener('dblclick', () => this.zoomInOut(true));
    this.image.ondragstart = () => false;
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
      this.zoomCurrent += this.zoomStep;
    } else if (this.zoomCurrent - this.zoomStep > this.zoomMin) {
      this.zoomCurrent -= this.zoomStep;
    }
    this.image.style.width = `${this.imageW * this.zoomCurrent}px`;
    this.image.style.height = `${this.imageH * this.zoomCurrent}px`;
    this.image.style.maxWidth = 'none';
    this.image.style.maxHeight = 'none';
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
    let imageX;
    let imageY;

    // centers the this.image at (pageX, pageY) coordinates
    const imageMove = (ev) => {
      const { pageX, pageY } = ev;
      imageX = pageX - left - offsetX;
      imageY = pageY - top - pageYOffset - offsetY;

      // Prevent wrong position of image
      this.image.style.right = 'auto';
      this.image.style.bottom = 'auto';

      // Check border position of image wrapper
      if (pageX >= left && pageX <= right && pageY - pageYOffset >= top && pageY - pageYOffset <= bottom) {
        this.image.style.top = `${imageY}px`;
        this.image.style.left = `${imageX}px`;
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
}
