const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
const language = localStorage.getItem("buildwise-language") || "en";

const assignmentTranslations = {
  en: {
    onlyAllowed: "Only an Admin or Contractor can manage project assignments.",
    requestFailed: "The request failed.",
    loadingProjects: "Loading your projects...",
    noProjects: "No projects available",
    chooseProject: "Choose a project",
    chooseProjectForWorkers: "Choose a project to see its Worker assignments.",
    noProjectsForAccount: "No projects are available for this account.",
    chooseProjectFirst: "Choose a project first.",
    loadingAssignments: "Loading Worker assignments...",
    assignmentsLoaded: "Worker assignments loaded.",
    chooseAvailableWorker: "Choose an available Worker",
    noAvailableWorkers: "No available approved Workers",
    noAssignedWorkers: "No Workers are assigned to this project yet.",
    name: "Name",
    phone: "Phone",
    projectRole: "Project work role",
    assignedOn: "Assigned on",
    action: "Action",
    notSpecified: "Not specified",
    remove: "Remove",
    chooseBoth: "Choose a project and an available Worker.",
    assigned: "Worker assigned successfully.",
    confirmRemove: "Remove this Worker from the project?",
    removed: "Worker removed from the project."
  },
  kn: {
    onlyAllowed: "ನಿರ್ವಾಹಕರು ಅಥವಾ ಗುತ್ತಿಗೆದಾರರು ಮಾತ್ರ ಯೋಜನೆಗಳಿಗೆ ಕಾರ್ಮಿಕರನ್ನು ನಿಯೋಜಿಸಬಹುದು.",
    requestFailed: "ವಿನಂತಿ ವಿಫಲವಾಗಿದೆ.",
    loadingProjects: "ನಿಮ್ಮ ಯೋಜನೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    noProjects: "ಯಾವುದೇ ಯೋಜನೆಗಳಿಲ್ಲ",
    chooseProject: "ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    chooseProjectForWorkers: "ಕಾರ್ಮಿಕರ ನಿಯೋಜನೆಗಳನ್ನು ನೋಡಲು ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    noProjectsForAccount: "ಈ ಖಾತೆಗೆ ಯಾವುದೇ ಯೋಜನೆಗಳು ಲಭ್ಯವಿಲ್ಲ.",
    chooseProjectFirst: "ಮೊದಲು ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    loadingAssignments: "ಕಾರ್ಮಿಕರ ನಿಯೋಜನೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    assignmentsLoaded: "ಕಾರ್ಮಿಕರ ನಿಯೋಜನೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",
    chooseAvailableWorker: "ಲಭ್ಯವಿರುವ ಕಾರ್ಮಿಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    noAvailableWorkers: "ಅನುಮೋದಿತ ಕಾರ್ಮಿಕರು ಲಭ್ಯವಿಲ್ಲ",
    noAssignedWorkers: "ಈ ಯೋಜನೆಗೆ ಇನ್ನೂ ಯಾವುದೇ ಕಾರ್ಮಿಕರನ್ನು ನಿಯೋಜಿಸಿಲ್ಲ.",
    name: "ಹೆಸರು",
    phone: "ದೂರವಾಣಿ",
    projectRole: "ಯೋಜನೆಯಲ್ಲಿನ ಕೆಲಸ",
    assignedOn: "ನಿಯೋಜಿಸಿದ ದಿನಾಂಕ",
    action: "ಕ್ರಿಯೆ",
    notSpecified: "ನಿರ್ದಿಷ್ಟಪಡಿಸಿಲ್ಲ",
    remove: "ತೆಗೆದುಹಾಕಿ",
    chooseBoth: "ಯೋಜನೆ ಮತ್ತು ಲಭ್ಯವಿರುವ ಕಾರ್ಮಿಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    assigned: "ಕಾರ್ಮಿಕರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನಿಯೋಜಿಸಲಾಗಿದೆ.",
    confirmRemove: "ಈ ಯೋಜನೆಯಿಂದ ಕಾರ್ಮಿಕರನ್ನು ತೆಗೆದುಹಾಕಬೇಕೆ?",
    removed: "ಯೋಜನೆಯಿಂದ ಕಾರ್ಮಿಕರನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ."
  },
  hi: {
    onlyAllowed: "केवल प्रशासक या ठेकेदार परियोजना नियुक्तियाँ प्रबंधित कर सकते हैं।",
    requestFailed: "अनुरोध विफल हुआ।",
    loadingProjects: "आपकी परियोजनाएँ लोड हो रही हैं...",
    noProjects: "कोई परियोजना उपलब्ध नहीं",
    chooseProject: "परियोजना चुनें",
    chooseProjectForWorkers: "श्रमिक नियुक्तियाँ देखने के लिए परियोजना चुनें।",
    noProjectsForAccount: "इस खाते के लिए कोई परियोजना उपलब्ध नहीं है।",
    chooseProjectFirst: "पहले परियोजना चुनें।",
    loadingAssignments: "श्रमिक नियुक्तियाँ लोड हो रही हैं...",
    assignmentsLoaded: "श्रमिक नियुक्तियाँ लोड हो गईं।",
    chooseAvailableWorker: "उपलब्ध श्रमिक चुनें",
    noAvailableWorkers: "कोई स्वीकृत श्रमिक उपलब्ध नहीं है",
    noAssignedWorkers: "इस परियोजना में अभी कोई श्रमिक नियुक्त नहीं है।",
    name: "नाम",
    phone: "फ़ोन",
    projectRole: "परियोजना में काम",
    assignedOn: "नियुक्ति की तारीख",
    action: "कार्रवाई",
    notSpecified: "निर्दिष्ट नहीं",
    remove: "हटाएँ",
    chooseBoth: "परियोजना और उपलब्ध श्रमिक चुनें।",
    assigned: "श्रमिक सफलतापूर्वक नियुक्त किया गया।",
    confirmRemove: "क्या इस श्रमिक को परियोजना से हटाना चाहते हैं?",
    removed: "श्रमिक को परियोजना से हटा दिया गया।"
  }
};

