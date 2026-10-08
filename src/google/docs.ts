import { google } from "googleapis";

import { getGoogleAuth } from "./auth.js";

export async function getDocs() {
  const auth = await getGoogleAuth();

  return google.docs({
    version: "v1",
    auth,
  });
}

export async function replaceText(
  documentId: string,
  replacements: Record<string, string>,
) {
  const docs = await getDocs();

  const requests = Object.entries(replacements).map(
    ([placeholder, value]) => ({
      replaceAllText: {
        containsText: {
          text: placeholder,
          matchCase: true,
        },
        replaceText: value,
      },
    }),
  );

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests,
    },
  });
}