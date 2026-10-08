import "dotenv/config";
import { readInput } from "./utils/readInput.js";
import { parseExpedientMessages } from "./parsers/expedients.js";
import { generateExpedient } from "./services/expedient.js";

async function main() {
  console.log("Generador de expedientes");
  console.log("");
  console.log("Pegá el mensaje y escribí FIN al terminar:");
  console.log("");

  const message = await readInput();

  console.log("\nProcesando mensaje...");

  const expedients = parseExpedientMessages(message);

  console.log(
    `\nSe encontraron ${expedients.length} expediente(s).`,
  );

  for (const data of expedients) {
    console.log(
      `\nGenerando expediente ${data.contrato}...`,
    );

    const expedient = await generateExpedient(data);

    console.log("✓ Generado correctamente");
    console.log("  Nombre:", expedient.name);
    console.log("  URL:", expedient.url);
  }


  // console.log("Datos obtenidos:");
  // console.log(data);

  // console.log("\nGenerando expediente...");

  // const expedient = await generateExpedient(data);

  // console.log("\n✓ Expediente generado correctamente");
  // console.log("Nombre:", expedient.name);
  // console.log("URL:", expedient.url);
}

main().catch((error) => {
  console.error("\nError:");
  console.error(error);
  process.exit(1);
});