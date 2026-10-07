const token = sessionStorage.getItem("authToken");
const savedRole = sessionStorage.getItem("authRole");
const pageRole = document.body.dataset.role;

const messageElement = document.getElementById("dashboardMessage");
const cardsElement = document.getElementById("summaryCards");
const pendingBody = document.getElementById("pendingRegistrationsBody");

function dashboardText(text) {
  let language = "en";

  try {
    language = localStorage.getItem("buildwise-language") || "en";
  } catch (error) {
    // Use English if browser storage is unavailable.
  }

  const translations = {
    kn: {
      "Total projects": "ಒಟ್ಟು ಯೋಜನೆಗಳು",
      "Active projects": "ಸಕ್ರಿಯ ಯೋಜನೆಗಳು",
      "Completed projects": "ಪೂರ್ಣಗೊಂಡ ಯೋಜನೆಗಳು",
      Contractors: "ಗುತ್ತಿಗೆದಾರರು",
      Workers: "ಕಾರ್ಮಿಕರು",
      Suppliers: "ಪೂರೈಕೆದಾರರು",
      Materials: "ಸಾಮಗ್ರಿಗಳು",
      Expenses: "ವೆಚ್ಚಗಳು",
      "Pending registrations": "ಬಾಕಿ ನೋಂದಣಿಗಳು",
      "My projects": "ನನ್ನ ಯೋಜನೆಗಳು",
      "Assigned projects": "ನಿಯೋಜಿತ ಯೋಜನೆಗಳು",
      "Attendance records": "ಹಾಜರಾತಿ ದಾಖಲೆಗಳು",
      "Present days": "ಹಾಜರಾದ ದಿನಗಳು",
      "Payments received": "ಸ್ವೀಕರಿಸಿದ ಪಾವತಿಗಳು",
      "Payments pending": "ಬಾಕಿ ಪಾವತಿಗಳು",
      waiting: "ಬಾಕಿ",
      Approve: "ಅನುಮೋದಿಸಿ",
      "Approving…": "ಅನುಮೋದಿಸಲಾಗುತ್ತಿದೆ…",
      "There are no pending registrations.": "ಬಾಕಿ ನೋಂದಣಿಗಳಿಲ್ಲ.",
      "No projects are linked to your contracts yet.": "ಇನ್ನೂ ನಿಮ್ಮ ಒಪ್ಪಂದಗಳಿಗೆ ಯೋಜನೆಗಳು ಲಿಂಕ್ ಆಗಿಲ್ಲ.",
      "No progress update yet": "ಇನ್ನೂ ಪ್ರಗತಿ ನವೀಕರಣವಿಲ್ಲ",
      "date unavailable": "ದಿನಾಂಕ ಲಭ್ಯವಿಲ್ಲ",
      "No project assignments are available yet.": "ಇನ್ನೂ ಯೋಜನೆ ಹಂಚಿಕೆಗಳು ಲಭ್ಯವಿಲ್ಲ.",
      "Not assigned": "ನಿಯೋಜಿಸಲಾಗಿಲ್ಲ",
      "No attendance records are available yet.": "ಹಾಜರಾತಿ ದಾಖಲೆಗಳು ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ.",
      "No personal payment records are available yet.": "ವೈಯಕ್ತಿಕ ಪಾವತಿ ದಾಖಲೆಗಳು ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ.",
      "Loading dashboard information…": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
      "Your session expired. Please sign in again.": "ನಿಮ್ಮ ಸೆಷನ್ ಅವಧಿ ಮುಗಿದಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.",
      "The request could not be completed.": "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲಾಗಲಿಲ್ಲ.",
      " to ": " ರಿಂದ ",
      "Not Started": "ಪ್ರಾರಂಭವಾಗಿಲ್ಲ",
      "In Progress": "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
      "On Hold": "ತಡೆಹಿಡಿಯಲಾಗಿದೆ",
      Completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
      present: "ಹಾಜರು",
      absent: "ಗೈರು",
      leave: "ರಜೆ",
      paid: "ಪಾವತಿಸಲಾಗಿದೆ",
      pending: "ಬಾಕಿ"
    },

    hi: {
      "Total projects": "कुल परियोजनाएँ",
      "Active projects": "सक्रिय परियोजनाएँ",
      "Completed projects": "पूरी हुई परियोजनाएँ",
      Contractors: "ठेकेदार",
      Workers: "श्रमिक",
      Suppliers: "आपूर्तिकर्ता",
      Materials: "सामग्री",
      Expenses: "खर्च",
      "Pending registrations": "लंबित पंजीकरण",
      "My projects": "मेरी परियोजनाएँ",
      "Assigned projects": "निर्धारित परियोजनाएँ",
      "Attendance records": "उपस्थिति रिकॉर्ड",
      "Present days": "उपस्थित दिन",
      "Payments received": "प्राप्त भुगतान",
      "Payments pending": "लंबित भुगतान",
      waiting: "प्रतीक्षा में",
      Approve: "अनुमोदित करें",
      "Approving…": "अनुमोदन हो रहा है…",
      "There are no pending registrations.": "कोई लंबित पंजीकरण नहीं है।",
      "No projects are linked to your contracts yet.": "अभी आपके अनुबंधों से कोई परियोजना जुड़ी नहीं है।",
      "No progress update yet": "अभी कोई प्रगति अपडेट नहीं है",
      "date unavailable": "तिथि उपलब्ध नहीं",
      "No project assignments are available yet.": "अभी कोई परियोजना कार्य आवंटन उपलब्ध नहीं है।",
      "Not assigned": "निर्धारित नहीं",
      "No attendance records are available yet.": "अभी उपस्थिति रिकॉर्ड उपलब्ध नहीं हैं।",
      "No personal payment records are available yet.": "अभी व्यक्तिगत भुगतान रिकॉर्ड उपलब्ध नहीं हैं।",
      "Loading dashboard information…": "डैशबोर्ड जानकारी लोड हो रही है…",
      "Your session expired. Please sign in again.": "आपका सत्र समाप्त हो गया है। कृपया फिर से साइन इन करें।",
      "The request could not be completed.": "अनुरोध पूरा नहीं किया जा सका।",
      " to ": " से ",
      "Not Started": "शुरू नहीं हुआ",
      "In Progress": "प्रगति पर",
      "On Hold": "रुका हुआ",
      Completed: "पूरा हुआ",
      present: "उपस्थित",
      absent: "अनुपस्थित",
      leave: "छुट्टी",
      paid: "भुगतान किया गया",
      pending: "लंबित"
    }
  };

  const translated = translations[language]?.[text];
  if (translated) return translated;

  // Translate the date-range connector, if this text contains one.
  if (language === "kn") return text.replaceAll(" to ", " ರಿಂದ ");
  if (language === "hi") return text.replaceAll(" to ", " से ");

  return text;
}

