import { Balloon, GameSession } from "./game";

function sech(theta: number): number {
  return 1 / Math.cosh(theta);
}

function sechRadius(theta: number) {
  return 1 + 0.375 * sech(3.5 * theta)
}

function calculateHeight(theta: number, radius: number, height: number) {
  // Take 7/8 of height to more closely match correct height (since the formula isn't exactly bound to size)
  return 7 * height / 8 * radius * Math.cos(theta);
}

function sechBalloon(balloon: Balloon): Path2D {
  const balloonPath = new Path2D();
  const numberSegments = 50;

  // The formula draws the 2nd half incorrectly, so store the values previously calculated to draw correctly
  const otherHalf = [];

  for (let i = 0; i < numberSegments + 1; i++) {
    const theta = i * (Math.PI / numberSegments);
    const r = sechRadius(theta);

    // The output of the formula draws the balloon along the x-axis, so swap the x and y positions to rotate
    const y = calculateHeight(theta, r, balloon.height);
    const x = balloon.width * r * Math.sin(theta);
    if (i == 0) {
      balloonPath.moveTo(x + balloon.x, y + balloon.y);
    } else {
      balloonPath.lineTo(x + balloon.x, y + balloon.y);
      if (i !== numberSegments) {
        otherHalf.push({ x: -x + balloon.x, y: y + balloon.y });
      }
    }
  }

  for (let next of otherHalf.reverse()) {
    balloonPath.lineTo(next.x, next.y);
  }
  balloonPath.closePath();

  return balloonPath;
}

function balloonString(balloon: Balloon) {
  const r = sechRadius(0);
  const y = calculateHeight(0, r, balloon.height);
  const x = balloon.width * r * Math.sin(0);
  //balloonPath.lineTo(balloon.x + x, y + balloon.y + 250);
  const stringPath = new Path2D();
  stringPath.moveTo(x + balloon.x, y + balloon.y);
  stringPath.bezierCurveTo(x + balloon.x - 30, y + balloon.y + 50, x + balloon.x + 50, y + balloon.y + 250 - 50, x + balloon.x, y + balloon.y + 250);
  return stringPath;
}

export default function draw(gameArea: HTMLCanvasElement, session: GameSession) {
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

    const sechBalloonPath = sechBalloon(balloon);
    ctx.fill(sechBalloonPath);
    ctx.stroke(sechBalloonPath);

    ctx.beginPath();
    const balloonStringPath = balloonString(balloon);
    ctx.stroke(balloonStringPath);

    // Draw the clickable region
    // ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    // ctx.ellipse(balloon.x, balloon.y+10, balloon.width, balloon.height, 0, 0, Math.PI*2, true);
    // ctx.fill();

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
