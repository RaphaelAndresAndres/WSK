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
let plotStepSize = 100;
let plotData = [];
plotData[0] = new Float32Array(1e4 / plotStepSize);
plotData[1] = new Float32Array(1e4 / plotStepSize);
let fillCounter = 0;
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
    let [x, y] = [
      ctCounter * scaleX + limits,
      offsetY - creatureArr.length * scaleY,
    ];
    if (fillCounter % plotStepSize == 0) {
      ctctx.beginPath();
      ctctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctctx.strokeStyle = "red";
      ctctx.stroke();
      ctctx.closePath();
      if (fillCounter / plotStepSize < 1e4) {
        plotData[0][fillCounter / plotStepSize] = x;
        plotData[1][fillCounter / plotStepSize] = y;
      }
      ctctx.beginPath();
      ctctx.moveTo(
        plotData[0][fillCounter / plotStepSize - 1],
        plotData[1][fillCounter / plotStepSize - 1]
      );
      ctctx.lineTo(
        plotData[0][fillCounter / plotStepSize],
        plotData[1][fillCounter / plotStepSize]
      );
      ctctx.strokeStyle = "black";
      ctctx.stroke();
      ctctx.closePath();
    }
    ++fillCounter;
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
    //draw helper lines
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
    {
      //draw grid
      const gridSize = 50;
      for (
        let x = limits;
        x < creatureTimeCanvas.width - limits;
        x += gridSize
      ) {
        ctctx.beginPath();
        ctctx.moveTo(x, limits);
        ctctx.lineTo(x, creatureTimeCanvas.height - limits);
        ctctx.strokeStyle = "grey";
        ctctx.lineWidth = 1;
        ctctx.stroke();
        ctctx.closePath();
        ctctx.font = "20px Arial";
        ctctx.fillText(
          x - limits,
          x,
          creatureTimeCanvas.height - limits
        );
      }
      for (
        let y = limits;
        y < creatureTimeCanvas.height - limits;
        y += gridSize
      ) {
        ctctx.beginPath();
        ctctx.moveTo(limits, y);
        ctctx.lineTo(creatureTimeCanvas.width - limits, y);
        ctctx.strokeStyle = "grey";
        ctctx.lineWidth = 1;
        ctctx.stroke();
        ctctx.closePath();
        ctctx.font = "20px Arial";
        ctctx.fillText(
          Math.round(
            startCreatureCount -
              (startCreatureCount /
                Math.ceil(
                  (creatureTimeCanvas.height - 2 * limits) /
                    gridSize
                )) *
                ((y - limits) / gridSize)
          ),
          limits,
          y
        );
      }
    }
    {
      //draw axis descriptions
      //draw the legend box

      ctctx.beginPath();
      ctctx.clearRect(
        creatureTimeCanvas.width - limits - 200,
        limits,
        200,
        50
      );
      ctctx.rect(
        creatureTimeCanvas.width - limits - 200,
        limits,
        200,
        50
      );
      ctctx.strokeStyle = "black";
      ctctx.lineWidth = 2;
      ctctx.stroke();
      ctctx.closePath();
      ctctx.font = "30px Arial";
      ctctx.fillText(
        "Data points",
        creatureTimeCanvas.width - limits - 160,
        limits + 35
      );

      ctctx.beginPath();
      ctctx.arc(
        creatureTimeCanvas.width - limits - 180,
        limits + 25,
        8,
        0,
        Math.PI * 2
      );
      ctctx.strokeStyle = "red";
      ctctx.stroke();
      ctctx.closePath();

      ctctx.fillText(
        "Alive creatures dependent on time",
        creatureTimeCanvas.width / 2 - 180,
        limits - 5
      );

      ctctx.save();
      ctctx.beginPath();
      ctctx.translate(
        limits,
        creatureTimeCanvas.height / 2
      );
      ctctx.rotate((3 * Math.PI) / 2);
      ctctx.font = "25px Arial";
      ctctx.fillText("creatures", -80, -10);
      ctctx.fill();
      ctctx.closePath();
      ctctx.restore();

      ctctx.fillText(
        "time step",
        creatureTimeCanvas.width / 2 - 70,
        creatureTimeCanvas.height - 5
      );
    }
  }
}
