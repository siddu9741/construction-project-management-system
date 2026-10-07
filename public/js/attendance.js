const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
const language = localStorage.getItem("buildwise-language") || "en";

const attendanceTranslations = {
  en: {
    cannotAccess: "This account cannot access attendance.",
    requestFailed: "The request could not be completed.",
    invalidTime: "Enter time like 09:00 AM or 05:30 PM.",
    invalidHour: "Hour must be from 1 to 12.",
    chooseProject: "Choose a project",
    loading: "Loading projects and attendance...",
    chooseProjectDate: "Choose a project and date to record attendance.",
    couldNotLoadInfo: "Could not load attendance information.",
    couldNotLoadHistory: "Could not load attendance history.",
    noRecords: "No attendance records yet.",
    myAttendance: "My attendance",
    worker: "Worker",
    project: "Project",
    date: "Date",
    status: "Status",
    checkIn: "Check-in",
    checkOut: "Check-out",
    recordedBy: "Recorded by",
    chooseProjectFirst: "Choose a project first.",
    chooseDate: "Choose an attendance date.",
    loadingWorkers: "Loading assigned Workers...",
    workersLoaded: "Assigned Workers loaded.",
    couldNotLoadWorkers: "Could not load assigned Workers.",
    noWorkers: "No active Workers are assigned to this project.",
    projectRole: "Project role",
    action: "Action",
    present: "Present",
    absent: "Absent",
    leave: "Leave",
    timeInPlaceholder: "09:00 AM",
    timeOutPlaceholder: "05:30 PM",
    alreadySaved: "Already saved",
    save: "Save",
    saved: "Attendance saved successfully.",
    emptyValue: "—"
  },
  kn: {
    cannotAccess: "ಈ ಖಾತೆಗೆ ಹಾಜರಾತಿ ವೀಕ್ಷಿಸಲು ಅನುಮತಿಯಿಲ್ಲ.",
    requestFailed: "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    invalidTime: "ಸಮಯವನ್ನು 09:00 AM ಅಥವಾ 05:30 PM ಮಾದರಿಯಲ್ಲಿ ನಮೂದಿಸಿ.",
    invalidHour: "ಗಂಟೆ 1 ರಿಂದ 12ರ ನಡುವೆ ಇರಬೇಕು.",
    chooseProject: "ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    loading: "ಯೋಜನೆಗಳು ಮತ್ತು ಹಾಜರಾತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    chooseProjectDate: "ಹಾಜರಾತಿ ದಾಖಲಿಸಲು ಯೋಜನೆ ಮತ್ತು ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ.",
    couldNotLoadInfo: "ಹಾಜರಾತಿ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    couldNotLoadHistory: "ಹಾಜರಾತಿ ಇತಿಹಾಸವನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    noRecords: "ಇನ್ನೂ ಯಾವುದೇ ಹಾಜರಾತಿ ದಾಖಲೆಗಳಿಲ್ಲ.",
    myAttendance: "ನನ್ನ ಹಾಜರಾತಿ",
    worker: "ಕಾರ್ಮಿಕರು",
    project: "ಯೋಜನೆ",
    date: "ದಿನಾಂಕ",
    status: "ಸ್ಥಿತಿ",
    checkIn: "ಬರುವ ಸಮಯ",
    checkOut: "ಹೋಗುವ ಸಮಯ",
    recordedBy: "ದಾಖಲಿಸಿದವರು",
    chooseProjectFirst: "ಮೊದಲು ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    chooseDate: "ಹಾಜರಾತಿ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    loadingWorkers: "ನಿಯೋಜಿತ ಕಾರ್ಮಿಕರನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    workersLoaded: "ನಿಯೋಜಿತ ಕಾರ್ಮಿಕರನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",
    couldNotLoadWorkers: "ನಿಯೋಜಿತ ಕಾರ್ಮಿಕರನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    noWorkers: "ಈ ಯೋಜನೆಗೆ ಸಕ್ರಿಯ ಕಾರ್ಮಿಕರನ್ನು ನಿಯೋಜಿಸಿಲ್ಲ.",
    projectRole: "ಯೋಜನೆಯಲ್ಲಿನ ಕೆಲಸ",
    action: "ಕ್ರಿಯೆ",
    present: "ಹಾಜರು",
    absent: "ಗೈರು",
    leave: "ರಜೆ",
    timeInPlaceholder: "09:00 AM",
    timeOutPlaceholder: "05:30 PM",
    alreadySaved: "ಈಗಾಗಲೇ ಉಳಿಸಲಾಗಿದೆ",
    save: "ಉಳಿಸಿ",
    saved: "ಹಾಜರಾತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
    emptyValue: "—"
  },
  hi: {
    cannotAccess: "इस खाते को उपस्थिति देखने की अनुमति नहीं है।",
    requestFailed: "अनुरोध पूरा नहीं हो सका।",
    invalidTime: "समय 09:00 AM या 05:30 PM के प्रारूप में दर्ज करें।",
    invalidHour: "घंटा 1 से 12 के बीच होना चाहिए।",
    chooseProject: "परियोजना चुनें",
    loading: "परियोजनाएँ और उपस्थिति लोड हो रही हैं...",
    chooseProjectDate: "उपस्थिति दर्ज करने के लिए परियोजना और तारीख चुनें।",
    couldNotLoadInfo: "उपस्थिति की जानकारी लोड नहीं हो सकी।",
    couldNotLoadHistory: "उपस्थिति इतिहास लोड नहीं हो सका।",
    noRecords: "अभी तक उपस्थिति का कोई रिकॉर्ड नहीं है।",
    myAttendance: "मेरी उपस्थिति",
    worker: "श्रमिक",
    project: "परियोजना",
    date: "तारीख",
    status: "स्थिति",
    checkIn: "आने का समय",
    checkOut: "जाने का समय",
    recordedBy: "दर्ज करने वाला",
    chooseProjectFirst: "पहले परियोजना चुनें।",
    chooseDate: "उपस्थिति की तारीख चुनें।",
    loadingWorkers: "निर्धारित श्रमिक लोड हो रहे हैं...",
    workersLoaded: "निर्धारित श्रमिक लोड हो गए।",
    couldNotLoadWorkers: "निर्धारित श्रमिक लोड नहीं हो सके।",
    noWorkers: "इस परियोजना में कोई सक्रिय श्रमिक निर्धारित नहीं है।",
    projectRole: "परियोजना में काम",
    action: "कार्रवाई",
    present: "उपस्थित",
    absent: "अनुपस्थित",
    leave: "छुट्टी",
    timeInPlaceholder: "09:00 AM",
    timeOutPlaceholder: "05:30 PM",
    alreadySaved: "पहले से सहेजा गया",
    save: "सहेजें",
    saved: "उपस्थिति सफलतापूर्वक सहेजी गई।",
    emptyValue: "—"
  }
};

