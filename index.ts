import draw from "./draw";
import { Balloon, loadGame } from "./game";

const wordList: readonly string[] = ["aloud", "bald", "hawk", "south", "faucet", "proud", "claw", "tower", "stalk", "couple", "howl", "false", "dawn", "allow", "drown", "pause", "fault", "cause", "amount", "cloudier", "author", "sprawl", "ounce", "coward"];

const balloonWidth = 100;
const balloonHeight = 125;

function isClicked(click: { x: number, y: number }, balloon: Balloon) {
  const mX = balloon.x;
  // offset the y middle because the balloon shape isn't even across y-axis
  const mY = balloon.y + 10;
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
