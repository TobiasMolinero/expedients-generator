import type { ExpedientData } from "../services/expedient.js";
import { parseExpedientMessage } from "./expedient.js";

export function parseExpedientMessages(
  message: string,
): ExpedientData[] {
  const blocks = message
    .split(/^\s*-{5,}\s*$/m)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block) =>
    parseExpedientMessage(block),
  );
}