const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let creatureArr = [];
let foodArr = [];
let startCreatureCount = 100;
let startFoodCount = 90;
let animationHandler;
let mouseCoords = [];
let mouseIsDown = false;
class Food {
  constructor(properties) {
    this.properties = properties;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
  }
}
class Creature {
  constructor(properties) {
    this.properties = properties;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.status = "inactive";
  }
  update() {
    if (this.status != "inactive") {
      document.getElementsByClassName(
        "index"
      )[0].innerHTML = `index: ${this.properties.index}`;
      document.getElementsByClassName(
        "pos"
      )[0].innerHTML = `x: ${Math.floor(
        this.x
      )}, y: ${Math.floor(this.y)}`;
      document.getElementsByClassName(
        "health"
      )[0].innerHTML = `hp: ${100}`;
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "darkgreen";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    if (this.status == "preview") ctx.fillStyle = "white";
    if (this.status == "active") ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}

document.onload = init();

function init() {
  for (let i = 0; i < startCreatureCount; ++i) {
    creatureArr.push(
      new Creature({
        index: i,
      })
    );
  }
  Math.distance = function (a, b) {
    return Math.sqrt(
      Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)
    );
  };

  function chooseClosestCreature(status) {
    let min_distance = 1000;
    let index = 0;
    for (let i = 0; i < creatureArr.length; ++i) {
      let distance = Math.distance(mouseCoords, [
        creatureArr[i].x,
        creatureArr[i].y,
      ]);
      creatureArr[i].status = "inactive";
      if (distance < min_distance) {
        min_distance = distance;
        index = i;
      }
    }
    creatureArr[index].status = status;
  }

  canvas.addEventListener("mousedown", (_) => {
    mouseIsDown = true;
    chooseClosestCreature("preview");
  });
  canvas.addEventListener("mouseup", (_) => {
    mouseIsDown = false;
    chooseClosestCreature("active");
  });
  canvas.addEventListener("mousemove", (e) => {
    mouseCoords = [e.clientX, e.clientY];
    if (mouseIsDown) {
      chooseClosestCreature("preview");
    }
  });

  animationHandler = requestAnimationFrame(loop);
  loop();
}

function loop() {
  for (let i = 0; i < creatureArr.length; ++i) {
    creatureArr[i].draw();
  }
  for (let i = 0; i < creatureArr.length; ++i) {
    creatureArr[i].update();
  }
  requestAnimationFrame(loop);
}
