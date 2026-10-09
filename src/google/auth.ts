import { promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { google } from "googleapis";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.resolve(
    __dirname,
    "../../credentials/credentials.json",
);

const TOKEN_PATH = path.resolve(
    __dirname,
    "../../credentials/token.json",
);

const SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
];

export async function getGoogleAuth() {
    // Si ya tenemos token, lo reutilizamos.
    try {
        const token = await fs.readFile(TOKEN_PATH, "utf-8");
        const credentials = JSON.parse(token);

        const auth = new google.auth.OAuth2();

        auth.setCredentials(credentials);

        return auth;
    } catch {
        // No hay token. Tenemos que autenticar.
    }

    const credentialsFile = await fs.readFile(
        CREDENTIALS_PATH,
        "utf-8",
    );

    const credentials = JSON.parse(credentialsFile);

    const { client_id, client_secret } = credentials.installed;

    const server = http.createServer();
    
    await new Promise<void>((resolve) => {
        server.listen(0, "localhost", () => {
            resolve();
        });
    });

    const address = server.address();

    if (!address || typeof address === "string") {
        throw new Error("No se pudo obtener el puerto del servidor OAuth.");
    }

    const redirectUri = `http://localhost:${address.port}`;
    const auth = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirectUri,
    );
    
    const authUrl = auth.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent",
    });

    console.log("\nAbriendo navegador para autenticar Google...");
    console.log("\nURL de autenticación:");
    console.log(authUrl);

    const { exec } = await import("node:child_process");

    exec(`start "" "${authUrl}"`);

    const code = await new Promise<string>((resolve, reject) => {
        server.on("request", (req, res) => {
            try {
                if (!req.url) {
                    res.end("URL inválida.");
                    return;
                }

                const url = new URL(req.url, redirectUri);

                const error = url.searchParams.get("error");

                if (error) {
                    res.end("Autorización rechazada.");
                    reject(new Error(`Google OAuth error: ${error}`));
                    return;
                }

                const code = url.searchParams.get("code");

                if (!code) {
                    res.end("No se recibió el código de autorización.");
                    reject(
                        new Error("Google no devolvió un código de autorización."),
                    );
                    return;
                }

                res.end(
                    "Autenticación completada. Puedes cerrar esta ventana.",
                );

                resolve(code);
            } catch (error) {
                reject(error);
            }
        });
    });

    server.close();

    const { tokens } = await auth.getToken(code);

    auth.setCredentials(tokens);

    await fs.writeFile(
        TOKEN_PATH,
        JSON.stringify(tokens, null, 2),
    );

    return auth;
}