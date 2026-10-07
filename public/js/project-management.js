const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
const userName = sessionStorage.getItem("authName") || "User";
const language = localStorage.getItem("buildwise-language") || "en";

const projectTranslations = {
  en: {
    sessionExpired: "Your session expired. Please sign in again.",
    requestFailed: "The request could not be completed.",
    noResults: "No projects match your search or filter.",
    loading: "Loading projects…",
    shown: "projects shown.",
    details: "Details",
    edit: "Edit",
    delete: "Delete",
    noClient: "No client",
    notAssigned: "Not assigned",
    noManagerOption: "No Manager assigned",
    editProject: "Edit project",
    addProject: "Add project",
    projectId: "Project ID",
    client: "Client",
    location: "Location",
    manager: "Manager",
    status: "Status",
    budget: "Budget",
    startDate: "Start date",
    expectedCompletion: "Expected completion",
    progress: "Progress",
    noDescription: "No description provided.",
    progressHistory: "Progress history",
    noProgress: "No progress updates have been recorded.",
    save: "Save project",
    saving: "Saving…",
    added: "Project added successfully.",
    updated: "Project updated successfully.",
    deleted: "Project deleted.",
    confirmDelete: "Delete project",
    linkedRecords: "Projects with linked records cannot be deleted.",
    contractorDescription: "Create and manage your own contracted projects.",
    adminDescription: "View and search all projects across the system.",
    workerDescription: "View only projects assigned to your Worker account.",
    notStarted: "Not Started",
    inProgress: "In Progress",
    onHold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
    // en
    workers: "Workers",
    contractors: "Contractors"
  },
  kn: {
    sessionExpired: "ನಿಮ್ಮ ಸೆಷನ್ ಅವಧಿ ಮುಗಿದಿದೆ. ಮತ್ತೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.",
    requestFailed: "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    noResults: "ನಿಮ್ಮ ಹುಡುಕಾಟ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದುವ ಯೋಜನೆಗಳಿಲ್ಲ.",
    loading: "ಯೋಜನೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",
    shown: "ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಲಾಗಿದೆ.",
    details: "ವಿವರಗಳು",
    edit: "ತಿದ್ದುಪಡಿ",
    delete: "ಅಳಿಸಿ",
    noClient: "ಗ್ರಾಹಕರಿಲ್ಲ",
    notAssigned: "ನಿಯೋಜಿಸಿಲ್ಲ",
    noManagerOption: "ವ್ಯವಸ್ಥಾಪಕರನ್ನು ನಿಯೋಜಿಸಿಲ್ಲ",
    editProject: "ಯೋಜನೆ ತಿದ್ದುಪಡಿ",
    addProject: "ಯೋಜನೆ ಸೇರಿಸಿ",
    projectId: "ಯೋಜನೆ ಐಡಿ",
    client: "ಗ್ರಾಹಕರು",
    location: "ಸ್ಥಳ",
    manager: "ವ್ಯವಸ್ಥಾಪಕರು",
    status: "ಸ್ಥಿತಿ",
    budget: "ಬಜೆಟ್",
    startDate: "ಪ್ರಾರಂಭ ದಿನಾಂಕ",
    expectedCompletion: "ನಿರೀಕ್ಷಿತ ಪೂರ್ಣಗೊಳಿಸುವಿಕೆ",
    progress: "ಪ್ರಗತಿ",
    noDescription: "ವಿವರಣೆ ನೀಡಿಲ್ಲ.",
    progressHistory: "ಪ್ರಗತಿ ಇತಿಹಾಸ",
    noProgress: "ಯಾವುದೇ ಪ್ರಗತಿ ನವೀಕರಣಗಳನ್ನು ದಾಖಲಿಸಿಲ್ಲ.",
    save: "ಯೋಜನೆ ಉಳಿಸಿ",
    saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ…",
    added: "ಯೋಜನೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ.",
    updated: "ಯೋಜನೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
    deleted: "ಯೋಜನೆಯನ್ನು ಅಳಿಸಲಾಗಿದೆ.",
    confirmDelete: "ಯೋಜನೆಯನ್ನು ಅಳಿಸಬೇಕೆ",
    linkedRecords: "ಸಂಬಂಧಿತ ದಾಖಲೆಗಳಿರುವ ಯೋಜನೆಗಳನ್ನು ಅಳಿಸಲಾಗುವುದಿಲ್ಲ.",
    contractorDescription: "ನಿಮ್ಮ ಒಪ್ಪಂದದ ಯೋಜನೆಗಳನ್ನು ರಚಿಸಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ.",
    adminDescription: "ವ್ಯವಸ್ಥೆಯ ಎಲ್ಲಾ ಯೋಜನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಹುಡುಕಿ.",
    workerDescription: "ನಿಮ್ಮ ಕಾರ್ಮಿಕ ಖಾತೆಗೆ ನಿಯೋಜಿಸಿದ ಯೋಜನೆಗಳನ್ನು ಮಾತ್ರ ನೋಡಿ.",
    notStarted: "ಪ್ರಾರಂಭವಾಗಿಲ್ಲ",
    inProgress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    onHold: "ತಡೆಹಿಡಿಯಲಾಗಿದೆ",
    completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    cancelled: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
    // kn
    workers: "ಕಾರ್ಮಿಕರು",
    contractors: "ಗುತ್ತಿಗೆದಾರರು"
  },
  hi: {
    sessionExpired: "आपका सत्र समाप्त हो गया। कृपया फिर से साइन इन करें।",
    requestFailed: "अनुरोध पूरा नहीं हो सका।",
    noResults: "आपकी खोज या फ़िल्टर से मेल खाने वाली परियोजनाएँ नहीं हैं।",
    loading: "परियोजनाएँ लोड हो रही हैं…",
    shown: "परियोजनाएँ दिखाई गईं।",
    details: "विवरण",
    edit: "बदलें",
    delete: "हटाएँ",
    noClient: "कोई ग्राहक नहीं",
    notAssigned: "नियुक्त नहीं",
    noManagerOption: "कोई प्रबंधक नियुक्त नहीं",
    editProject: "परियोजना बदलें",
    addProject: "परियोजना जोड़ें",
    projectId: "परियोजना आईडी",
    client: "ग्राहक",
    location: "स्थान",
    manager: "प्रबंधक",
    status: "स्थिति",
    budget: "बजट",
    startDate: "आरंभ तिथि",
    expectedCompletion: "अनुमानित पूर्णता",
    progress: "प्रगति",
    noDescription: "कोई विवरण नहीं दिया गया।",
    progressHistory: "प्रगति इतिहास",
    noProgress: "प्रगति का कोई अपडेट दर्ज नहीं किया गया है।",
    save: "परियोजना सहेजें",
    saving: "सहेजा जा रहा है…",
    added: "परियोजना सफलतापूर्वक जोड़ी गई।",
    updated: "परियोजना सफलतापूर्वक बदली गई।",
    deleted: "परियोजना हटा दी गई।",
    confirmDelete: "परियोजना हटाएँ",
    linkedRecords: "जुड़े हुए रिकॉर्ड वाली परियोजनाएँ नहीं हटाई जा सकतीं।",
    contractorDescription: "अपनी अनुबंधित परियोजनाएँ बनाएँ और प्रबंधित करें।",
    adminDescription: "सिस्टम की सभी परियोजनाएँ देखें और खोजें।",
    workerDescription: "केवल अपने श्रमिक खाते को दी गई परियोजनाएँ देखें।",
    notStarted: "शुरू नहीं हुई",
    inProgress: "प्रगति पर",
    onHold: "रोकी गई",
    completed: "पूरी हुई",
    cancelled: "रद्द",
    // hi
    workers: "श्रमिक",
    contractors: "ठेकेदार"
  }
};

