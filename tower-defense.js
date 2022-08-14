const canvas = document.getElementById("play-area");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

/***********************************************************
 *              G L O B A L  V A R I A B L E S
 */

const cellSize = 100;
const cellGap = 3;
const gameGrid = [];

const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
};
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", () => {
  mouse.x = undefined;
  mouse.y = undefined;
});

/***********************************************************
 *              G A M E  B O A R D
 */

const controlsBar = {
  width: canvas.width,
  height: cellSize,
};

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }

  draw() {
    if (mouse.x && mouse.y && isColliding(this, mouse)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

(function createGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize)
    for (let x = 0; x < canvas.width; x += cellSize)
      gameGrid.push(new Cell(x, y));
})();

function handleGameGrid() {
  for (let i = 0; i < gameGrid.length; i++) gameGrid[i].draw();
}

/***********************************************************
 *              P R O J E C T I L E S
 */

/***********************************************************
 *              D E F E N D E R S
 */

/***********************************************************
 *              E N E M I E S
 */

/***********************************************************
 *              R E S O U R C E S
 */

/***********************************************************
 *              U T I L I T I E S
 */

(function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
  handleGameGrid();
  requestAnimationFrame(animate);
})();

function isColliding(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}
