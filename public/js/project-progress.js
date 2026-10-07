const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
const userName = sessionStorage.getItem("authName") || "User";
const language = localStorage.getItem("buildwise-language") || "en";

const progressTranslations = {
  en: {
    unreadable: "The server returned an unreadable response.",
    requestFailed: "The request could not be completed.",
    loading: "Loading progress…",
    loadingUpdates: "Loading updates…",
    noUpdates: "No progress updates have been reported yet.",
    noHistory: "No progress updates yet.",
    noSummary: "No summary provided.",
    couldNotLoadProgress: "Could not load progress.",
    noProjects: "No projects available",
    noProjectsForAccount: "No projects are available for this account.",
    noProjectsHistory: "No projects available.",
    couldNotLoadProjects: "Could not load projects",
    chooseProject: "Choose a project first.",
    saving: "Saving update…",
    saved: "Progress update saved successfully."
  },
  kn: {
    unreadable: "ಸರ್ವರ್‌ನಿಂದ ಓದಲು ಸಾಧ್ಯವಾಗದ ಪ್ರತಿಕ್ರಿಯೆ ಬಂದಿದೆ.",
    requestFailed: "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    loading: "ಪ್ರಗತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",
    loadingUpdates: "ನವೀಕರಣಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",
    noUpdates: "ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಗತಿ ನವೀಕರಣಗಳನ್ನು ವರದಿ ಮಾಡಿಲ್ಲ.",
    noHistory: "ಇನ್ನೂ ಪ್ರಗತಿ ನವೀಕರಣಗಳಿಲ್ಲ.",
    noSummary: "ಸಾರಾಂಶವನ್ನು ನೀಡಿಲ್ಲ.",
    couldNotLoadProgress: "ಪ್ರಗತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    noProjects: "ಯಾವುದೇ ಯೋಜನೆಗಳಿಲ್ಲ",
    noProjectsForAccount: "ಈ ಖಾತೆಗೆ ಯಾವುದೇ ಯೋಜನೆಗಳು ಲಭ್ಯವಿಲ್ಲ.",
    noProjectsHistory: "ಯಾವುದೇ ಯೋಜನೆಗಳಿಲ್ಲ.",
    couldNotLoadProjects: "ಯೋಜನೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ",
    chooseProject: "ಮೊದಲು ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    saving: "ನವೀಕರಣವನ್ನು ಉಳಿಸಲಾಗುತ್ತಿದೆ…",
    saved: "ಪ್ರಗತಿ ನವೀಕರಣವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ."
  },
  hi: {
    unreadable: "सर्वर से पढ़ने योग्य जवाब नहीं मिला।",
    requestFailed: "अनुरोध पूरा नहीं हो सका।",
    loading: "प्रगति लोड हो रही है…",
    loadingUpdates: "अपडेट लोड हो रहे हैं…",
    noUpdates: "अभी तक प्रगति का कोई अपडेट दर्ज नहीं किया गया है।",
    noHistory: "अभी तक प्रगति का कोई अपडेट नहीं है।",
    noSummary: "कोई सारांश नहीं दिया गया।",
    couldNotLoadProgress: "प्रगति लोड नहीं हो सकी।",
    noProjects: "कोई परियोजना उपलब्ध नहीं",
    noProjectsForAccount: "इस खाते के लिए कोई परियोजना उपलब्ध नहीं है।",
    noProjectsHistory: "कोई परियोजना उपलब्ध नहीं।",
    couldNotLoadProjects: "परियोजनाएँ लोड नहीं हो सकीं",
    chooseProject: "पहले परियोजना चुनें।",
    saving: "अपडेट सहेजा जा रहा है…",
    saved: "प्रगति अपडेट सफलतापूर्वक सहेजा गया।"
  }
};

const words = progressTranslations[language] || progressTranslations.en;

const projectSelect = document.getElementById("projectSelect");
const historyRows = document.getElementById("historyRows");
const latestPercent = document.getElementById("latestPercent");
const latestSummary = document.getElementById("latestSummary");
const progressBar = document.getElementById("progressBar");
const pageMessage = document.getElementById("pageMessage");
const formMessage = document.getElementById("formMessage");
const progressForm = document.getElementById("progressForm");
const reportCard = document.getElementById("reportCard");

