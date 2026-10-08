const textarea = document.getElementById("expedients");
const generateButton = document.getElementById("generate-button");
const statusElement = document.getElementById("status");
const results = document.getElementById("results");
const resultsList = document.getElementById("results-list");

function showStatus(message, type) {
  statusElement.textContent = message;

  statusElement.className = "status";
  statusElement.classList.add(type);
}

function hideStatus() {
  statusElement.className = "status hidden";
}

function clearResults() {
  resultsList.innerHTML = "";
  results.classList.add("hidden");
}

function showResults(items) {
  resultsList.innerHTML = "";

  for (const item of items) {
    const resultItem = document.createElement("div");
    resultItem.className = "result-item";

    const contract = document.createElement("div");
    contract.className = "result-contract";
    contract.textContent = `Contrato ${item.contrato}`;

    const link = document.createElement("a");
    link.className = "result-link";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Abrir expediente";

    resultItem.appendChild(contract);
    resultItem.appendChild(link);

    resultsList.appendChild(resultItem);
  }

  results.classList.remove("hidden");
}

async function generateExpedients() {
  const message = textarea.value.trim();

  if (!message) {
    showStatus("Ingresá al menos un expediente.", "error");
    return;
  }

  generateButton.disabled = true;
  clearResults();

  showStatus("Generando expedientes...", "loading");

  try {
    const response = await fetch("/api/expedientes", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "No se pudieron generar los expedientes.",
      );
    }

    showStatus(
      `Se generaron ${data.results.length} expediente(s) correctamente.`,
      "success",
    );

    showResults(data.results);

    textarea.value = "";
  } catch (error) {
    console.error(error);

    showStatus(
      error.message || "Ocurrió un error al generar los expedientes.",
      "error",
    );
  } finally {
    generateButton.disabled = false;
  }
}

generateButton.addEventListener("click", generateExpedients);