const words = attendanceTranslations[language] || attendanceTranslations.en;

const messageElement = document.getElementById("attendanceMessage");
const manageCard = document.getElementById("attendanceManageCard");
const projectSelect = document.getElementById("projectSelect");
const dateInput = document.getElementById("attendanceDate");
const loadWorkersButton = document.getElementById("loadWorkersButton");
const workerAttendanceList = document.getElementById("workerAttendanceList");
const attendanceHistory = document.getElementById("attendanceHistory");
const historyHeading = document.getElementById("historyHeading");
const dashboardLink = document.getElementById("dashboardLink");

function showMessage(message, type = "") {
  messageElement.textContent = message;
  messageElement.className = `attendance-message ${type}`;
}

function todayLocalDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function to24HourTime(value) {
  const text = value.trim();
  if (!text) return "";

  const match = text.match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i);

  if (!match) {
    throw new Error(words.invalidTime);
  }

  let hour = Number(match[1]);
  const minute = match[2];
  const period = match[3].toUpperCase();

  if (hour < 1 || hour > 12) {
    throw new Error(words.invalidHour);
  }

  if (period === "AM") {
    hour = hour === 12 ? 0 : hour;
  } else {
    hour = hour === 12 ? 12 : hour + 12;
  }

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function formatTimeForDisplay(value) {
  if (!value) return words.emptyValue;

  const [hourText, minute] = value.split(":");
  let hour = Number(hourText);
  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
}

function translateStatus(status) {
  const key = String(status || "").toLowerCase();
  return words[key] || status || words.emptyValue;
}

dateInput.value = todayLocalDate();