document.getElementById("accountName").textContent = userName;

if (!token) {
  window.location.href = "/login.html";
}

if (!["admin", "contractor"].includes(role)) {
  reportCard.hidden = true;
}

document.getElementById("logoutButton").addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "/login.html";
});

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(words.unreadable);
  }

  if (!response.ok) {
    throw new Error(result.error || words.requestFailed);
  }

  return result;
}

function showMessage(element, message, type = "") {
  const className = element === pageMessage ? "page-message" : "form-message";
  element.textContent = message;
  element.className = type ? `${className} ${type}` : className;
}

function showEmptyHistory(message) {
  historyRows.replaceChildren();

  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 5;
  cell.textContent = message;
  row.appendChild(cell);
  historyRows.appendChild(row);
}

function addCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value || "—";
  row.appendChild(cell);
}

async function loadProgress(projectId) {
  latestPercent.textContent = "—";
  latestSummary.textContent = words.loading;
  progressBar.style.width = "0%";
  showEmptyHistory(words.loadingUpdates);
  showMessage(pageMessage, "");

  try {
    const result = await apiRequest(
      `/api/project-progress/${encodeURIComponent(projectId)}`
    );
    const updates = Array.isArray(result.updates) ? result.updates : [];

    if (updates.length === 0) {
      latestSummary.textContent = words.noUpdates;
      showEmptyHistory(words.noHistory);
      return;
    }

    const latest = updates[0];
    const percentage = Number(latest.percent_complete);

    latestPercent.textContent = Number.isFinite(percentage)
      ? String(percentage)
      : "—";
    latestSummary.textContent = latest.summary || words.noSummary;
    progressBar.style.width =
      `${Math.max(0, Math.min(100, percentage || 0))}%`;

    historyRows.replaceChildren();

    updates.forEach((update) => {
      const row = document.createElement("tr");
      addCell(row, update.update_date);
      addCell(row, `${update.percent_complete}%`);
      addCell(row, update.summary);
      addCell(row, update.blockers);
      addCell(row, update.reported_by);
      historyRows.appendChild(row);
    });
  } catch (error) {
    latestSummary.textContent = words.couldNotLoadProgress;
    showEmptyHistory(error.message);
    showMessage(pageMessage, error.message, "message-error");
  }
}

async function loadProjects() {
  try {
    const result = await apiRequest("/api/projects");
    const projects = Array.isArray(result.projects) ? result.projects : [];

    projectSelect.replaceChildren();

    if (projects.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = words.noProjects;
      projectSelect.appendChild(option);
      latestSummary.textContent = words.noProjectsForAccount;
      showEmptyHistory(words.noProjectsHistory);
      return;
    }

    projects.forEach((project) => {
      const option = document.createElement("option");
      option.value = project.project_id;
      option.textContent =
        `${project.project_code || `Project ${project.project_id}`} — ` +
        `${project.project_name || "Untitled project"}`;
      projectSelect.appendChild(option);
    });

    await loadProgress(projectSelect.value);
  } catch (error) {
    projectSelect.replaceChildren();
    const option = document.createElement("option");
    option.value = "";
    option.textContent = words.couldNotLoadProjects;
    projectSelect.appendChild(option);
    showMessage(pageMessage, error.message, "message-error");
    showEmptyHistory(error.message);
  }
}

projectSelect.addEventListener("change", () => {
  if (projectSelect.value) {
    loadProgress(projectSelect.value);
  }
});

progressForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const projectId = projectSelect.value;
  if (!projectId) {
    showMessage(formMessage, words.chooseProject, "message-error");
    return;
  }

  const submitButton = progressForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  showMessage(formMessage, words.saving);

  const body = {
    percent_complete: Number(
      document.getElementById("percentComplete").value
    ),
    summary: document.getElementById("summary").value.trim(),
    blockers: document.getElementById("blockers").value.trim()
  };

  try {
    await apiRequest(
      `/api/project-progress/${encodeURIComponent(projectId)}`,
      {
        method: "POST",
        body: JSON.stringify(body)
      }
    );

    showMessage(formMessage, words.saved, "message-success");
    progressForm.reset();
    await loadProgress(projectId);
  } catch (error) {
    showMessage(formMessage, error.message, "message-error");
  } finally {
    submitButton.disabled = false;
  }
});

loadProjects();