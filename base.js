var TD = TD || {};
TD.base = TD.base || {};

TD.base.Sprite = class {
  constructor(src, width, height, minFrame, maxFrame) {
    this.image = new Image();
    this.image.src = src;
    this.width = width;
    this.height = height;
    this.minFrame = minFrame;
    this.maxFrame = maxFrame;
  }
};

TD.base.BaseCanvasModel = class {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  update() {
    throw new Error("Method not implemented.");
  }

  draw() {
    throw new Error("Method not implemented.");
  }
};

