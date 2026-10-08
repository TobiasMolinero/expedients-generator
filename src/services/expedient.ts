import { copyTemplate } from "../google/drive.js";
import { replaceText } from "../google/docs.js";

export interface ExpedientData {
  contrato: string;
  modelo: string;
  color: string;
  nombre: string;
  carnet: string;
  telefono: string;
  direccion: string;
  municipio: string;
  provincia: string;
  observaciones: string;
}

export async function generateExpedient(data: ExpedientData) {
  const document = await copyTemplate(
    `V-${data.contrato} ${data.nombre}`,
  );

  if (!document.id) {
    throw new Error("El documento creado no tiene ID.");
  }

  await replaceText(document.id, {
    "{{contrato}}": data.contrato,
    "{{modelo}}": data.modelo,
    "{{color}}": data.color,
    "{{nombre}}": data.nombre,
    "{{carnet}}": data.carnet,
    "{{telefono}}": data.telefono,
    "{{direccion}}": data.direccion,
    "{{municipio}}": data.municipio,
    "{{provincia}}": data.provincia,
    "{{observaciones}}": data.observaciones,
  });

  return {
    id: document.id,
    name: document.name,
    url: document.webViewLink,
  };
}