const words = projectTranslations[language] || projectTranslations.en;

const pageMessage = document.getElementById("projectPageMessage");
const tableBody = document.getElementById("projectsTableBody");
const addButton = document.getElementById("addProjectButton");
const formDialog = document.getElementById("projectFormDialog");
const detailsDialog = document.getElementById("projectDetailsDialog");
const projectForm = document.getElementById("projectForm");
const formMessage = document.getElementById("projectFormMessage");

let managerOptionsLoaded = false;

function showPageMessage(text, isError = false) {
  pageMessage.textContent = text;
  pageMessage.classList.toggle("error-state", isError);
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function translateStatus(status) {
  const key = String(status || "").toLowerCase().replaceAll(" ", "");
  const statusKeys = {
    notstarted: "notStarted",
    planned: "notStarted",
    inprogress: "inProgress",
    active: "inProgress",
    onhold: "onHold",
    paused: "onHold",
    completed: "completed",
    cancelled: "cancelled"
  };
  return words[statusKeys[key]] || status || "";
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
    throw new Error(words.sessionExpired);
  }

  if (!response.ok) {
    throw new Error(data.error || words.requestFailed);
  }

  return data;
}

function makeCell(text) {
  const cell = document.createElement("td");
  cell.textContent =
    text === null || text === undefined || text === "" ? "—" : String(text);
  return cell;
}

