import { createInterface } from "node:readline";

export function readInput(): Promise<string> {
  return new Promise((resolve) => {
    const readline = createInterface({
      input: process.stdin,
      terminal: false,
    });

    const lines: string[] = [];

    readline.on("line", (line) => {
      if (line.trim().toUpperCase() === "FIN") {
        readline.close();
        resolve(lines.join("\n").trim());
        return;
      }

      lines.push(line);
    });
  });
}