function showMessage(message, isError = false) {
  if (!messageElement) return;

  messageElement.textContent = dashboardText(message);
  messageElement.classList.toggle("error-state", isError);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    sessionStorage.clear();
    window.location.href = "/login.html";
    throw new Error("Your session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(data.error || "The request could not be completed.");
  }

  return data;
}

function addSummaryCard(label, value, icon) {
  const card = document.createElement("article");
  card.className = "stat-card";

  const top = document.createElement("div");
  top.className = "stat-top";

  const title = document.createElement("span");
  title.className = "stat-label";
  title.textContent = dashboardText(label);

  const iconBox = document.createElement("span");
  iconBox.className = "stat-icon";
  iconBox.setAttribute("aria-hidden", "true");
  iconBox.textContent = icon;

  const number = document.createElement("strong");
  number.className = "stat-value";
  number.textContent = value;

  top.append(title, iconBox);
  card.append(top, number);
  cardsElement.append(card);
}

function renderAdminCards(summary) {
  cardsElement.replaceChildren();

  const expenses = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(summary.total_expenses || 0));

  const cards = [
    ["Total projects", summary.total_projects, "▦"],
    ["Active projects", summary.active_projects, "◷"],
    ["Completed projects", summary.completed_projects, "✓"],
    ["Contractors", summary.contractors, "♙"],
    ["Workers", summary.workers, "⚒"],
    ["Suppliers", summary.suppliers, "¤"],
    ["Materials", summary.materials, "▧"],
    ["Expenses", expenses, "₹"],
    ["Pending registrations", summary.pending_registrations, "◉"]
  ];

  for (const [label, value, icon] of cards) {
    addSummaryCard(label, value ?? 0, icon);
  }

  const pendingCount = document.getElementById("pendingCount");
  if (pendingCount) {
    const count = summary.pending_registrations || 0;
    pendingCount.textContent = `${count} ${dashboardText("waiting")}`;
  }
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = dashboardText(text || "—");
  return cell;
}

