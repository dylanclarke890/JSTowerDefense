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

TD.base.new2dCanvas = function (id, width, height) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
};

/**
 * Remove items from an array and return the next index. 
 * Useful for during loops as the new index can be used to ensure
 * items are not accidentally skipped.
 * @param {Array} arr array to splice.
 * @param {number} start index to start from.
 * @param {number} deleteCount how many to remove.
 * @returns {number} The index of the next item in the list, or zero if no items are left.
 */
TD.base.splice = function (arr, start, deleteCount) {
  arr.splice(start, deleteCount);
  if (start - deleteCount <= 0) return 0;
  return start - deleteCount;
};
