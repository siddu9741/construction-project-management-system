const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
const language = localStorage.getItem("buildwise-language") || "en";

const managerTranslations = {
  en: {
    onlyAdmin: "Only an Admin can manage the Manager directory.",
    requestFailed: "The request could not be completed.",
    couldNotLoad: "Could not load Managers.",
    noManagers: "No Managers have been added yet.",
    loaded: "Managers loaded.",
    name: "Name",
    email: "Email",
    phone: "Phone",
    employeeCode: "Employee code",
    status: "Status",
    assignedProjects: "Assigned projects",
    action: "Action",
    active: "Active",
    inactive: "Inactive",
    deactivate: "Deactivate",
    activate: "Activate",
    confirmDeactivate: "Are you sure you want to deactivate this Manager?",
    confirmActivate: "Are you sure you want to activate this Manager?",
    added: "Manager added successfully.",
    updated: "Manager status updated successfully.",
    emptyValue: "—"
  },
  kn: {
    onlyAdmin: "ನಿರ್ವಾಹಕರು ಮಾತ್ರ ವ್ಯವಸ್ಥಾಪಕರ ಪಟ್ಟಿಯನ್ನು ನಿರ್ವಹಿಸಬಹುದು.",
    requestFailed: "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    couldNotLoad: "ವ್ಯವಸ್ಥಾಪಕರನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    noManagers: "ಇನ್ನೂ ಯಾವುದೇ ವ್ಯವಸ್ಥಾಪಕರನ್ನು ಸೇರಿಸಿಲ್ಲ.",
    loaded: "ವ್ಯವಸ್ಥಾಪಕರನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",
    name: "ಹೆಸರು",
    email: "ಇಮೇಲ್",
    phone: "ದೂರವಾಣಿ",
    employeeCode: "ಉದ್ಯೋಗಿ ಕೋಡ್",
    status: "ಸ್ಥಿತಿ",
    assignedProjects: "ನಿಯೋಜಿತ ಯೋಜನೆಗಳು",
    action: "ಕ್ರಿಯೆ",
    active: "ಸಕ್ರಿಯ",
    inactive: "ನಿಷ್ಕ್ರಿಯ",
    deactivate: "ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ",
    activate: "ಸಕ್ರಿಯಗೊಳಿಸಿ",
    confirmDeactivate: "ಈ ವ್ಯವಸ್ಥಾಪಕರನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಬೇಕೆ?",
    confirmActivate: "ಈ ವ್ಯವಸ್ಥಾಪಕರನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಬೇಕೆ?",
    added: "ವ್ಯವಸ್ಥಾಪಕರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ.",
    updated: "ವ್ಯವಸ್ಥಾಪಕರ ಸ್ಥಿತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
    emptyValue: "—"
  },
  hi: {
    onlyAdmin: "केवल प्रशासक प्रबंधक सूची को प्रबंधित कर सकता है।",
    requestFailed: "अनुरोध पूरा नहीं हो सका।",
    couldNotLoad: "प्रबंधक लोड नहीं हो सके।",
    noManagers: "अभी तक कोई प्रबंधक नहीं जोड़ा गया है।",
    loaded: "प्रबंधक लोड हो गए।",
    name: "नाम",
    email: "ईमेल",
    phone: "फ़ोन",
    employeeCode: "कर्मचारी कोड",
    status: "स्थिति",
    assignedProjects: "निर्धारित परियोजनाएँ",
    action: "कार्रवाई",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    deactivate: "निष्क्रिय करें",
    activate: "सक्रिय करें",
    confirmDeactivate: "क्या आप इस प्रबंधक को निष्क्रिय करना चाहते हैं?",
    confirmActivate: "क्या आप इस प्रबंधक को सक्रिय करना चाहते हैं?",
    added: "प्रबंधक सफलतापूर्वक जोड़ा गया।",
    updated: "प्रबंधक की स्थिति सफलतापूर्वक बदली गई।",
    emptyValue: "—"
  }
};

const words = managerTranslations[language] || managerTranslations.en;

const messageElement = document.getElementById("managerMessage");
const managerForm = document.getElementById("managerForm");
const managerList = document.getElementById("managerList");
const saveButton = document.getElementById("saveManagerButton");

function showMessage(message, type = "") {
  messageElement.textContent = message;
  messageElement.className = `manager-message ${type}`;
}

if (!token) {
  window.location.href = "/login.html";
} else if (role !== "admin") {
  showMessage(words.onlyAdmin, "error");
  managerForm.hidden = true;
} else {
  loadManagers();
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

async function loadManagers(successMessage = "") {
  try {
    const data = await apiRequest("/api/managers");
    const managers = Array.isArray(data.managers) ? data.managers : [];

    renderManagers(managers);
    showMessage(
      successMessage || `${managers.length} ${words.loaded}`,
      "success"
    );
  } catch (error) {
    showMessage(error.message, "error");
    managerList.textContent = words.couldNotLoad;
  }
}

function addHeaderCell(row, text) {
  const cell = document.createElement("th");
  cell.textContent = text;
  row.appendChild(cell);
}

function addDataCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value ?? words.emptyValue;
  row.appendChild(cell);
}

function renderManagers(managers) {
  managerList.replaceChildren();

  if (managers.length === 0) {
    managerList.textContent = words.noManagers;
    return;
  }

  const table = document.createElement("table");
  table.className = "manager-table";

  const header = document.createElement("thead");
  const headerRow = document.createElement("tr");

  [
    words.name,
    words.email,
    words.phone,
    words.employeeCode,
    words.status,
    words.assignedProjects,
    words.action
  ].forEach((heading) => addHeaderCell(headerRow, heading));

  header.appendChild(headerRow);

  const body = document.createElement("tbody");

  managers.forEach((manager) => {
    const row = document.createElement("tr");

    [
      manager.full_name,
      manager.email,
      manager.phone || words.emptyValue,
      manager.employee_code || words.emptyValue,
      words[manager.status] || manager.status,
      manager.assigned_projects
    ].forEach((value) => addDataCell(row, value));

    const actionCell = document.createElement("td");
    const statusButton = document.createElement("button");
    const isActive = manager.status === "active";

    statusButton.type = "button";
    statusButton.className = isActive ? "secondary" : "";
    statusButton.textContent = isActive ? words.deactivate : words.activate;
    statusButton.addEventListener("click", () => {
      const nextStatus = isActive ? "inactive" : "active";
      updateManagerStatus(manager.manager_id, nextStatus);
    });

    actionCell.appendChild(statusButton);
    row.appendChild(actionCell);
    body.appendChild(row);
  });

  table.append(header, body);
  managerList.appendChild(table);
}

managerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const manager = {
    full_name: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    employee_code: document.getElementById("employeeCode").value.trim()
  };

  saveButton.disabled = true;

  try {
    await apiRequest("/api/managers", {
      method: "POST",
      body: JSON.stringify(manager)
    });

    managerForm.reset();
    await loadManagers(words.added);
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
});

async function updateManagerStatus(managerId, status) {
  const confirmation =
    status === "inactive"
      ? words.confirmDeactivate
      : words.confirmActivate;

  if (!window.confirm(confirmation)) {
    return;
  }

  try {
    await apiRequest(
      `/api/managers/${encodeURIComponent(managerId)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status })
      }
    );

    await loadManagers(words.updated);
  } catch (error) {
    showMessage(error.message, "error");
  }
}