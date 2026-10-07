const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
const language = localStorage.getItem("buildwise-language") || "en";

const materialTranslations = {
  en: {
    onlyAllowed: "Only an Admin or Contractor can view materials.",
    noMaterials: "No materials have been added yet.",
    loaded: "materials loaded.",
    couldNotLoad: "Could not load materials.",
    material: "Material",
    unit: "Unit",
    description: "Description",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    editMaterial: "Edit material",
    addMaterial: "Add a material",
    saveChanges: "Save Changes",
    saveMaterial: "Save Material",
    emptyValue: "—",
    saveSuccess: "Material saved successfully.",
    deleteSuccess: "Material deleted successfully.",
    confirmDelete: "Delete material",
    requestFailed: "The request could not be completed."
  },
  kn: {
    onlyAllowed: "ನಿರ್ವಾಹಕರು ಅಥವಾ ಗುತ್ತಿಗೆದಾರರು ಮಾತ್ರ ಸಾಮಗ್ರಿಗಳನ್ನು ವೀಕ್ಷಿಸಬಹುದು.",
    noMaterials: "ಇನ್ನೂ ಯಾವುದೇ ಸಾಮಗ್ರಿಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ.",
    loaded: "ಸಾಮಗ್ರಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",
    couldNotLoad: "ಸಾಮಗ್ರಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    material: "ಸಾಮಗ್ರಿ",
    unit: "ಅಳತೆ ಘಟಕ",
    description: "ವಿವರಣೆ",
    actions: "ಕ್ರಿಯೆಗಳು",
    edit: "ತಿದ್ದುಪಡಿ",
    delete: "ಅಳಿಸಿ",
    editMaterial: "ಸಾಮಗ್ರಿ ತಿದ್ದುಪಡಿ",
    addMaterial: "ಸಾಮಗ್ರಿ ಸೇರಿಸಿ",
    saveChanges: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
    saveMaterial: "ಸಾಮಗ್ರಿ ಉಳಿಸಿ",
    emptyValue: "—",
    saveSuccess: "ಸಾಮಗ್ರಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
    deleteSuccess: "ಸಾಮಗ್ರಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ.",
    confirmDelete: "ಈ ಸಾಮಗ್ರಿಯನ್ನು ಅಳಿಸಬೇಕೆ",
    requestFailed: "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
  },
  hi: {
    onlyAllowed: "केवल प्रशासक या ठेकेदार सामग्री देख सकते हैं।",
    noMaterials: "अभी तक कोई सामग्री नहीं जोड़ी गई है।",
    loaded: "सामग्री लोड हुई।",
    couldNotLoad: "सामग्री लोड नहीं हो सकी।",
    material: "सामग्री",
    unit: "इकाई",
    description: "विवरण",
    actions: "कार्रवाई",
    edit: "बदलें",
    delete: "हटाएँ",
    editMaterial: "सामग्री बदलें",
    addMaterial: "सामग्री जोड़ें",
    saveChanges: "बदलाव सहेजें",
    saveMaterial: "सामग्री सहेजें",
    emptyValue: "—",
    saveSuccess: "सामग्री सफलतापूर्वक सहेजी गई।",
    deleteSuccess: "सामग्री सफलतापूर्वक हटाई गई।",
    confirmDelete: "इस सामग्री को हटाएँ",
    requestFailed: "अनुरोध पूरा नहीं हो सका।"
  }
};

const words = materialTranslations[language] || materialTranslations.en;