function makeButton(label, className, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function renderProjects(projects) {
  tableBody.replaceChildren();

  if (projects.length === 0) {
    const row = document.createElement("tr");
    const cell = makeCell(words.noResults);
    cell.colSpan = 7;
    cell.className = "empty-state";
    row.append(cell);
    tableBody.append(row);
    return;
  }

  for (const project of projects) {
    const row = document.createElement("tr");
    row.style.cursor = "pointer";
    row.title = words.details;

    row.append(
      makeCell(project.project_id),
      makeCell(project.project_code),
      makeCell(
        `${project.project_name} — ${project.client_name || words.noClient}`
      ),
      makeCell(project.manager_name || words.notAssigned)
    );

    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = "badge";
    statusBadge.textContent = translateStatus(project.status_label);
    statusCell.append(statusBadge);
    row.append(statusCell);

    const progressCell = document.createElement("td");
    const progressBox = document.createElement("div");
    progressBox.className = "table-progress";

    const progressTrack = document.createElement("div");
    progressTrack.className = "progress-track";

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    const percent = Math.max(
      0,
      Math.min(100, Number(project.progress_percent || 0))
    );
    progressFill.style.width = `${percent}%`;

    const percentText = document.createElement("span");
    percentText.textContent = `${percent}%`;

    progressTrack.append(progressFill);
    progressBox.append(progressTrack, percentText);
    progressCell.append(progressBox);
    row.append(progressCell);

    const actionsCell = document.createElement("td");
    actionsCell.append(
      makeButton(words.details, "button", () =>
        showProjectDetails(project.project_id)
      )
    );

    if (role === "contractor") {
      actionsCell.append(
        makeButton(words.edit, "button", () =>
          openProjectForm(project.project_id)
        ),
        makeButton(words.delete, "button", () => deleteProject(project))
      );
    }

    row.append(actionsCell);

    row.addEventListener("dblclick", (event) => {
      if (event.target.closest("button")) return;
      showProjectDetails(project.project_id);
    });

    tableBody.append(row);
  }
}

async function loadProjects(successMessage = "") {
  showPageMessage(words.loading);

  const parameters = new URLSearchParams();
  const search = document.getElementById("projectSearch").value.trim();
  const status = document.getElementById("projectStatusFilter").value;

  if (search) parameters.set("search", search);
  if (status) parameters.set("status", status);

  try {
    const query = parameters.toString();
    const data = await apiRequest(
      `/api/projects${query ? `?${query}` : ""}`
    );

    renderProjects(data.projects || []);
    showPageMessage(
      successMessage || `${(data.projects || []).length} ${words.shown}`
    );
  } catch (error) {
    showPageMessage(error.message, true);
  }
}

async function loadManagerOptions() {
  if (managerOptionsLoaded) return;

  const data = await apiRequest("/api/projects/managers");
  const select = document.getElementById("managerId");

  for (const manager of data.managers || []) {
    const option = document.createElement("option");
    option.value = manager.manager_id;
    option.textContent = manager.full_name;
    select.append(option);
  }

  managerOptionsLoaded = true;
}

function fillProjectForm(project) {
  document.getElementById("projectId").value = project?.project_id || "";
  document.getElementById("projectCode").value = project?.project_code || "";
  document.getElementById("projectName").value = project?.project_name || "";
  document.getElementById("clientName").value = project?.client_name || "";
  document.getElementById("projectLocation").value = project?.location || "";
  document.getElementById("managerId").value = project?.manager_id || "";
  document.getElementById("startDate").value = project?.start_date || "";
  document.getElementById("expectedEndDate").value =
    project?.expected_end_date || "";
  document.getElementById("projectBudget").value = project?.budget ?? 0;
  document.getElementById("projectStatus").value =
    project?.status_label || "Not Started";
  document.getElementById("progressPercent").value =
    project?.progress_percent ?? 0;
  document.getElementById("projectDescription").value =
    project?.description || "";
}

async function openProjectForm(projectId = null) {
  formMessage.textContent = "";
  projectForm.reset();

  try {
    await loadManagerOptions();

    let project = null;
    if (projectId !== null) {
      const data = await apiRequest(`/api/projects/${projectId}`);
      project = data.project;
    }

    fillProjectForm(project);
    document.getElementById("projectFormTitle").textContent = project
      ? words.editProject
      : words.addProject;
    formDialog.showModal();
  } catch (error) {
    showPageMessage(error.message, true);
  }
}

function addDetailItem(grid, label, value) {
  const item = document.createElement("div");
  item.className = "detail-item";

  const title = document.createElement("span");
  title.className = "detail-label";
  title.textContent = label;

  const text = document.createElement("span");
  text.className = "detail-value";
  text.textContent =
    value === null || value === undefined || value === "" ? "—" : String(value);

  item.append(title, text);
  grid.append(item);
}

async function showProjectDetails(projectId) {
  const content = document.getElementById("projectDetailsContent");
  content.replaceChildren();

  try {
    const data = await apiRequest(`/api/projects/${projectId}`);
    const project = data.project;

    const heading = document.createElement("h3");
    heading.textContent = `${project.project_code} — ${project.project_name}`;
    content.append(heading);

    const grid = document.createElement("div");
    grid.className = "detail-grid";

    addDetailItem(grid, words.projectId, project.project_id);
    addDetailItem(grid, words.client, project.client_name);
    addDetailItem(grid, words.location, project.location);
    addDetailItem(grid, words.manager, project.manager_name || words.notAssigned);
    addDetailItem(grid, words.workers, Number(project.worker_count || 0));
    addDetailItem(grid, words.contractors, Number(project.contractor_count || 0));
    addDetailItem(grid, words.status, translateStatus(project.status_label));
    addDetailItem(grid, words.budget, formatMoney(project.budget));
    addDetailItem(grid, words.startDate, project.start_date);
    addDetailItem(grid, words.expectedCompletion, project.expected_end_date);
    content.append(grid);

    const progressTitle = document.createElement("strong");
    progressTitle.textContent =
      `${words.progress}: ${Number(project.progress_percent || 0)}%`;
    content.append(progressTitle);

    const track = document.createElement("div");
    track.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = `${Math.max(
      0,
      Math.min(100, Number(project.progress_percent || 0))
    )}%`;
    track.append(fill);
    content.append(track);

    const description = document.createElement("p");
    description.className = "muted";
    description.textContent = project.description || words.noDescription;
    content.append(description);

    const historyTitle = document.createElement("h3");
    historyTitle.textContent = words.progressHistory;
    content.append(historyTitle);

    const history = data.progress_history || [];

    if (history.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = words.noProgress;
      content.append(empty);
    } else {
      const list = document.createElement("ul");

      for (const update of history) {
        const item = document.createElement("li");
        item.textContent =
          `${update.update_date}: ${update.percent_complete}% — ${update.summary}`;
        list.append(item);
      }

      content.append(list);
    }

    detailsDialog.showModal();
  } catch (error) {
    showPageMessage(error.message, true);
  }
}

projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const projectId = document.getElementById("projectId").value;
  const body = {
    projectCode: document.getElementById("projectCode").value,
    projectName: document.getElementById("projectName").value,
    clientName: document.getElementById("clientName").value,
    location: document.getElementById("projectLocation").value,
    managerId: document.getElementById("managerId").value || null,
    startDate: document.getElementById("startDate").value,
    expectedEndDate: document.getElementById("expectedEndDate").value,
    budget: Number(document.getElementById("projectBudget").value),
    status: document.getElementById("projectStatus").value,
    progressPercent: Number(
      document.getElementById("progressPercent").value
    ),
    description: document.getElementById("projectDescription").value
  };

  const saveButton = document.getElementById("saveProjectButton");
  saveButton.disabled = true;
  saveButton.textContent = words.saving;

  try {
    await apiRequest(
      projectId ? `/api/projects/${projectId}` : "/api/projects",
      {
        method: projectId ? "PATCH" : "POST",
        body: JSON.stringify(body)
      }
    );

    formDialog.close();
    await loadProjects(projectId ? words.updated : words.added);
  } catch (error) {
    formMessage.textContent = error.message;
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = words.save;
  }
});

