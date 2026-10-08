import { google } from "googleapis";

import { getGoogleAuth } from "./auth.js";

const EXPEDIENTES_FOLDER_ID =
  process.env.GOOGLE_EXPEDIENTES_FOLDER_ID;

if (!EXPEDIENTES_FOLDER_ID) {
  throw new Error(
    "Falta GOOGLE_EXPEDIENTES_FOLDER_ID en el archivo .env",
  );
}

const expedientesFolderId: string =
  EXPEDIENTES_FOLDER_ID;

export async function getDrive() {
  const auth = await getGoogleAuth();

  return google.drive({
    version: "v3",
    auth,
  });
}

export async function findTemplate() {
  const drive = await getDrive();

  const response = await drive.files.list({
    q: `
      '${EXPEDIENTES_FOLDER_ID}' in parents
      and name = 'PLANTILLA EXPEDIENTES'
      and trashed = false
    `,
    pageSize: 1,
    fields: "files(id, name, mimeType, parents)",
  });

  const file = response.data.files?.[0];

  if (!file) {
    throw new Error(
      "No se encontró la plantilla 'PLANTILLA EXPEDIENTES' dentro de la carpeta 'Expedientes'.",
    );
  }

  return file;
}

export async function copyTemplate(name: string) {
  const drive = await getDrive();

  const template = await findTemplate();

  if (!template.id) {
    throw new Error(
      "La plantilla no tiene un ID válido.",
    );
  }

  const response = await drive.files.copy({
    fileId: template.id,
    requestBody: {
      name,
      parents: [expedientesFolderId],
    },
    fields: "id, name, mimeType, webViewLink, parents",
  });

  return response.data;
}