//canvas for plotting amount of creatues over time
const creatureTimeCanvas = document.getElementById(
  "creatureTimeDiagram"
);
creatureTimeCanvas.width = window.innerWidth;
creatureTimeCanvas.height = 500;
const ctctx = creatureTimeCanvas.getContext("2d");

let valueCount = 1e4;
let ctTimeArr = new Uint8Array(valueCount);
let ctCreatureArr = new Float32Array(valueCount);
ctCreatureArr[0] = startCreatureCount;
let ctCounter = 1;
let limits = 30;

function updatePlots() {
  if (ctCounter == valueCount) return;
  ctTimeArr[ctCounter] = ctCounter;
  ctCreatureArr[ctCounter] = creatureArr.length;
  ++ctCounter;
  drawCTPlot();
  if (ctCounter == valueCount) {
    initPlots();
  }
}
function drawCTPlot() {
  {
    //draw line
    let scaleX =
      (creatureTimeCanvas.width - 2 * limits) / valueCount;
    let scaleY =
      (creatureTimeCanvas.height - 2 * limits) /
      startCreatureCount;
    let offsetY = creatureTimeCanvas.height - limits;

    ctctx.beginPath();
    ctctx.moveTo(
      (ctCounter - 1) * scaleX + limits,
      offsetY - ctCreatureArr[ctCounter - 1] * scaleY
    );
    ctctx.lineTo(
      ctCounter * scaleX + limits,
      offsetY - creatureArr.length * scaleY
    );
    ctctx.lineWidth = 3;
    ctctx.stroke();
    ctctx.closePath();

    /*let width = 10;
    ctctx.beginPath();
    ctctx.rect(
      ctCounter * scaleX + limits - width / 2,
      offsetY - creatureArr.length * scaleY,
      width / 2,
      width,
      width
    );
    //ctctx.fillStyle = `hsl(${ctCounter / 5}, 100%, 50%)`;

    ctctx.fillStyle = "black";
    ctctx.fill();
    ctctx.closePath();*/
  }
}

function initPlots() {
  {
    //reset environent variables
    ctCounter = 1;
    ctctx.clearRect(
      0,
      0,
      creatureTimeCanvas.width,
      creatureTimeCanvas.height
    );
    ctTimeArr = new Uint8Array(valueCount);
    ctCreatureArr = new Float32Array(valueCount);
  }
  {
    //draw grid
    {
      //draw axes
      ctctx.beginPath();
      ctctx.moveTo(
        limits,
        creatureTimeCanvas.height - limits
      );
      ctctx.lineTo(limits, limits);
      ctctx.lineWidth = 3;
      ctctx.stroke();
      ctctx.closePath();

      ctctx.beginPath();
      ctctx.moveTo(
        limits,
        creatureTimeCanvas.height - limits
      );
      ctctx.lineTo(
        creatureTimeCanvas.width - limits,
        creatureTimeCanvas.height - limits
      );
      ctctx.stroke();
      ctctx.closePath();
    }
  }
}
