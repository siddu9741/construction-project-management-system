const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
const language = localStorage.getItem("buildwise-language") || "en";

const contractTranslations = {
  en: {
    onlyAllowed: "Only an Admin or Contractor can view contracts.",
    requestFailed: "The request could not be completed.",
    loading: "Loading contracts...",
    loaded: "Contract information loaded.",
    couldNotLoad: "Could not load contract information.",
    chooseProject: "Choose a project",
    chooseContractor: "Choose a Contractor",
    noContracts: "No contract records have been created yet.",
    contractNumber: "Contract number",
    project: "Project",
    contractor: "Contractor",
    start: "Start",
    end: "End",
    agreedAmount: "Agreed amount",
    status: "Status",
    updateStatus: "Update status",
    update: "Update",
    draft: "Draft",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    saved: "Contract saved successfully.",
    contractId: "Contract ID",
    confirmStatus: "Change this contract's status to",
    updated: "Contract status updated successfully.",
    emptyValue: "—"
  },
  kn: {
    onlyAllowed: "ನಿರ್ವಾಹಕರು ಅಥವಾ ಗುತ್ತಿಗೆದಾರರು ಮಾತ್ರ ಒಪ್ಪಂದಗಳನ್ನು ವೀಕ್ಷಿಸಬಹುದು.",
    requestFailed: "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    loading: "ಒಪ್ಪಂದಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    loaded: "ಒಪ್ಪಂದದ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",
    couldNotLoad: "ಒಪ್ಪಂದದ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    chooseProject: "ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    chooseContractor: "ಗುತ್ತಿಗೆದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    noContracts: "ಇನ್ನೂ ಯಾವುದೇ ಒಪ್ಪಂದದ ದಾಖಲೆಗಳನ್ನು ರಚಿಸಿಲ್ಲ.",
    contractNumber: "ಒಪ್ಪಂದ ಸಂಖ್ಯೆ",
    project: "ಯೋಜನೆ",
    contractor: "ಗುತ್ತಿಗೆದಾರರು",
    start: "ಪ್ರಾರಂಭ",
    end: "ಅಂತ್ಯ",
    agreedAmount: "ಒಪ್ಪಂದದ ಮೊತ್ತ",
    status: "ಸ್ಥಿತಿ",
    updateStatus: "ಸ್ಥಿತಿ ನವೀಕರಿಸಿ",
    update: "ನವೀಕರಿಸಿ",
    draft: "ಕರಡು",
    active: "ಸಕ್ರಿಯ",
    completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    cancelled: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
    saved: "ಒಪ್ಪಂದವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
    contractId: "ಒಪ್ಪಂದ ಐಡಿ",
    confirmStatus: "ಈ ಒಪ್ಪಂದದ ಸ್ಥಿತಿಯನ್ನು ಇದಕ್ಕೆ ಬದಲಾಯಿಸಬೇಕೆ",
    updated: "ಒಪ್ಪಂದದ ಸ್ಥಿತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
    emptyValue: "—"
  },
  hi: {
    onlyAllowed: "केवल प्रशासक या ठेकेदार अनुबंध देख सकते हैं।",
    requestFailed: "अनुरोध पूरा नहीं हो सका।",
    loading: "अनुबंध लोड हो रहे हैं...",
    loaded: "अनुबंध की जानकारी लोड हो गई।",
    couldNotLoad: "अनुबंध की जानकारी लोड नहीं हो सकी।",
    chooseProject: "परियोजना चुनें",
    chooseContractor: "ठेकेदार चुनें",
    noContracts: "अभी तक कोई अनुबंध रिकॉर्ड नहीं बनाया गया है।",
    contractNumber: "अनुबंध संख्या",
    project: "परियोजना",
    contractor: "ठेकेदार",
    start: "आरंभ",
    end: "समाप्ति",
    agreedAmount: "सहमत राशि",
    status: "स्थिति",
    updateStatus: "स्थिति बदलें",
    update: "बदलें",
    draft: "मसौदा",
    active: "सक्रिय",
    completed: "पूरा हुआ",
    cancelled: "रद्द",
    saved: "अनुबंध सफलतापूर्वक सहेजा गया।",
    contractId: "अनुबंध आईडी",
    confirmStatus: "क्या इस अनुबंध की स्थिति बदलकर यह करें",
    updated: "अनुबंध की स्थिति सफलतापूर्वक बदली गई।",
    emptyValue: "—"
  }
};

const words = contractTranslations[language] || contractTranslations.en;
const contractStatuses = ["draft", "active", "completed", "cancelled"];

const messageElement = document.getElementById("contractMessage");
const formCard = document.getElementById("contractFormCard");
const contractForm = document.getElementById("contractForm");
const projectSelect = document.getElementById("projectSelect");
const contractorSelect = document.getElementById("contractorSelect");
const contractList = document.getElementById("contractList");
const saveButton = document.getElementById("saveContractButton");
const dashboardLink = document.getElementById("dashboardLink");

function showMessage(message, type = "") {
  messageElement.textContent = message;
  messageElement.className = `contract-message ${type}`;
}

