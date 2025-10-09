const wordList = ["rolled", "finger", "except", "speed", "couldn’t", "eleven", "catch", "itself", "stolen", "button", "bargain", "certain", "orphan", "opinion", "oxen", "latitude", "longitude", "compass", "absolute", "equator"];

const width = 1024;
const height = 768;

const balloonWidth = 50;
const balloonHeight = 75;

const tau = Math.PI * 2;

function getMisspelled(word: string): string {
  return "farts";
}

function start() {
  const gameArea = document.getElementById("gameArea") as HTMLCanvasElement | null;
  if (!gameArea) {
    console.error("No 'gameArea' canvas found.  Exiting.");
    return;
  }

  console.log("Loaded canvas");

  const ctx = gameArea?.getContext("2d");
  if (!ctx) {
    console.error("Could not create drawing context");
    return;
  }

  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, width, height);

  const balloonXOffset = width / 6;
  const balloonY = height / 2;

  ctx.fillStyle = "red";
  //ctx.beginPath();
  //ctx.ellipse(50, 50, 25, 25, 0, 0, tau);
  //ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const x = (i + 1) * balloonXOffset;

    //ctx.moveTo(x, balloonY);
    ctx.beginPath();
    ctx.ellipse(x, balloonY, balloonWidth, balloonHeight, 0, 0, tau);
    ctx.fill();
    ctx.stroke();

    ctx.strokeText(wordList[i], x, balloony);
  }
}

start();
