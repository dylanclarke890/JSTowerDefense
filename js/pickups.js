var TD = TD || {};
TD.pickups = TD.pickups || {};

TD.pickups.Base = class extends TD.base.BaseCanvasModel {
  constructor(dimensions) {
    super(dimensions);
  }
};

TD.pickups.Resource = class extends TD.pickups.Base {
  constructor() {
    const size = board.cell.size;
    const x = TD.utils.random.upTo(canvas.width - size),
      y = (TD.utils.random.upTo(5, true) + 1) * (size + 25),
      width = size * 0.6,
      height = size * 0.6;
    super({ x, y, width, height });
    const amounts = playable.resources.amounts;
    this.amount = amounts[TD.utils.random.upTo(amounts.length, true)];
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(this.amount, this.x + 15, this.y + 25);
  }
};