function renderPendingRegistrations(contractors, workers) {
  if (!pendingBody) return;

  pendingBody.replaceChildren();

  const registrations = [
    ...contractors.map((item) => ({ ...item, role: "Contractor" })),
    ...workers.map((item) => ({ ...item, role: "Worker" }))
  ];

  if (registrations.length === 0) {
    const row = document.createElement("tr");
    const cell = createCell("There are no pending registrations.");
    cell.colSpan = 5;
    cell.className = "empty-state";
    row.append(cell);
    pendingBody.append(row);
    return;
  }

  for (const registration of registrations) {
    const row = document.createElement("tr");
    row.append(
      createCell(registration.full_name),
      createCell(registration.role),
      createCell(registration.email),
      createCell(registration.phone)
    );

    const actionCell = document.createElement("td");
    const approveButton = document.createElement("button");
    approveButton.className = "button button-primary";
    approveButton.type = "button";
    approveButton.textContent = dashboardText("Approve");

    approveButton.addEventListener("click", async () => {
      approveButton.disabled = true;
      approveButton.textContent = dashboardText("Approving…");

      try {
        const endpoint =
          registration.role === "Contractor"
            ? `/api/admin/contractors/${registration.contractor_id}/approve`
            : `/api/admin/workers/${registration.worker_id}/approve`;

        await apiRequest(endpoint, { method: "POST" });
        await loadAdminDashboard();
      } catch (error) {
        showMessage(error.message, true);
        approveButton.disabled = false;
        approveButton.textContent = dashboardText("Approve");
      }
    });

    actionCell.append(approveButton);
    row.append(actionCell);
    pendingBody.append(row);
  }
}

async function loadAdminDashboard() {
  showMessage("Loading dashboard information…");

  const [dashboard, contractorList, workerList] = await Promise.all([
    apiRequest("/api/admin/dashboard"),
    apiRequest("/api/admin/contractors/pending"),
    apiRequest("/api/admin/workers/pending")
  ]);

  renderAdminCards(dashboard.summary);
  renderPendingRegistrations(
    contractorList.contractors || [],
    workerList.workers || []
  );

  const nameElement = document.getElementById("currentUserName");
  if (nameElement) {
    nameElement.textContent =
      dashboard.admin?.name || sessionStorage.getItem("authName") || "Admin";
  }

  showMessage("");
}

function renderContractorCards(summary) {
  cardsElement.replaceChildren();

  const expenses = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(summary.expenses || 0));

  const cards = [
    ["My projects", summary.my_projects, "▦"],
    ["Active projects", summary.active_projects, "◷"],
    ["Completed projects", summary.completed_projects, "✓"],
    ["Workers", summary.workers, "⚒"],
    ["Materials", summary.materials, "▧"],
    ["Suppliers", summary.suppliers, "¤"],
    ["Expenses", expenses, "₹"]
  ];

  for (const [label, value, icon] of cards) {
    addSummaryCard(label, value ?? 0, icon);
  }
}

function renderContractorProjects(projects) {
  const tableBody = document.getElementById("contractorProjectsBody");
  tableBody.replaceChildren();

  if (projects.length === 0) {
    const row = document.createElement("tr");
    const cell = createCell("No projects are linked to your contracts yet.");
    cell.colSpan = 5;
    cell.className = "empty-state";
    row.append(cell);
    tableBody.append(row);
    return;
  }

  for (const project of projects) {
    const row = document.createElement("tr");

    row.append(
      createCell(project.project_name),
      createCell(project.location),
      createCell(project.status)
    );

    const progressCell = document.createElement("td");
    const progress = document.createElement("progress");
    const percent = Number(project.percent_complete || 0);
    progress.max = 100;
    progress.value = percent;
    progress.setAttribute("aria-label", `${percent}% complete`);

    const percentLabel = document.createElement("span");
    percentLabel.textContent = ` ${percent}%`;

    progressCell.append(progress, percentLabel);
    row.append(progressCell);

    const updateText = project.latest_update
      ? `${project.latest_update} (${project.progress_date || dashboardText("date unavailable")})`
      : dashboardText("No progress update yet");

    row.append(createCell(updateText));
    tableBody.append(row);
  }
}

