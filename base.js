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

TD.base.Cell = class extends TD.base.BaseCanvasModel {
  constructor(x, y) {
    super(x, y, board.cell.size, board.cell.size);
  }

  draw() {
    if (mouse.x && mouse.y && TD.utils.isColliding(this, mouse)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
};
