import "dotenv/config";

import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseExpedientMessages } from "./parsers/expedients.js";
import { generateExpedient } from "./services/expedient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, "../public");

const PORT = Number(process.env.PORT) || 3001;

const server = http.createServer(async (req, res) => {
  /*
   * API
   */

  if (req.method === "POST" && req.url === "/api/expedientes") {
    try {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const { message } = JSON.parse(body);

          if (!message || typeof message !== "string") {
            res.writeHead(400, {
              "Content-Type": "application/json",
            });

            res.end(
              JSON.stringify({
                success: false,
                error: "El campo 'message' es obligatorio.",
              }),
            );

            return;
          }

          const expedients = parseExpedientMessages(message);

          console.log(
            `\nSe encontraron ${expedients.length} expediente(s).`,
          );

          const results = [];

          for (const data of expedients) {
            console.log(
              `\nGenerando expediente ${data.contrato}...`,
            );

            const expedient = await generateExpedient(data);

            console.log("✓ Generado correctamente");

            results.push({
              contrato: data.contrato,
              name: expedient.name,
              url: expedient.url,
            });
          }

          res.writeHead(200, {
            "Content-Type": "application/json",
          });

          res.end(
            JSON.stringify({
              success: true,
              results,
            }),
          );
        } catch (error) {
          console.error(error);

          res.writeHead(500, {
            "Content-Type": "application/json",
          });

          res.end(
            JSON.stringify({
              success: false,
              error: "Ocurrió un error al generar los expedientes.",
            }),
          );
        }
      });

      return;
    } catch (error) {
      console.error(error);

      res.writeHead(500, {
        "Content-Type": "application/json",
      });

      res.end(
        JSON.stringify({
          success: false,
          error: "Ocurrió un error inesperado.",
        }),
      );

      return;
    }
  }

  /*
   * Frontend
   */

  if (req.method === "GET") {
    let fileName = "index.html";

    if (req.url === "/style.css") {
      fileName = "style.css";
    }

    if (req.url === "/app.js") {
      fileName = "app.js";
    }

    try {
      const filePath = path.join(PUBLIC_DIR, fileName);

      const file = await fs.readFile(filePath);

      const contentTypes: Record<string, string> = {
        "index.html": "text/html; charset=utf-8",
        "style.css": "text/css; charset=utf-8",
        "app.js": "application/javascript; charset=utf-8",
      };

      res.writeHead(200, {
        "Content-Type": contentTypes[fileName],
      });

      res.end(file);

      return;
    } catch (error) {
      console.error(error);

      res.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
      });

      res.end("Archivo no encontrado.");

      return;
    }
  }

  /*
   * Ruta no encontrada
   */

  res.writeHead(404, {
    "Content-Type": "application/json; charset=utf-8",
  });

  res.end(
    JSON.stringify({
      error: "Ruta no encontrada.",
    }),
  );
});

server.listen(PORT, () => {
  console.log(
    `\nServidor iniciado en http://localhost:${PORT}`,
  );
});