async function deleteProject(project) {
  const confirmed = window.confirm(
    `${words.confirmDelete} "${project.project_name}"? ${words.linkedRecords}`
  );
  if (!confirmed) return;

  try {
    await apiRequest(`/api/projects/${project.project_id}`, {
      method: "DELETE"
    });
    showPageMessage(words.deleted);
    await loadProjects();
  } catch (error) {
    showPageMessage(error.message, true);
  }
}

document.getElementById("projectSearch").addEventListener("input", () => {
  window.clearTimeout(window.projectSearchTimer);
  window.projectSearchTimer = window.setTimeout(loadProjects, 300);
});

document
  .getElementById("projectStatusFilter")
  .addEventListener("change", loadProjects);

addButton.addEventListener("click", () => openProjectForm());

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.closeDialog).close();
  });
});

document.getElementById("projectLogoutButton").addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "/login.html";
});

if (!token || !role) {
  window.location.href = "/login.html";
} else if (!["admin", "contractor", "worker", "viewer"].includes(role)) {
  sessionStorage.clear();
  window.location.href = "/login.html";
} else {
  document.getElementById("projectUserName").textContent = userName;
  document.getElementById("dashboardLink").href = `/${role}/dashboard.html`;
  addButton.hidden = role !== "contractor";

  const roleDescription = document.getElementById("projectRoleDescription");

  if (role === "contractor") {
    roleDescription.textContent = words.contractorDescription;
  } else if (role === "admin") {
    roleDescription.textContent = words.adminDescription;
  } else if (role === "viewer") {
    roleDescription.textContent = "Browse project details in read-only mode.";
  } else {
    roleDescription.textContent = words.workerDescription;
  }

  loadProjects();
}
