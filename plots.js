//canvas for plotting amount of creatues over time
const creatureTimeCanvas = document.getElementById(
  "creatureTimeDiagram"
);
creatureTimeCanvas.width = window.innerWidth;
creatureTimeCanvas.height = 500;
const ctctx = creatureTimeCanvas.getContext("2d");

let valueCount = 1e4;
let ctCounter = 0;
let limits = 30;
let plotStepSize = 100;
let plotData = [];
for (
  let i = 0;
  i < evolutionParameters.generationCount;
  ++i
) {
  plotData[i] = [new Int16Array(1e5), new Int16Array(1e5)];
}
let fillCounter = 0;
function updatePlots() {
  if (ctCounter == valueCount) return;
  ++ctCounter;
  drawCTPlot();
  if (ctCounter == valueCount) {
    initPlots();
  }
}
function drawCTPlot() {
  {
    function transformCoords(x, y) {
      let scaleX =
        (creatureTimeCanvas.width - 2 * limits) /
        valueCount;
      let scaleY =
        (creatureTimeCanvas.height - 2 * limits) /
        startCreatureCount;
      let offsetY = creatureTimeCanvas.height - limits;
      return [x * scaleX + limits, offsetY - y * scaleY];
    }
    let [x, y] = transformCoords(
      ctCounter,
      creatureArr.length
    );
    plotData[currentGeneration - 1][0][ctCounter] =
      ctCounter;
    plotData[currentGeneration - 1][1][ctCounter] =
      creatureArr.length;
    if (fillCounter % plotStepSize == 0) {
      ctctx.beginPath();
      ctctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctctx.strokeStyle = `hsl(${
        ((currentGeneration - 1) /
          evolutionParameters.generationCount) *
        360
      },80%, 50%)`;
      ctctx.lineWidth = 2;
      ctctx.stroke();
      ctctx.closePath();

      if (ctCounter != 0) {
        ctctx.beginPath();
        let [x1, y1] = [
          plotData[currentGeneration - 1][0][
            ctCounter - plotStepSize
          ],
          plotData[currentGeneration - 1][1][
            ctCounter - plotStepSize
          ],
        ];
        let [x2, y2] = [
          plotData[currentGeneration - 1][0][ctCounter],
          plotData[currentGeneration - 1][1][ctCounter],
        ];
        [x1, y1] = transformCoords(x1, y1);
        [x2, y2] = transformCoords(x2, y2);
        ctctx.moveTo(x1, y1);
        ctctx.lineTo(x2, y2);
        ctctx.strokeStyle = "black";
        ctctx.stroke();
        ctctx.closePath();
      }
    }
    ++fillCounter;
  }
}

function initPlots() {
  ctCounter = -1;
  {
    //draw helper lines
    {
      //draw axes
      ctctx.beginPath();
      ctctx.moveTo(
        limits,
        creatureTimeCanvas.height - limits
      );
      ctctx.strokeStyle = "black";
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
        //x axis ticks
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
        72;
        ctctx.beginPath();
        ctctx.moveTo(limits, y);
        ctctx.lineTo(creatureTimeCanvas.width - limits, y);
        ctctx.strokeStyle = "grey";
        ctctx.lineWidth = 1;
        ctctx.stroke();
        ctctx.closePath();
        ctctx.font = "20px Arial";
        //y axis ticks
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
      //title
      ctctx.fillText(
        "Alive creatures dependent on time",
        creatureTimeCanvas.width / 2 - 180,
        limits - 5
      );
      //axis labels
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

function exportPlotData(type) {
  if (type == "csv") {
    new Notification(
      "Exporting plot data as .csv...",
      "log"
    );
    let newPlotData = "";
    for (let i = 0; i < plotData[0][0].length; ++i) {
      let check = 0;
      let tempStr = "";
      for (
        let j = 0;
        j < evolutionParameters.generationCount;
        ++j
      ) {
        tempStr +=
          plotData[j][1][i] != 0
            ? plotData[j][1][i]
            : "nan";
        tempStr +=
          j != evolutionParameters.generationCount - 1
            ? ";"
            : "";
        check += plotData[j][1][i];
      }
      if (!check) break;
      newPlotData += tempStr;
      newPlotData += "\n";
    }
    console.log(newPlotData);
    return newPlotData;
  }
  if (type == "JSON") {
    new Notification(
      "Exporting plot data as JSON...",
      "log"
    );
    let newPlotData = [];
    for (
      let i = 0;
      i < evolutionParameters.generationCount;
      ++i
    ) {
      newPlotData[i] = [];
      for (
        let j = 0;
        j < plotData[i][0].length && plotData[i][1][j] != 0;
        ++j
      ) {
        newPlotData[i][j] = {
          time: j,
          creaturesAlive: plotData[i][1][j],
        };
      }
    }
    let newPlotDataString = JSON.stringify(newPlotData);
    console.log(newPlotDataString);
    return newPlotDataString;
  }
}

function exportSurvivorData(type) {
  if (type == "csv") {
    new Notification(
      "Exporting survivor data as .csv...",
      "log"
    );
    let newSurvivorData = "";
    console.log(newSurvivorData);
    return newSurvivorData;
  }
  if (type == "JSON") {
    new Notification(
      "Exporting survivor data as JSON...",
      "log"
    );
    console.log(JSON.stringify(survivorData));
    return survivorData;
  }
}
