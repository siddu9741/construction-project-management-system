const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
const language = localStorage.getItem("buildwise-language") || "en";

const expenseTranslations = {
  en: {
    onlyAllowed: "Only an Admin or Contractor can access project expenses.",
    requestFailed: "The request could not be completed.",
    loadingInfo: "Loading project and expense information...",
    chooseProject: "Choose a project",
    loadedInfo: "Expense information loaded.",
    couldNotLoad: "Could not load project expenses.",
    noExpenses: "No expenses have been recorded yet.",
    date: "Date",
    project: "Project",
    category: "Category",
    description: "Description",
    amount: "Amount",
    recordedBy: "Recorded by",
    emptyValue: "—",
    saved: "Expense saved successfully.",
    labor: "Labor",
    materials: "Materials",
    equipment: "Equipment",
    transport: "Transport",
    utilities: "Utilities",
    permits: "Permits",
    other: "Other"
  },
  kn: {
    onlyAllowed: "ನಿರ್ವಾಹಕರು ಅಥವಾ ಗುತ್ತಿಗೆದಾರರು ಮಾತ್ರ ಯೋಜನಾ ವೆಚ್ಚಗಳನ್ನು ವೀಕ್ಷಿಸಬಹುದು.",
    requestFailed: "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    loadingInfo: "ಯೋಜನೆ ಮತ್ತು ವೆಚ್ಚದ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    chooseProject: "ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    loadedInfo: "ವೆಚ್ಚದ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",
    couldNotLoad: "ಯೋಜನಾ ವೆಚ್ಚಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    noExpenses: "ಇನ್ನೂ ಯಾವುದೇ ವೆಚ್ಚಗಳನ್ನು ದಾಖಲಿಸಿಲ್ಲ.",
    date: "ದಿನಾಂಕ",
    project: "ಯೋಜನೆ",
    category: "ವರ್ಗ",
    description: "ವಿವರಣೆ",
    amount: "ಮೊತ್ತ",
    recordedBy: "ದಾಖಲಿಸಿದವರು",
    emptyValue: "—",
    saved: "ವೆಚ್ಚವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
    labor: "ಕಾರ್ಮಿಕರು",
    materials: "ಸಾಮಗ್ರಿಗಳು",
    equipment: "ಉಪಕರಣಗಳು",
    transport: "ಸಾರಿಗೆ",
    utilities: "ಸೌಲಭ್ಯಗಳು",
    permits: "ಪರವಾನಗಿಗಳು",
    other: "ಇತರೆ"
  },
  hi: {
    onlyAllowed: "केवल प्रशासक या ठेकेदार परियोजना खर्च देख सकते हैं।",
    requestFailed: "अनुरोध पूरा नहीं हो सका।",
    loadingInfo: "परियोजना और खर्च की जानकारी लोड हो रही है...",
    chooseProject: "परियोजना चुनें",
    loadedInfo: "खर्च की जानकारी लोड हो गई।",
    couldNotLoad: "परियोजना खर्च लोड नहीं हो सके।",
    noExpenses: "अभी तक कोई खर्च दर्ज नहीं किया गया है।",
    date: "तारीख",
    project: "परियोजना",
    category: "श्रेणी",
    description: "विवरण",
    amount: "राशि",
    recordedBy: "दर्ज करने वाला",
    emptyValue: "—",
    saved: "खर्च सफलतापूर्वक सहेजा गया।",
    labor: "श्रम",
    materials: "सामग्री",
    equipment: "उपकरण",
    transport: "परिवहन",
    utilities: "उपयोगिताएँ",
    permits: "परमिट",
    other: "अन्य"
  }
};

const words = expenseTranslations[language] || expenseTranslations.en;

const messageElement = document.getElementById("expenseMessage");
const projectSelect = document.getElementById("projectSelect");
const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const saveButton = document.getElementById("saveExpenseButton");
const dashboardLink = document.getElementById("dashboardLink");

function showMessage(message, type = "") {
  messageElement.textContent = message;
  messageElement.className = `expense-message ${type}`;
}

function translateCategory(category) {
  const key = String(category || "").toLowerCase();
  return words[key] || category || words.emptyValue;
}

if (!token) {
  window.location.href = "/login.html";
} else if (!["admin", "contractor"].includes(role)) {
  showMessage(words.onlyAllowed, "error");
  expenseForm.hidden = true;
} else {
  dashboardLink.href =
    role === "admin" ? "/admin/dashboard.html" : "/contractor/dashboard.html";
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
    showMessage(words.loadingInfo);

    const [projectData, expenseData] = await Promise.all([
      apiRequest("/api/projects"),
      apiRequest("/api/expenses")
    ]);

    const projects = Array.isArray(projectData.projects)
      ? projectData.projects
      : [];

    projectSelect.replaceChildren(new Option(words.chooseProject, ""));

    projects.forEach((project) => {
      projectSelect.add(
        new Option(
          `${project.project_name} (${project.project_code})`,
          project.project_id
        )
      );
    });

    renderExpenses(expenseData.expenses || []);
    showMessage(words.loadedInfo, "success");
  } catch (error) {
    showMessage(error.message, "error");
    expenseList.textContent = words.couldNotLoad;
  }
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

function renderExpenses(expenses) {
  expenseList.replaceChildren();

  if (expenses.length === 0) {
    expenseList.textContent = words.noExpenses;
    return;
  }

  const table = document.createElement("table");
  table.className = "expense-table";

  const header = document.createElement("thead");
  const headerRow = document.createElement("tr");

  [
    words.date,
    words.project,
    words.category,
    words.description,
    words.amount,
    words.recordedBy
  ].forEach((heading) => addHeaderCell(headerRow, heading));

  header.appendChild(headerRow);

  const body = document.createElement("tbody");

  expenses.forEach((expense) => {
    const row = document.createElement("tr");

    [
      expense.expense_date,
      `${expense.project_name} (${expense.project_code})`,
      translateCategory(expense.category),
      expense.description || words.emptyValue,
      Number(expense.amount).toFixed(2),
      expense.recorded_by
    ].forEach((value) => addDataCell(row, value));

    body.appendChild(row);
  });

  table.append(header, body);
  expenseList.appendChild(table);
}

expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    project_id: Number(projectSelect.value),
    category: document.getElementById("category").value,
    amount: Number(document.getElementById("amount").value),
    expense_date: document.getElementById("expenseDate").value || null,
    description: document.getElementById("description").value.trim()
  };

  saveButton.disabled = true;

  try {
    const result = await apiRequest("/api/expenses", {
      method: "POST",
      body: JSON.stringify(body)
    });

    expenseForm.reset();

    const refreshed = await apiRequest("/api/expenses");
    renderExpenses(refreshed.expenses || []);

    showMessage(
      `${words.saved} #${result.expense_id}; ${words.amount.toLowerCase()}: ${Number(
        result.amount
      ).toFixed(2)}.`,
      "success"
    );
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
});