const words = assignmentTranslations[language] || assignmentTranslations.en;

const pageMessage = document.getElementById("pageMessage");
const projectSelect = document.getElementById("projectSelect");
const loadProjectButton = document.getElementById("loadProjectButton");
const workerSelect = document.getElementById("workerSelect");
const assignForm = document.getElementById("assignForm");
const assignedWorkers = document.getElementById("assignedWorkers");

function showMessage(message, type = "") {
  pageMessage.textContent = message;
  pageMessage.className = `assignment-message ${type}`;
}

if (!token) {
  window.location.href = "/login.html";
} else if (!["admin", "contractor"].includes(role)) {
  showMessage(words.onlyAllowed, "error");
  projectSelect.disabled = true;
  loadProjectButton.disabled = true;
  workerSelect.disabled = true;
  assignForm.querySelector("button[type='submit']").disabled = true;
} else {
  loadProjects();
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

  const responseText = await response.text();
  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data.error = responseText.slice(0, 250);
  }

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${data.error || words.requestFailed}`
    );
  }

  return data;
}

async function loadProjects() {
  try {
    showMessage(words.loadingProjects);
    const data = await apiRequest("/api/projects");
    const projects = Array.isArray(data.projects) ? data.projects : [];

    projectSelect.replaceChildren();

    if (projects.length === 0) {
      projectSelect.add(new Option(words.noProjects, ""));
      projectSelect.disabled = true;
      loadProjectButton.disabled = true;
      showMessage(words.noProjectsForAccount);
      return;
    }

    projectSelect.disabled = false;
    loadProjectButton.disabled = false;
    projectSelect.add(new Option(words.chooseProject, ""));

    projects.forEach((project) => {
      projectSelect.add(
        new Option(
          `${project.project_name} (${project.project_code})`,
          project.project_id
        )
      );
    });

    showMessage(words.chooseProjectForWorkers, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function loadProjectWorkers() {
  const projectId = projectSelect.value;

  if (!projectId) {
    showMessage(words.chooseProjectFirst, "error");
    return;
  }

  try {
    showMessage(words.loadingAssignments);

    await Promise.all([
      loadAvailableWorkers(projectId),
      loadAssignedWorkers(projectId)
    ]);

    showMessage(words.assignmentsLoaded, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function loadAvailableWorkers(projectId) {
  const data = await apiRequest(
    `/api/project-workers/${encodeURIComponent(projectId)}/workers/available`
  );

  workerSelect.replaceChildren();
  workerSelect.add(new Option(words.chooseAvailableWorker, ""));

  const workers = Array.isArray(data.workers) ? data.workers : [];

  workers.forEach((worker) => {
    const label = worker.skill
      ? `${worker.full_name} — ${worker.skill}`
      : worker.full_name;
    workerSelect.add(new Option(label, worker.worker_id));
  });

  workerSelect.disabled = workers.length === 0;

  if (workers.length === 0) {
    workerSelect.replaceChildren();
    workerSelect.add(new Option(words.noAvailableWorkers, ""));
  }
}

function addHeaderCell(row, text) {
  const cell = document.createElement("th");
  cell.textContent = text;
  row.appendChild(cell);
}

function addDataCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value || words.notSpecified;
  row.appendChild(cell);
}

async function loadAssignedWorkers(projectId) {
  const data = await apiRequest(
    `/api/project-workers/${encodeURIComponent(projectId)}/workers`
  );

  const workers = Array.isArray(data.workers) ? data.workers : [];
  assignedWorkers.replaceChildren();

  if (workers.length === 0) {
    assignedWorkers.textContent = words.noAssignedWorkers;
    return;
  }

  const table = document.createElement("table");
  table.className = "assignment-table";

  const header = document.createElement("thead");
  const headerRow = document.createElement("tr");

  [
    words.name,
    words.phone,
    words.projectRole,
    words.assignedOn,
    words.action
  ].forEach((heading) => addHeaderCell(headerRow, heading));

  header.appendChild(headerRow);

  const body = document.createElement("tbody");

  workers.forEach((worker) => {
    const row = document.createElement("tr");

    [
      worker.full_name,
      worker.phone,
      worker.project_job_title,
      worker.assigned_on
    ].forEach((value) => addDataCell(row, value));

    const actionCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "danger";
    removeButton.textContent = words.remove;
    removeButton.addEventListener("click", () => {
      removeWorker(projectId, worker.worker_id);
    });

    actionCell.appendChild(removeButton);
    row.appendChild(actionCell);
    body.appendChild(row);
  });

  table.append(header, body);
  assignedWorkers.appendChild(table);
}

assignForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const projectId = projectSelect.value;
  const workerId = workerSelect.value;

  if (!projectId || !workerId) {
    showMessage(words.chooseBoth, "error");
    return;
  }

  const projectJobTitle = document.getElementById("jobTitle").value.trim();

  try {
    await apiRequest(
      `/api/project-workers/${encodeURIComponent(projectId)}/workers`,
      {
        method: "POST",
        body: JSON.stringify({
          worker_id: Number(workerId),
          project_job_title: projectJobTitle
        })
      }
    );

    assignForm.reset();
    await loadProjectWorkers();
    showMessage(words.assigned, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

async function removeWorker(projectId, workerId) {
  if (!window.confirm(words.confirmRemove)) return;

  try {
    await apiRequest(
      `/api/project-workers/${encodeURIComponent(projectId)}/workers/${encodeURIComponent(workerId)}`,
      { method: "DELETE" }
    );

    await loadProjectWorkers();
    showMessage(words.removed, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

loadProjectButton.addEventListener("click", loadProjectWorkers);

projectSelect.addEventListener("change", () => {
  if (projectSelect.value) loadProjectWorkers();
});