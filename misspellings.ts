import Typo from "typo-js";
import { randomEntry, randomInterval } from "./utils";

//@ts-ignore parcel resolves correctly
import enUSDic from "url:./dictionaries/en_US/en_US.dic";
//@ts-ignore parcel resolves correctly
import enUSAff from "url:./dictionaries/en_US/en_US.aff";

type ReadOnlyArrayOfArrays<T> = readonly (readonly T[])[];

const substitutions: ReadOnlyArrayOfArrays<string> = [
  ["sh", "ch"],
  ["oi", "oy"],
  ["oy", "oi"],
  ["ee", "ea"],
  ["ea", "ee"],
  ["ey", "ay"],
  ["ay", "ey"],
  ["ai", "ay"],
  ["ir", "ur"],
  ["ur", "ir"],
  ["au", "aw"],
  ["ph", "f"],
  ["ck", "k"],
  ["ght", "te"],
  ["gh", "g"],
  ["ance", "ence"],
  ["ence", "ance"],
  ["ible", "able"],
  ["able", "ible"]
];

const vowels = ["a", "e", "i", "o", "u"];

let dictionary: Typo; // = new Typo("en_US", null, null, { dictionaryPath: "dictionaries", asyncLoad: true }); //enUSDic, enUSAff); //, { dictionaryPath: "dictionaries", asyncLoad: true });

export async function loadDictionary() {
  const dic = await (await fetch(enUSDic)).text();
  const aff = await (await fetch(enUSAff)).text();
  dictionary = new Typo("en_US", aff, dic);
  // while (!dictionary.loaded) {
  //   await new Promise(resolve => setTimeout(resolve, 100));
  // }
  return getAllMisspellings;
}

function getAllMisspellings(baseWord: string) {
  return [...generateMisspellings(baseWord)];
}

function* generateMisspellings(baseWord: string) {
  yield* generateSubstitutions(baseWord);
  yield* generateRandomVowelAdd(baseWord);
  yield* generateRandomDelete(baseWord);
}

function* generateSubstitutions(baseWord: string) {
  for (const [searchValue, replaceValue] of substitutions) {
    if (baseWord.includes(searchValue)) {
      const result = baseWord.replace(searchValue, replaceValue);
      if (!dictionary.check(result)) {
        yield result;
      }
    }
  }
}

function* generateRandomVowelAdd(baseWord: string) {
  if (baseWord.length < 2) return;
  const position = randomInterval(1, baseWord.length - 1);
  const firstPart = baseWord.substring(0, position);
  const secondPart = baseWord.substring(position);
  for (let i = 0; i < baseWord.length / 2; i++) {
    const maybeMisspelled = firstPart + randomEntry(vowels) + secondPart;
    if (!dictionary.check(maybeMisspelled)) {
      yield maybeMisspelled;
      return;
    }
  }
}

function* generateRandomDelete(baseWord: string) {
  if (baseWord.length < 4) return;
  for (let i = 0; i < baseWord.length / 2; i++) {
    const position = randomInterval(1, baseWord.length - 1);
    const firstPart = baseWord.substring(0, position);
    const secondPart = baseWord.substring(position + 1);
    const maybeMisspelled = firstPart + secondPart;
    if (!dictionary.check(maybeMisspelled)) {
      yield maybeMisspelled;
      return;
    }
  }
}