async function loadContractorDashboard() {
  showMessage("Loading dashboard information…");

  const data = await apiRequest("/api/contractor/dashboard");

  renderContractorCards(data.summary || {});
  renderContractorProjects(data.projects || []);

  const nameElement = document.getElementById("currentUserName");
  if (nameElement) {
    nameElement.textContent =
      data.contractor?.name ||
      sessionStorage.getItem("authName") ||
      "Contractor";
  }

  showMessage("");
}

function formatRupees(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
}

function renderWorkerCards(summary) {
  cardsElement.replaceChildren();

  const cards = [
    ["Assigned projects", summary.assigned_projects, "▦"],
    ["Attendance records", summary.attendance_days, "◷"],
    ["Present days", summary.present_days, "✓"],
    ["Payments received", formatRupees(summary.paid_total), "₹"],
    ["Payments pending", formatRupees(summary.pending_payment_total), "◉"]
  ];

  for (const [label, value, icon] of cards) {
    addSummaryCard(label, value ?? 0, icon);
  }
}

function renderWorkerProjects(projects) {
  const tableBody = document.getElementById("assignedProjectsBody");
  tableBody.replaceChildren();

  if (projects.length === 0) {
    const row = document.createElement("tr");
    const cell = createCell("No project assignments are available yet.");
    cell.colSpan = 5;
    cell.className = "empty-state";
    row.append(cell);
    tableBody.append(row);
    return;
  }

  for (const project of projects) {
    const row = document.createElement("tr");
    row.append(
      createCell(project.project_name),
      createCell(project.work_details),
      createCell(project.manager_name || "Not assigned"),
      createCell(project.location),
      createCell(project.status)
    );
    tableBody.append(row);
  }
}

function renderWorkerAttendance(records) {
  const tableBody = document.getElementById("workerAttendanceBody");
  tableBody.replaceChildren();

  if (records.length === 0) {
    const row = document.createElement("tr");
    const cell = createCell("No attendance records are available yet.");
    cell.colSpan = 5;
    cell.className = "empty-state";
    row.append(cell);
    tableBody.append(row);
    return;
  }

  for (const record of records) {
    const row = document.createElement("tr");
    row.append(
      createCell(record.attendance_date),
      createCell(record.project_name),
      createCell(record.status),
      createCell(record.check_in),
      createCell(record.check_out)
    );
    tableBody.append(row);
  }
}

function renderWorkerPayments(records) {
  const tableBody = document.getElementById("workerPaymentsBody");
  tableBody.replaceChildren();

  if (records.length === 0) {
    const row = document.createElement("tr");
    const cell = createCell("No personal payment records are available yet.");
    cell.colSpan = 5;
    cell.className = "empty-state";
    row.append(cell);
    tableBody.append(row);
    return;
  }

  for (const payment of records) {
    const period =
      payment.period_start || payment.period_end
        ? `${payment.period_start || "—"} to ${payment.period_end || "—"}`
        : "—";

    const row = document.createElement("tr");
    row.append(
      createCell(payment.project_name),
      createCell(payment.payment_date),
      createCell(period),
      createCell(formatRupees(payment.amount)),
      createCell(payment.status)
    );
    tableBody.append(row);
  }
}

async function loadWorkerDashboard() {
  showMessage("Loading dashboard information…");

  const data = await apiRequest("/api/worker/dashboard");

  renderWorkerCards(data.summary || {});
  renderWorkerProjects(data.assigned_projects || []);
  renderWorkerAttendance(data.recent_attendance || []);
  renderWorkerPayments(data.recent_payments || []);

  const nameElement = document.getElementById("currentUserName");
  if (nameElement) {
    nameElement.textContent =
      data.worker?.full_name ||
      sessionStorage.getItem("authName") ||
      "Worker";
  }

  showMessage("");
}

function signOut() {
  sessionStorage.clear();
  window.location.href = "/login.html";
}

const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
  logoutButton.addEventListener("click", signOut);
}

if (!token || !savedRole) {
  window.location.href = "/login.html";
} else if (savedRole !== pageRole) {
  window.location.href = `/${savedRole}/dashboard.html`;
} else if (pageRole === "admin") {
  loadAdminDashboard().catch((error) => showMessage(error.message, true));
} else if (pageRole === "contractor") {
  loadContractorDashboard().catch((error) => showMessage(error.message, true));
} else if (pageRole === "worker") {
  loadWorkerDashboard().catch((error) => showMessage(error.message, true));
}