function translateStatus(status) {
  const key = String(status || "").toLowerCase();
  return words[key] || status || words.emptyValue;
}

if (!token) {
  window.location.href = "/login.html";
} else if (!["admin", "contractor"].includes(role)) {
  showMessage(words.onlyAllowed, "error");
} else {
  if (role === "admin") {
    formCard.hidden = false;
    dashboardLink.href = "/admin/dashboard.html";
  } else {
    dashboardLink.href = "/contractor/dashboard.html";
  }

  initializePage();
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || words.requestFailed);
  }

  return data;
}

async function initializePage() {
  try {
    showMessage(words.loading);

    if (role === "admin") {
      const [options, contractData] = await Promise.all([
        apiRequest("/api/contracts/options"),
        apiRequest("/api/contracts")
      ]);

      fillProjectOptions(options.projects || []);
      fillContractorOptions(options.contractors || []);
      renderContracts(contractData.contracts || []);
    } else {
      const contractData = await apiRequest("/api/contracts");
      renderContracts(contractData.contracts || []);
    }

    showMessage(words.loaded, "success");
  } catch (error) {
    showMessage(error.message, "error");
    contractList.textContent = words.couldNotLoad;
  }
}

function fillProjectOptions(projects) {
  projectSelect.replaceChildren(new Option(words.chooseProject, ""));

  projects.forEach((project) => {
    projectSelect.add(
      new Option(
        `${project.project_name} (${project.project_code})`,
        project.project_id
      )
    );
  });
}

function fillContractorOptions(contractors) {
  contractorSelect.replaceChildren(new Option(words.chooseContractor, ""));

  contractors.forEach((contractor) => {
    const label = contractor.company_name
      ? `${contractor.full_name} — ${contractor.company_name}`
      : contractor.full_name;

    contractorSelect.add(new Option(label, contractor.contractor_id));
  });
}

function addHeaderCell(row, text) {
  const cell = document.createElement("th");
  cell.textContent = text;
  row.appendChild(cell);
}

function addDataCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value || words.emptyValue;
  row.appendChild(cell);
}

function renderContracts(contracts) {
  contractList.replaceChildren();

  if (contracts.length === 0) {
    contractList.textContent = words.noContracts;
    return;
  }

  const table = document.createElement("table");
  table.className = "contract-table";

  const header = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const headings = [
    words.contractNumber,
    words.project,
    words.contractor,
    words.start,
    words.end,
    words.agreedAmount,
    words.status
  ];

  if (role === "admin") {
    headings.push(words.updateStatus);
  }

  headings.forEach((heading) => addHeaderCell(headerRow, heading));
  header.appendChild(headerRow);

  const body = document.createElement("tbody");

  contracts.forEach((contract) => {
    const row = document.createElement("tr");

    [
      contract.contract_number,
      `${contract.project_name} (${contract.project_code})`,
      contract.company_name
        ? `${contract.contractor_name} — ${contract.company_name}`
        : contract.contractor_name,
      contract.start_date,
      contract.end_date,
      Number(contract.agreed_amount).toFixed(2),
      translateStatus(contract.status)
    ].forEach((value) => addDataCell(row, value));

    if (role === "admin") {
      const actionCell = document.createElement("td");
      const statusSelect = document.createElement("select");

      contractStatuses.forEach((status) => {
        statusSelect.add(new Option(translateStatus(status), status));
      });
      statusSelect.value = contract.status;

      const updateButton = document.createElement("button");
      updateButton.type = "button";
      updateButton.className = "secondary";
      updateButton.textContent = words.update;
      updateButton.addEventListener("click", () => {
        updateContractStatus(contract.contract_id, statusSelect.value);
      });

      actionCell.append(statusSelect, document.createTextNode(" "), updateButton);
      row.appendChild(actionCell);
    }

    body.appendChild(row);
  });

  table.append(header, body);
  contractList.appendChild(table);
}

contractForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    project_id: Number(projectSelect.value),
    contractor_id: Number(contractorSelect.value),
    contract_number: document.getElementById("contractNumber").value.trim(),
    start_date: document.getElementById("startDate").value || null,
    end_date: document.getElementById("endDate").value || null,
    agreed_amount: Number(document.getElementById("agreedAmount").value),
    status: document.getElementById("contractStatus").value
  };

  saveButton.disabled = true;

  try {
    const result = await apiRequest("/api/contracts", {
      method: "POST",
      body: JSON.stringify(body)
    });

    contractForm.reset();
    await reloadContracts();

    showMessage(
      `${words.saved} ${words.contractId}: ${result.contract_id}.`,
      "success"
    );
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
});

async function updateContractStatus(contractId, status) {
  if (!window.confirm(`${words.confirmStatus} "${translateStatus(status)}"?`)) {
    return;
  }

  try {
    await apiRequest(
      `/api/contracts/${encodeURIComponent(contractId)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status })
      }
    );

    await reloadContracts();
    showMessage(words.updated, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function reloadContracts() {
  const data = await apiRequest("/api/contracts");
  renderContracts(data.contracts || []);
}