if (!token) {
  window.location.href = "/login.html";
} else if (!["admin", "contractor", "worker"].includes(role)) {
  showMessage(words.cannotAccess, "error");
} else {
  dashboardLink.href =
    role === "admin"
      ? "/admin/dashboard.html"
      : role === "contractor"
        ? "/contractor/dashboard.html"
        : "/worker/dashboard.html";

  if (["admin", "contractor"].includes(role)) {
    manageCard.hidden = false;
    initializeManagerPage();
  } else {
    historyHeading.textContent = words.myAttendance;
    loadAttendanceHistory();
  }
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

async function initializeManagerPage() {
  try {
    showMessage(words.loading);

    const projectData = await apiRequest("/api/projects");
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

    await loadAttendanceHistory();
    showMessage(words.chooseProjectDate, "success");
  } catch (error) {
    showMessage(error.message, "error");
    attendanceHistory.textContent = words.couldNotLoadInfo;
  }
}

async function loadAttendanceHistory() {
  try {
    const data = await apiRequest("/api/attendance");
    renderAttendanceHistory(data.attendance || []);
  } catch (error) {
    showMessage(error.message, "error");
    attendanceHistory.textContent = words.couldNotLoadHistory;
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

function renderAttendanceHistory(records) {
  attendanceHistory.replaceChildren();

  if (records.length === 0) {
    attendanceHistory.textContent = words.noRecords;
    return;
  }

  const table = document.createElement("table");
  table.className = "attendance-table";

  const header = document.createElement("thead");
  const headerRow = document.createElement("tr");

  if (role !== "worker") addHeaderCell(headerRow, words.worker);
  addHeaderCell(headerRow, words.project);
  addHeaderCell(headerRow, words.date);
  addHeaderCell(headerRow, words.status);
  addHeaderCell(headerRow, words.checkIn);
  addHeaderCell(headerRow, words.checkOut);
  if (role !== "worker") addHeaderCell(headerRow, words.recordedBy);

  header.appendChild(headerRow);

  const body = document.createElement("tbody");

  records.forEach((record) => {
    const row = document.createElement("tr");

    if (role !== "worker") addDataCell(row, record.worker_name);

    addDataCell(row, `${record.project_name} (${record.project_code})`);
    addDataCell(row, record.attendance_date);
    addDataCell(row, translateStatus(record.status));
    addDataCell(row, formatTimeForDisplay(record.check_in));
    addDataCell(row, formatTimeForDisplay(record.check_out));

    if (role !== "worker") addDataCell(row, record.recorded_by);

    body.appendChild(row);
  });

  table.append(header, body);
  attendanceHistory.appendChild(table);
}

loadWorkersButton.addEventListener("click", loadWorkersForProject);

async function loadWorkersForProject() {
  const projectId = projectSelect.value;
  const date = dateInput.value;

  if (!projectId) {
    showMessage(words.chooseProjectFirst, "error");
    return;
  }

  if (!date) {
    showMessage(words.chooseDate, "error");
    return;
  }

  try {
    showMessage(words.loadingWorkers);

    const [workerData, recordData] = await Promise.all([
      apiRequest(
        `/api/attendance/projects/${encodeURIComponent(projectId)}/workers`
      ),
      apiRequest(
        `/api/attendance?project_id=${encodeURIComponent(projectId)}&date=${encodeURIComponent(date)}`
      )
    ]);

    renderWorkersForAttendance(
      workerData.workers || [],
      recordData.attendance || [],
      projectId,
      date
    );

    showMessage(words.workersLoaded, "success");
  } catch (error) {
    showMessage(error.message, "error");
    workerAttendanceList.textContent = words.couldNotLoadWorkers;
  }
}

function renderWorkersForAttendance(workers, records, projectId, date) {
  workerAttendanceList.replaceChildren();

  if (workers.length === 0) {
    workerAttendanceList.textContent = words.noWorkers;
    return;
  }

  const savedRecords = new Map(
    records.map((record) => [Number(record.worker_id), record])
  );

  const table = document.createElement("table");
  table.className = "attendance-table";

  const header = document.createElement("thead");
  const headerRow = document.createElement("tr");

  [
    words.worker,
    words.projectRole,
    words.status,
    words.checkIn,
    words.checkOut,
    words.action
  ].forEach((heading) => addHeaderCell(headerRow, heading));

  header.appendChild(headerRow);

  const body = document.createElement("tbody");

  workers.forEach((worker) => {
    const row = document.createElement("tr");
    const saved = savedRecords.get(Number(worker.worker_id));

    addDataCell(row, worker.full_name);
    addDataCell(row, worker.project_job_title || worker.skill);

    const statusCell = document.createElement("td");
    const statusSelect = document.createElement("select");

    [
      ["present", words.present],
      ["absent", words.absent],
      ["leave", words.leave]
    ].forEach(([value, label]) => {
      statusSelect.add(new Option(label, value));
    });

    if (saved) statusSelect.value = saved.status;
    statusCell.appendChild(statusSelect);
    row.appendChild(statusCell);

    const checkInCell = document.createElement("td");
    const checkInInput = document.createElement("input");
    checkInInput.type = "text";
    checkInInput.placeholder = words.timeInPlaceholder;
    checkInInput.value = saved ? formatTimeForDisplay(saved.check_in) : "";
    checkInCell.appendChild(checkInInput);
    row.appendChild(checkInCell);

    const checkOutCell = document.createElement("td");
    const checkOutInput = document.createElement("input");
    checkOutInput.type = "text";
    checkOutInput.placeholder = words.timeOutPlaceholder;
    checkOutInput.value = saved ? formatTimeForDisplay(saved.check_out) : "";
    checkOutCell.appendChild(checkOutInput);
    row.appendChild(checkOutCell);

    const actionCell = document.createElement("td");
    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = saved ? words.alreadySaved : words.save;
    saveButton.disabled = Boolean(saved);

    saveButton.addEventListener("click", () => {
      try {
        saveAttendance({
          project_id: Number(projectId),
          worker_id: Number(worker.worker_id),
          attendance_date: date,
          status: statusSelect.value,
          check_in: to24HourTime(checkInInput.value),
          check_out: to24HourTime(checkOutInput.value)
        });
      } catch (error) {
        showMessage(error.message, "error");
      }
    });

    actionCell.appendChild(saveButton);
    row.appendChild(actionCell);
    body.appendChild(row);
  });

  table.append(header, body);
  workerAttendanceList.appendChild(table);
}

async function saveAttendance(record) {
  try {
    await apiRequest("/api/attendance", {
      method: "POST",
      body: JSON.stringify(record)
    });

    await loadWorkersForProject();
    await loadAttendanceHistory();
    showMessage(words.saved, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}