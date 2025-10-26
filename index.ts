import { Balloon, Game, GameSession, loadGame } from "./game";

const wordList: readonly string[] = ["aloud", "bald", "hawk", "south", "faucet", "proud", "claw", "tower", "stalk", "couple", "howl", "false", "dawn", "allow", "drown", "pause", "fault", "cause", "amount", "cloudier", "author", "sprawl", "ounce", "coward"];

// const width = 1024;
// const height = 768;

const balloonWidth = 75;
const balloonHeight = 100;

const tau = Math.PI * 2;

function isClicked(click: { x: number, y: number }, balloon: Balloon) {
  const mX = balloon.x;
  const mY = balloon.y;
  const sigmaX = balloon.width;
  const sigmaY = balloon.height;

  const xDiff = click.x - mX;
  const yDiff = click.y - mY;

  const r = (xDiff * xDiff) / (sigmaX * sigmaX) + (yDiff * yDiff) / (sigmaY * sigmaY);
  console.log("Distance: " + r);
  return r < 1;
}

export async function start() {

  const gameArea = document.getElementById("gameArea") as HTMLCanvasElement | null;
  if (!gameArea) {
    console.error("No 'gameArea' canvas found.  Exiting.");
    return;
  }
  console.log("Loaded canvas");

  const width = window.innerWidth;
  const height = window.innerHeight;

  const game = await loadGame(wordList, {
    balloonCount: 5,
    balloonWidth: balloonWidth,
    balloonHeight: balloonHeight,
    gameWidth: width,
    gameHeight: height
  });
  let gameSession = game.buildGameSession();
  gameSession.init();

  gameArea.addEventListener("click", (event) => {
    if (gameSession.gameOver) {
      gameSession = game.buildGameSession();
      gameSession.init();
      draw(gameArea, gameSession);
      return;
    }

    if (gameSession.displayCorrect) return;

    console.log(`Click {x: ${event.x}, y: ${event.y}}`);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const clicked = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    for (let i = 0; i < gameSession.balloons.length; i++) {
      const balloon = gameSession.balloons[i];
      if (isClicked(clicked, balloon)) {

        console.log(`clicked balloon: ${i}`);
        if (balloon.isMisspelled) {
          gameSession.score++;
        }
        gameSession.setDisplayCorrect();
        setTimeout(() => {
          gameSession.newRound();
          draw(gameArea, gameSession);
        }, 4000);
        break;
      }

    }
    draw(gameArea, gameSession);
  });

  draw(gameArea, gameSession);
  //generateAllMisspelled();
}

// function generateAllMisspelled() {
//   for (let w of wordList) {
//     const m = getAllMisspellings(w);
//     console.log(`${w}: ${m.join(", ")}`);
//   }
// }

function sech(theta: number): number {
  return 1 / Math.cosh(theta);
}

function sechBalloon(xStart: number, yStart: number): Path2D {
  const balloonPath = new Path2D();
  const numberSegments = 25;

  const otherHalf = [];

  for (let i = 0; i < numberSegments + 1; i++) {
    const theta = i * (Math.PI / numberSegments);
    const r = 1 + 0.375*sech(2.75 * theta);

    const heightScale = theta > Math.PI/2 ? 7*balloonHeight/8 : balloonHeight;
    const y = 7*balloonHeight/8 * r * Math.cos(theta);
    const x = balloonWidth * r * Math.sin(theta);
    if (i == 0) {
      balloonPath.moveTo(x + xStart, y + yStart);
    } else {
      balloonPath.lineTo(x + xStart, y + yStart);
      if (i !== numberSegments) {
        otherHalf.push({x: -x + xStart, y: y + yStart});
      }
    }
  }

  for (let next of otherHalf.reverse()) {
    balloonPath.lineTo(next.x, next.y);
  }
  balloonPath.closePath();

  //const otherHalf = new Path2D(balloonPath);
  
  //balloonPath.addPath(balloonPath, new DOMMatrix().flipY());
  // const result = new Path2D();
  // result.addPath(balloonPath, )

  return balloonPath;
}

function parabola(width: number, height: number) {
  const path = new Path2D();

  const numberSegments = 25;
  const xStart = -width;
  const xStep = width / numberSegments;
  const a = (-height) / (xStart * xStart);

  for (let i = 0; i < 2 * numberSegments + 1; i++) {
    const x = xStart + i * xStep;
    const y = a * (x * x) + height;
    if (i === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  }

  return path;
}

function doubleEllipse(width: number, height: number) {
  const path = new Path2D();
  path.ellipse(0, 0, width, height*.8, 0, 0, Math.PI, true);
  path.ellipse(0, 0, width, height*1.15, 0, Math.PI, 0, true);
  return path;
}

function draw(gameArea: HTMLCanvasElement, session: GameSession) {
  const ctx = gameArea?.getContext("2d");
  if (!ctx) {
    console.error("Could not create drawing context");
    return;
  }

  console.log("drawing");
  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, gameArea.width, gameArea.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  for (let balloon of session.balloons) {
    ctx.fillStyle = "red";
    ctx.beginPath();

    // const balloonPath = doubleEllipse(balloonWidth - 0.75, balloonHeight);
    // const p = new Path2D();
    //p.ellipse(balloon.x, balloon.y, balloon.width, 3 * balloon.height / 4, 0, 0.15, Math.PI - .15, true);
    // p.addPath(balloonPath, new DOMMatrix([1, 0, 0, 1, balloon.x, balloon.y]));
    // ctx.fill(p);
    // ctx.stroke(p);

    // ctx.ellipse(balloon.x, balloon.y, balloon.width, balloon.height, 0, 0, tau, true);
    // ctx.fill();
    // ctx.stroke();

    //ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    const sechBalloonPath = sechBalloon(balloon.x, balloon.y);
    ctx.fill(sechBalloonPath);
    ctx.stroke(sechBalloonPath);

    ctx.fillStyle = "black";
    ctx.font = "28px serif";
    if (session.displayCorrect) {
      if (balloon.isMisspelled) {
        ctx.fillText(session.correctWord, balloon.x, balloon.y);
      }
    } else {
      ctx.fillText(balloon.word, balloon.x, balloon.y);
    }
  }

  ctx.beginPath();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Score: ${session.score}`, 5, 7);

  if (session.gameOver) {
    ctx.beginPath();
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = "56px serif";

    ctx.beginPath();
    ctx.fillText("Game Over.\r\nClick anywhere to start again", gameArea.width / 2, gameArea.height / 5);
  }
}
