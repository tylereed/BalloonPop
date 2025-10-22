import { Balloon, Game, GameSession, loadGame } from "./game";

const wordList: readonly string[] = ["aloud", "bald", "hawk", "south", "faucet", "proud", "claw", "tower", "stalk", "couple", "howl", "false", "dawn", "allow", "drown", "pause", "fault", "cause", "amount", "cloudier", "author", "sprawl", "ounce", "coward"];

const width = 1024;
const height = 768;

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

function draw(gameArea: HTMLCanvasElement, session: GameSession) {
  const ctx = gameArea?.getContext("2d");
  if (!ctx) {
    console.error("Could not create drawing context");
    return;
  }

  console.log("drawing");
  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  for (let balloon of session.balloons) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.ellipse(balloon.x, balloon.y, balloon.width, balloon.height, 0, 0, tau);
    ctx.fill();
    ctx.stroke();

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
    ctx.fillText("Game Over.\r\nClick anywhere to start again", width / 2, height / 5);
  }
}
