const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let creatureArr = [];
let foodArr = [];
let startCreatureCount;
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
let currentGeneration = 1;
let generationCountDifference;
let survivorData = [];
let gameRules = {
  creatureSpawnsFoodOnDeath: false,
};
let evolutionParameters = {
  survivorCount: parseInt(
    document.getElementById("startCreatureCount").value
  ),
  mutationRate: parseFloat(
    document.getElementById("mutationrate").value
  ),
  generationCount: parseInt(
    document.getElementById("ngenerations").value
  ),
  generationCountPercentage: parseFloat(
    document.getElementById("generationSizePercentage")
      .value
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
class ScreenNotification {
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

function updateGlobalVariables() {
  evolutionParameters.mutationRate = parseFloat(
    document.getElementById("mutationrate").value
  );
  evolutionParameters.generationCount = parseInt(
    document.getElementById("ngenerations").value
  );
  evolutionParameters.generationCountPercentage =
    parseFloat(
      document.getElementById("generationSizePercentage")
        .value
    );
  evolutionParameters.survivorCount = parseInt(
    document.getElementById("startCreatureCount").value
  );
}

function createNewGeneration() {
  currentGeneration++;

  for (let i = 0; i < creatureArr.length; ++i) {
    healthArr[i] = creatureArr[i].properties.health;
    speedArr[i] = creatureArr[i].properties.speed;
    hungerArr[i] = creatureArr[i].properties.hunger;
    eatSpeedArr[i] = creatureArr[i].properties.eatspeed;
    survivorData[currentGeneration - 2][i] = {};
    survivorData[currentGeneration - 2][i] = {
      health: healthArr[i],
      speed: speedArr[i],
      hunger: hungerArr[i],
      eatSpeed: eatSpeedArr[i],
    };
  }
  if (
    currentGeneration - 1 ==
    evolutionParameters.generationCount
  ) {
    new ScreenNotification(
      "Finished all generations.",
      "warn"
    );
    return;
  }
  let healthArr = new Float32Array(
    evolutionParameters.survivorCount
  );
  let speedArr = new Float32Array(
    evolutionParameters.survivorCount
  );
  let hungerArr = new Float32Array(
    evolutionParameters.survivorCount
  );
  let eatSpeedArr = new Float32Array(
    evolutionParameters.survivorCount
  );

  let healthMean = Math.mean(healthArr);
  let speedMean = Math.mean(speedArr);
  let hungerMean = Math.mean(hungerArr);
  let eatSpeedMean = Math.mean(eatSpeedArr);

  let healthStd = Math.std(healthArr);
  let speedStd = Math.std(speedArr);
  let hungerStd = Math.std(hungerArr);
  let eatSpeedStd = Math.std(eatSpeedArr);

  initPlots();
  foodArr = [];
  creatureArr = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  new ScreenNotification(
    "Creating new generation...",
    "log"
  );
  let index = 0;
  while (
    creatureArr.length < evolutionParameters.survivorCount
  ) {
    let health =
      healthMean +
      Math.gaussianRandom(
        0,
        evolutionParameters.mutationRate * healthStd
      );
    if (health <= 0) continue;
    let speed =
      speedMean +
      Math.gaussianRandom(
        0,
        evolutionParameters.mutationRate * speedStd
      );
    let hunger =
      hungerMean +
      Math.gaussianRandom(
        0,
        evolutionParameters.mutationRate * hungerStd
      );
    let eatspeed =
      eatSpeedMean +
      Math.gaussianRandom(
        0,
        evolutionParameters.mutationRate * eatSpeedStd
      );
    creatureArr.push(
      new Creature({
        index: index,
        health: health,
        speed: speed,
        hunger: hunger,
        eatspeed,
      })
    );
  }
  new ScreenNotification(
    "Finished generating new generation.",
    "error"
  );
  new ScreenNotification("Started simulation...", "log");
  initPlots();
  animationHandler = requestAnimationFrame(loop);
  simulationIsRunning = true;
}

document.onload = init();
function resetSim() {
  new ScreenNotification("Resetting simulation...", "log");
  cancelAnimationFrame(animationHandler);
  evolutionParameters.survivorCount = startCreatureCount;
  simulationIsRunning = false;
  initPlots();
  foodArr = [];
  creatureArr = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function startSim() {
  {
    if (simulationIsRunning) {
      new ScreenNotification(
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
    evolutionParameters.generationCountPercentage >= 1 ||
    evolutionParameters.generationCountPercentage <= 0
  ) {
    new ScreenNotification(
      "The relative generation size percentage must be in the interval (0,1).",
      "error"
    );
    return;
  }
  updateGlobalVariables();
  new ScreenNotification("Started simulation...", "log");
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
  updateGlobalVariables();

  Math.distance = function (a, b) {
    return Math.sqrt(
      Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)
    );
  };

  Math.mean = function (arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; ++i) {
      sum += arr[i];
    }
    return sum / arr.length;
  };

  Math.std = function (arr) {
    let sum = 0;
    const mean = Math.mean(arr);
    for (let i = 0; i < arr.length; ++i) {
      sum += Math.pow(arr[i] - mean, 2);
    }
    return Math.sqrt(sum / arr.length);
  };

  Math.clamp = function (x, min, max) {
    return Math.min(Math.max(x, min), max);
  };

  Math.gaussianRandom = function (mean = 0, stdev = 1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z =
      Math.sqrt(-2.0 * Math.log(u)) *
      Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
  };

  generationCountDifference = Math.round(
    (1 - evolutionParameters.generationCountPercentage) *
      startCreatureCount
  );

  document.getElementById("textExport").value = "";

  for (
    let i = 0;
    i < evolutionParameters.generationCount;
    ++i
  ) {
    survivorData[i] = [];
  }
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
    new ScreenNotification("Paused simulation", "log");
  } else {
    animationHandler = requestAnimationFrame(loop);
    new ScreenNotification("Resumed simulation", "log");
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
      evolutionParameters.survivorCount
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
  document.getElementsByClassName(
    "generationCount"
  )[0].innerHTML = `Generation ${currentGeneration} / ${evolutionParameters.generationCount}`;
  updatePlots();
  animationHandler = requestAnimationFrame(loop);
  frameCounter++;
  if (
    creatureArr.length <=
    Math.floor(
      startCreatureCount *
        evolutionParameters.generationCountPercentage
    )
  ) {
    cancelAnimationFrame(animationHandler);
    createNewGeneration();
  }
}
