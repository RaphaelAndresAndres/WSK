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
let foodLifespan = 1000;
let foodHp = 100;
let simulationIsRunning = false;
let foodSpawnPercentage = 0.05;
let speedMultiplier = 0.1;
let frameCounter = 0;

let gameRules = {
  creatureSpawnsFoodOnDeath: false,
};
let evolutionParameters = {
  survivorCount: parseInt(
    document.getElementById("nsurvivors").value
  ),
  mutationRate: parseFloat(
    document.getElementById("mutationrate").value
  ),
  generationCount: parseInt(
    document.getElementById("ngenerations").value
  ),
};
class Food {
  constructor(properties) {
    this.properties = properties;
    this.x = properties.x ?? Math.random() * canvas.width;
    this.y = properties.y ?? Math.random() * canvas.height;
    this.size = 15;
    this.hp = foodHp;
    this.initTime = properties.initTime ?? new Date() - 0;
    this.index = properties.index;
  }
  update() {
    if (this.hp <= 0) {
      this.remove();
    }
    if (new Date() - this.initTime > foodLifespan)
      this.remove();
  }
  draw() {
    if (this.hp > 0) {
      ctx.beginPath();
      ctx.fillStyle = "purple";
      ctx.rect(
        this.x - this.size / 2,
        this.y - this.size / 2,
        this.size,
        this.size
      );
      ctx.fill();
      ctx.closePath();
    }
  }
  remove() {
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
class Creature {
  constructor(properties) {
    this.properties = properties;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = 0;
    this.vy = 0;
    this.index = properties.index;
    this.maxHealth = properties.health;
    this.health = this.maxHealth;
    this.speed = properties.speed * speedMultiplier;
    this.eatSpeed = properties.eatspeed;
    this.maxHunger = properties.hunger;
    this.hunger = this.maxHunger;
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
    {
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
        )[0].innerHTML = `hp: ${
          Math.round(this.health * 100) / 100
        }`;
        document.getElementsByClassName(
          "hunger"
        )[0].innerHTML = `hunger: ${
          Math.round(this.hunger * 100) / 100
        }`;
      }
    }
    this.hunger -= this.speed / 100;
    this.hunger = (this.hunger >= 0) * this.hunger;
    this.health -= (this.hunger == 0) * 0.05;
    if (this.health <= 0) {
      this.isAlive = false;
      this.health = 0;
      for (let i = 0; i < creatureArr.length; ++i) {
        creatureArr[i].index = i;
      }
      creatureArr.splice(this.index, 1);
      if (gameRules.creatureSpawnsFoodOnDeath) {
        foodArr.push(
          new Food({
            index: foodArr.length,
            x: this.x,
            y: this.y,
          })
        );
        updateClosestFood();
      }
    }
    if (this.goalFoodIndex == -1) return;
    if (this.isAlive) {
      this.x += this.vx * this.speed;
      this.y += this.vy * this.speed;
      if (
        Math.pow(
          this.x - foodArr[this.goalFoodIndex].x,
          2
        ) +
          Math.pow(
            this.y - foodArr[this.goalFoodIndex].y,
            2
          ) <
          100 &&
        !this.isAtFood
      ) {
        this.vx = 0;
        this.vy = 0;
        this.isAtFood = true;
      } else if (this.isAtFood) {
        foodArr[this.goalFoodIndex].hp -=
          this.eatSpeed / 100;
        this.hunger += this.eatSpeed / 100;
      }
    }
  }
  draw() {
    if (!this.isAlive) return;
    ctx.beginPath();
    ctx.rect(this.x - 5, this.y - 5, 10, 10);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "black";
    if (this.status == "preview") ctx.fillStyle = "white";
    if (this.status == "active") ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}
class Notification {
  constructor(message, type) {
    this.message = message;
    this.type = type;
    this.startTime;
    this.elem;
    this.parentElem =
      document.getElementsByClassName("notifications")[0];
    this.init();
  }
  init() {
    this.startTime = new Date() - 0;
    this.elem = document.createElement("div");
    this.elem.classList.add("notification", this.type);
    this.elem.innerHTML = `${this.message}`;
    this.parentElem.append(this.elem);
    setTimeout(() => {
      this.parentElem.removeChild(this.elem);
    }, 5000);
  }
}
function createNewGeneration() {}

document.onload = init();
function resetSim() {
  new Notification("Resetting simulation...", "log");
  cancelAnimationFrame(animationHandler);
  simulationIsRunning = false;
  initPlots();
  foodArr = [];
  creatureArr = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function startSim() {
  {
    if (simulationIsRunning) {
      new Notification(
        "Simulation is already running. ",
        "warning"
      );
      return;
    }
    startCreatureCount = parseInt(
      document.getElementById("startCreatureCount").value
    );
    foodSpawnPercentage = parseFloat(
      document.getElementById("foodSpawnPercentage").value
    );
    foodLifespan =
      1000 *
      parseFloat(
        document.getElementById("foodLifespan").value
      );
    foodHp = parseFloat(
      document.getElementById("foodHp").value
    );
    gameRules.creatureSpawnsFoodOnDeath =
      document.getElementById("spawnFoodOnDeath").checked;
  }
  if (
    startCreatureCount <= evolutionParameters.survivorCount
  ) {
    new Notification(
      "Your starting creature count cannot be equal or less than the survivor count!",
      "error"
    );
    return;
  }
  new Notification("Started simulation...", "log");
  initPlots();

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

  animationHandler = requestAnimationFrame(loop);
  simulationIsRunning = true;
}
function init() {
  Math.distance = function (a, b) {
    return Math.sqrt(
      Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)
    );
  };
  {
  }
  Math.clamp = function (x, min, max) {
    return Math.min(Math.max(x, min), max);
  };
  function chooseClosestCreature(status) {
    if (creatureArr.length == 0) return;
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
    mouseCoords = [
      e.clientX,
      e.clientY + document.scrollingElement.scrollTop,
    ];
    if (mouseIsDown) {
      chooseClosestCreature("preview");
    }
  });
}

function toggleSimulation() {
  if (simulationIsRunning) {
    cancelAnimationFrame(animationHandler);
    new Notification("Paused simulation", "log");
  } else {
    animationHandler = requestAnimationFrame(loop);
    new Notification("Resumed simulation", "log");
  }
  simulationIsRunning = !simulationIsRunning;
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
  for (let i = 0; i < creatureArr.length; ++i) {
    creatureArr[i].update();
  }
  for (let i = 0; i < foodArr.length; ++i) {
    foodArr[i].update();
  }
  if (
    frameCounter %
      parseInt(document.getElementById("nthframe").value) ==
    0
  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < creatureArr.length; ++i) {
      creatureArr[i].draw();
    }
    for (let i = 0; i < foodArr.length; ++i) {
      foodArr[i].draw();
    }
  }

  if (
    Math.random() <
    (foodSpawnPercentage * creatureArr.length) /
      startCreatureCount
  ) {
    foodArr.push(
      new Food({
        index: foodArr.length,
        initTime: new Date() - 0,
      })
    );
    updateClosestFood();
  }
  document.getElementsByClassName(
    "creatureCount"
  )[0].innerHTML =
    "Creatures alive:  " + creatureArr.length;
  updatePlots();
  animationHandler = requestAnimationFrame(loop);
  frameCounter++;
  if (
    creatureArr.length <= evolutionParameters.survivorCount
  ) {
    new Notification(
      "Your simulation has stopped. Starting new generation...",
      "log"
    );
    resetSim();
    createNewGeneration();
  }
}
