const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let creatureArr = [];
let foodArr = [];
let startCreatureCount = 30;
let startFoodCount = 90;
let animationHandler;
let mouseCoords = [];
let mouseIsDown = false;

class Food {
  constructor(properties) {
    this.properties = properties;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 15;
    this.hp = 100;
    this.index = properties.index;
  }
  update() {
    if (this.hp < 0) {
      foodArr.splice(this.index, 1);

      for (let i = 0; i < foodArr.length; i++) {
        foodArr[i].index = i;
      }
      for (let i = 0; i < creatureArr.length; ++i) {
        if (creatureArr[i].goalFoodIndex == this.index) {
          creatureArr[i].goalFoodIndex = -1;
          creatureArr[i].isAtFood = false;
        }
        if (creatureArr[i].goalFoodIndex > this.index) {
          creatureArr[i].goalFoodIndex--;
        }
      }
      updateClosestFood();
    }
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = "purple";
    ctx.rect(
      this.x - this.size / 2,
      this.y - this.size,
      this.size,
      this.size
    );
    ctx.fill();
    ctx.closePath();
  }
}
class Creature {
  constructor(properties) {
    this.properties = properties;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = 0;
    this.vy = 0;
    this.maxHealth = properties.health;
    this.health = this.maxHealth;
    this.speed = properties.speed;
    this.eatSpeed = properties.eatspeed;
    this.maxHunger = properties.hunger;
    this.goalFoodIndex = -1;
    this.status = "inactive";
    this.color = `rgb(${Math.random() * 255},${
      Math.random() * 255
    },${Math.random() * 255})`;
    ctx.lineWidth = 1;
    this.color = "darkgreen";
    this.isAlive = true;
    this.isAtFood = false;
  }
  update() {
    if (this.goalFoodIndex == -1) return;
    if (this.isAlive) {
      this.health -= this.speed / 1000;
      this.x += (this.vx * this.speed) / 10;
      this.y += (this.vy * this.speed) / 10;
      if (
        Math.pow(
          this.x - foodArr[this.goalFoodIndex].x,
          2
        ) +
          Math.pow(
            this.y - foodArr[this.goalFoodIndex].y,
            2
          ) <
          50 &&
        !this.isAtFood
      ) {
        this.vx = 0;
        this.vy = 0;
        this.isAtFood = true;
      } else if (this.isAtFood) {
        foodArr[this.goalFoodIndex].hp -=
          this.eatSpeed / 100;
        this.health += this.eatSpeed / 200;
      }
      if (this.health < 0) {
        this.isAlive = false;
        this.health = 0;
      }
    }

    if (this.status != "inactive" && this.isAlive) {
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
      )[0].innerHTML = `hp: ${
        Math.round(this.health * 100) / 100
      }`;
    }
  }
  draw() {
    if (!this.isAlive) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
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
    let hpRandom = Math.ceil(Math.random() * 100);
    let foodRandom = Math.ceil(Math.random() * 100);
    creatureArr.push(
      new Creature({
        index: i,
        health: hpRandom,
        speed: 101 - hpRandom,
        hunger: foodRandom,
        eatspeed: 101 - foodRandom,
      })
    );
  }
  Math.distance = function (a, b) {
    return Math.sqrt(
      Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)
    );
  };
  Math.clamp = function (x, min, max) {
    return Math.min(Math.max(x, min), max);
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
  canvas.addEventListener("click", (_) => {
    foodArr.push(
      new Food({
        index: foodArr.length,
      })
    );
    updateClosestFood();
  });

  animationHandler = requestAnimationFrame(loop);
  loop();
}

function updateClosestFood() {
  for (let i = 0; i < creatureArr.length; ++i) {
    if (creatureArr[i].isAtFood || foodArr.length == 0)
      continue;
    let index = 0;
    let closestDistance = Infinity;
    for (let j = 0; j < foodArr.length; ++j) {
      const length =
        Math.pow(creatureArr[i].x - foodArr[j].x, 2) +
        Math.pow(creatureArr[i].y - foodArr[j].y, 2);
      if (length < closestDistance) {
        index = j;
        closestDistance = length;
      }
    }
    creatureArr[i].goalFoodIndex = index;
    let length = Math.sqrt(closestDistance) + 0.01;
    creatureArr[i].vx =
      (foodArr[index].x - creatureArr[i].x) / length;
    creatureArr[i].vy =
      (foodArr[index].y - creatureArr[i].y) / length;
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < creatureArr.length; ++i) {
    creatureArr[i].draw();
  }
  for (let i = 0; i < creatureArr.length; ++i) {
    creatureArr[i].update();
  }
  for (let i = 0; i < foodArr.length; ++i) {
    foodArr[i].draw();
    foodArr[i].update();
  }
  if (Math.random() < 0.05) {
    foodArr.push(
      new Food({
        index: foodArr.length,
      })
    );
    updateClosestFood();
  }
  requestAnimationFrame(loop);
}
