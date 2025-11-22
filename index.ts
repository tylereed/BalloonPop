import draw from "./draw";
import { Balloon, Game, GameSession, GameState, loadGame } from "./game";

const wordList: readonly string[] = ["steel", "steal", "aloud", "allowed", "lesson", "lessen", "who's", "whose", "manor", "manner", "pedal", "peddle", "berry", "bury", "hanger", "hangar", "overdo", "overdue", "rain", "reign", "principle", "principal", "stationary", "stationery"];

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
    switch (gameSession.state) {
      case GameState.StartScreen:
        handleStartScreenClick(gameSession);
        break;

      case GameState.Choose:
        handleChooseClick(event, gameSession, gameArea);
        break;

      case GameState.DisplayCorrect:
        return;

      case GameState.GameOver:
        gameSession = handleGameOverClick(game)
        break;
    }

    draw(gameArea, gameSession);
  });

  draw(gameArea, gameSession);
  //generateAllMisspelled();
}

function handleStartScreenClick(gameSession: GameSession) {
  gameSession.start();
}

function handleChooseClick(event: PointerEvent, gameSession: GameSession, gameArea: HTMLCanvasElement) {
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
}

function handleGameOverClick(game: Game) {
  let gameSession = game.buildGameSession();
  gameSession.init();
  gameSession.start();
  return gameSession;
}

// function generateAllMisspelled() {
//   for (let w of wordList) {
//     const m = getAllMisspellings(w);
//     console.log(`${w}: ${m.join(", ")}`);
//   }
// }
