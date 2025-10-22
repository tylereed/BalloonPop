import { loadDictionary } from "./misspellings";
import { randomEntry } from "./utils";

let getAllMisspellings: (baseWord: string) => string[];

export interface Balloon {
  x: number;
  y: number;
  width: number;
  height: number;
  word: string;
  isMisspelled: boolean;
  draw: boolean;
}

export interface GameProps {
  readonly balloonCount: number;
  readonly balloonWidth: number;
  readonly balloonHeight: number;
  readonly gameWidth: number;
  readonly gameHeight: number;
}

function* chunk<T>(items: readonly T[], chunkSize: number) {
  const _items = [...items];
  while (_items.length) {
    yield _items.splice(0, chunkSize);
  }
}

function shuffle(words: readonly string[]): string[] {
  const result = [...words];
  let i = result.length;
  while (0 !== i) {
    let j = Math.floor(Math.random() * i);
    i--;
    let temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export class Game {
  #wordList: readonly string[];
  #gameProps: GameProps;
  constructor(wordList: readonly string[], props: GameProps) {
    this.#wordList = [...wordList];
    this.#gameProps = props;
  }

  public buildGameSession(): GameSession {
    const allWords = shuffle(this.#wordList);
    const wordLists = [...chunk(allWords, this.#gameProps.balloonCount)];
    return new GameSession(wordLists, this.#gameProps);
  }
}

function initBalloons(props: GameProps) {
  const { balloonCount, gameWidth, gameHeight, balloonWidth, balloonHeight } = { ...props };

  const balloonXOffset = gameWidth / 5;
  const balloonY = gameHeight / 2;
  const balloons: Balloon[] = [];

  for (let i = 0; i < balloonCount; i++) {
    const x = (i + 0.5) * balloonXOffset;

    balloons.push({
      x: x,
      y: balloonY,
      width: balloonWidth,
      height: balloonHeight,
      word: "",
      isMisspelled: false,
      draw: false
    });
  }

  return balloons;
}

function getMisspelled(word: string): string {
  const misspelled = getAllMisspellings(word);
  return randomEntry(misspelled);
}

function setWords(balloons: readonly Balloon[], words: string[]): void {
  const w = words.splice(0, balloons.length);
  for (let i = 0; i < w.length; i++) {
    balloons[i].word = w[i];
    balloons[i].isMisspelled = false;
    balloons[i].draw = true;
  }
  for (let i = w.length; i < balloons.length; i++) {
    balloons[i].draw = false;
  }
}

function misspellWord(balloons: readonly Balloon[]) {
  const i = Math.floor(Math.random() * balloons.length);
  const correct = balloons[i].word;
  balloons[i].word = getMisspelled(correct);
  balloons[i].isMisspelled = true;
  return correct;
}

export async function loadGame(wordList: readonly string[], props: GameProps) {
  getAllMisspellings = await loadDictionary();
  return new Game(wordList, props);
}

export class GameSession {
  #words: string[][];
  #round: number;
  #balloons: readonly Balloon[];
  #displayCorrect: boolean;
  #correctWord: string;
  #gameOver: boolean;
  #score: number;

  constructor(words: string[][], props: GameProps) {
    this.#words = words.map(x => [...x]);
    this.#round = 0;
    this.#balloons = initBalloons(props);
    this.#displayCorrect = false;
    this.#correctWord = "";
    this.#gameOver = false;
    this.#score = 0;
  }

  get balloons() { return this.#balloons.filter(b => b.draw) };
  get displayCorrect() { return this.#displayCorrect };
  get correctWord() { return this.#correctWord };
  get gameOver() { return this.#gameOver };
  get score() { return this.#score };
  set score(value: number) { this.#score = value };

  #resetBalloons() {
    setWords(this.#balloons, this.#words[this.#round]);
    this.#correctWord = misspellWord(this.#balloons);
    this.#displayCorrect = false;
  }

  init() {
    this.#score = 0;
    this.#resetBalloons();
  }

  setDisplayCorrect() {
    this.#displayCorrect = true;
  }

  newRound() {
    this.#round++;
    if (this.#round < this.#words.length) {
      this.#resetBalloons();
    } else {
      this.#gameOver = true;
    }
  }
}