const messageElement = document.getElementById("materialMessage");
const materialList = document.getElementById("materialList");
const materialFormCard = document.getElementById("materialFormCard");
const materialForm = document.getElementById("materialForm");
const formHeading = document.getElementById("formHeading");
const saveButton = document.getElementById("saveMaterialButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const dashboardLink = document.getElementById("dashboardLink");

let editingMaterialId = null;

function showMessage(message, type = "") {
  messageElement.textContent = message;
  messageElement.className = `material-message ${type}`;
}

if (!token) {
  window.location.href = "/login.html";
} else if (!["admin", "contractor"].includes(role)) {
  showMessage(words.onlyAllowed, "error");
} else {
  if (role === "admin") {
    materialFormCard.hidden = false;
    dashboardLink.href = "/admin/dashboard.html";
  } else {
    dashboardLink.href = "/contractor/dashboard.html";
  }

  loadMaterials();
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

async function loadMaterials(successMessage = "") {
  try {
    const data = await apiRequest("/api/materials");
    const materials = Array.isArray(data.materials) ? data.materials : [];

    materialList.replaceChildren();

    if (materials.length === 0) {
      materialList.textContent = words.noMaterials;
    } else {
      renderMaterialTable(materials);
    }

    showMessage(
      successMessage || `${materials.length} ${words.loaded}`,
      "success"
    );
  } catch (error) {
    showMessage(error.message, "error");
    materialList.textContent = words.couldNotLoad;
  }
}

function createTableCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value || words.emptyValue;
  return cell;
}

function renderMaterialTable(materials) {
  const table = document.createElement("table");
  table.className = "material-table";

  const headings = [words.material, words.unit, words.description];

  if (role === "admin") {
    headings.push(words.actions);
  }

  const header = document.createElement("thead");
  const headerRow = document.createElement("tr");

  headings.forEach((heading) => {
    const cell = document.createElement("th");
    cell.textContent = heading;
    headerRow.appendChild(cell);
  });

  header.appendChild(headerRow);

  const body = document.createElement("tbody");

  materials.forEach((material) => {
    const row = document.createElement("tr");

    [
      material.material_name,
      material.unit,
      material.description
    ].forEach((value) => {
      row.appendChild(createTableCell(value));
    });

    if (role === "admin") {
      const actions = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "secondary";
      editButton.textContent = words.edit;
      editButton.addEventListener("click", () => startEditing(material));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger";
      deleteButton.textContent = words.delete;
      deleteButton.addEventListener("click", () => deleteMaterial(material));

      actions.append(editButton, document.createTextNode(" "), deleteButton);
      row.appendChild(actions);
    }

    body.appendChild(row);
  });

  table.append(header, body);
  materialList.appendChild(table);
}

function startEditing(material) {
  editingMaterialId = material.material_id;
  formHeading.textContent = words.editMaterial;
  saveButton.textContent = words.saveChanges;
  cancelEditButton.hidden = false;

  document.getElementById("materialName").value =
    material.material_name || "";
  document.getElementById("materialUnit").value = material.unit || "";
  document.getElementById("materialDescription").value =
    material.description || "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetMaterialForm() {
  editingMaterialId = null;
  materialForm.reset();
  formHeading.textContent = words.addMaterial;
  saveButton.textContent = words.saveMaterial;
  cancelEditButton.hidden = true;
}

cancelEditButton.addEventListener("click", resetMaterialForm);

materialForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const material = {
    material_name: document.getElementById("materialName").value.trim(),
    unit: document.getElementById("materialUnit").value.trim(),
    description: document.getElementById("materialDescription").value.trim()
  };

  const isEditing = editingMaterialId !== null;
  const url = isEditing
    ? `/api/materials/${encodeURIComponent(editingMaterialId)}`
    : "/api/materials";

  try {
    await apiRequest(url, {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(material)
    });

    resetMaterialForm();
    await loadMaterials(words.saveSuccess);
  } catch (error) {
    showMessage(error.message, "error");
  }
});

async function deleteMaterial(material) {
  const confirmed = window.confirm(
    `${words.confirmDelete} "${material.material_name}"?`
  );

  if (!confirmed) return;

  try {
    await apiRequest(
      `/api/materials/${encodeURIComponent(material.material_id)}`,
      { method: "DELETE" }
    );

    await loadMaterials(words.deleteSuccess);
  } catch (error) {
    showMessage(error.message, "error");
  }
}