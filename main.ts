/**
 * The One-Liner Groan-Off — make.fun bounty entry.
 *
 * What this program does, in full: it writes one original dad joke to the
 * file the grader reads. By default that file is /output/entry.txt; the
 * OUTPUT_PATH environment variable overrides it. The file holds the joke
 * and nothing else — a single line, no trailing newline, no leading or
 * trailing whitespace — so the sealed scorer's gate (UTF-8 text, 1 to 140
 * characters, not only white space) passes and the judge sees exactly the
 * line as written.
 *
 * Why one line matters: the judge reads the jokes two at a time and weighs
 * how fast the punchline arrives, how fresh it is, how tight the wording
 * is and how good the groan is. The punchline sits in the final words, so
 * the whole line is setup until the turn lands.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** The entry: one original dad joke, written fresh for this bounty. */
const JOKE =
  "I put my money in a blender and hit puree — now I'm liquidating my assets.";

/** Gate limits from the bounty spec. */
const GATE = { minChars: 1, maxChars: 140 } as const;

/** Where the joke goes when OUTPUT_PATH is not set. */
const DEFAULT_OUTPUT_PATH = "/output/entry.txt";

/**
 * Validate the joke against every rule the gate enforces.
 * Returns a list of problems; an empty list means the joke is valid.
 */
function validateJoke(joke: string): string[] {
  const found: string[] = [];

  // Length is counted in Unicode code points, as the scorer counts it.
  const chars = [...joke].length;
  if (chars < GATE.minChars) {
    found.push(`joke is empty (needs at least ${GATE.minChars} character)`);
  }
  if (chars > GATE.maxChars) {
    found.push(`joke is ${chars} characters, over the ${GATE.maxChars} limit`);
  }

  // It must be a joke, not blank space.
  if (joke.trim() === "") {
    found.push("joke is only white space");
  }

  // No padding around the line: the file must be exactly the joke.
  if (joke.trim() !== joke) {
    found.push("joke has leading or trailing whitespace");
  }

  // One line only — no line breaks, and no control characters either.
  if (/[\r\n]/.test(joke)) {
    found.push("joke spans more than one line");
  }
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(joke)) {
    found.push("joke contains control characters");
  }

  return found;
}

/** Resolve the output path, defaulting to /output/entry.txt. */
function outputPath(): string {
  const raw = process.env.OUTPUT_PATH;
  if (raw === undefined || raw.trim() === "") {
    return resolve(DEFAULT_OUTPUT_PATH);
  }
  return resolve(raw);
}

/** Write the validated joke to the output file, creating its directory. */
function writeJoke(joke: string, path: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, joke, "utf8");
}

function main(): void {
  const problems = validateJoke(JOKE);
  if (problems.length > 0) {
    throw new Error(`Joke failed validation: ${problems.join("; ")}`);
  }
  writeJoke(JOKE, outputPath());
}

main();
