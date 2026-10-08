import type { ExpedientData } from "../services/expedient.js";

export function parseExpedientMessage(
  message: string,
): ExpedientData {
  const contrato = extractValue(
    message,
    /^GENERAR EXPEDIENTE\s+(.+)$/im,
  );

  const modelo = extractValue(
    message,
    /^Modelo:\s*(.*)$/im,
  );

  const color = extractValue(
    message,
    /^Color:\s*(.*)$/im,
  );

  const nombre = extractValue(
    message,
    /^Nombre y apellido:\s*(.*)$/im,
  );

  const carnet = extractValue(
    message,
    /^Carnet:\s*(.*)$/im,
  );

  const telefono = extractValue(
    message,
    /^Telefono:\s*(.*)$/im,
  );

  const direccion = extractValue(
    message,
    /^Direccion:\s*(.*)$/im,
  );

  const municipio = extractValue(
    message,
    /^Municipio:\s*(.*)$/im,
  );

  const provincia = extractValue(
    message,
    /^Provincia:\s*(.*)$/im,
  );

  const observaciones = extractValue(
    message,
    /^Observaciones:\s*(.*)$/im,
  );

  return {
    contrato,
    modelo,
    color,
    nombre,
    carnet,
    telefono,
    direccion,
    municipio,
    provincia,
    observaciones,
  };
}

function extractValue(
  message: string,
  regex: RegExp,
): string {
  return message.match(regex)?.[1]?.trim() ?? "";
}