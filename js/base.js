var TD = TD || {};
TD.base = TD.base || {};
var ID_COUNT = 0;

TD.base.Sprite = class {
  constructor(src, dimensions, frames) {
    this.image = new Image();
    this.image.src = src;
    const { width, height } = dimensions;
    this.width = width;
    this.height = height;
    this.frames = frames;
  }
};

TD.base.BaseCanvasModel = class {
  constructor(dimensions) {
    this.id = ++ID_COUNT;
    const { x, y, width, height } = dimensions;
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
    const size = board.cell.size;
    super({ x, y, width: size, height: size });
  }

  draw() {
    if (mouse.x && mouse.y && TD.utils.isColliding(this, mouse)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
};
