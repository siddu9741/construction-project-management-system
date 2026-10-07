const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
const language = localStorage.getItem("buildwise-language") || "en";

const supplierTranslations = {
  en: {
    onlyAllowed: "Only an Admin or Contractor can view suppliers.",
    noSuppliers: "No suppliers have been added yet.",
    loaded: "suppliers loaded.",
    couldNotLoad: "Could not load suppliers.",
    supplier: "Supplier",
    contact: "Contact person",
    phone: "Phone",
    email: "Email",
    address: "Address",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    editSupplier: "Edit supplier",
    addSupplier: "Add a supplier",
    saveChanges: "Save Changes",
    saveSupplier: "Save Supplier",
    emptyValue: "—",
    saveSuccess: "Supplier saved successfully.",
    deleteSuccess: "Supplier deleted successfully.",
    confirmDelete: "Delete supplier",
    requestFailed: "The request could not be completed."
  },
  kn: {
    onlyAllowed: "ನಿರ್ವಾಹಕರು ಅಥವಾ ಗುತ್ತಿಗೆದಾರರು ಮಾತ್ರ ಪೂರೈಕೆದಾರರನ್ನು ವೀಕ್ಷಿಸಬಹುದು.",
    noSuppliers: "ಇನ್ನೂ ಯಾವುದೇ ಪೂರೈಕೆದಾರರನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ.",
    loaded: "ಪೂರೈಕೆದಾರರನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",
    couldNotLoad: "ಪೂರೈಕೆದಾರರನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    supplier: "ಪೂರೈಕೆದಾರರು",
    contact: "ಸಂಪರ್ಕ ವ್ಯಕ್ತಿ",
    phone: "ದೂರವಾಣಿ",
    email: "ಇಮೇಲ್",
    address: "ವಿಳಾಸ",
    actions: "ಕ್ರಿಯೆಗಳು",
    edit: "ತಿದ್ದುಪಡಿ",
    delete: "ಅಳಿಸಿ",
    editSupplier: "ಪೂರೈಕೆದಾರರ ವಿವರ ತಿದ್ದುಪಡಿ",
    addSupplier: "ಪೂರೈಕೆದಾರರನ್ನು ಸೇರಿಸಿ",
    saveChanges: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
    saveSupplier: "ಪೂರೈಕೆದಾರರನ್ನು ಉಳಿಸಿ",
    emptyValue: "—",
    saveSuccess: "ಪೂರೈಕೆದಾರರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
    deleteSuccess: "ಪೂರೈಕೆದಾರರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ.",
    confirmDelete: "ಈ ಪೂರೈಕೆದಾರರನ್ನು ಅಳಿಸಬೇಕೆ",
    requestFailed: "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
  },
  hi: {
    onlyAllowed: "केवल प्रशासक या ठेकेदार आपूर्तिकर्ताओं को देख सकते हैं।",
    noSuppliers: "अभी तक कोई आपूर्तिकर्ता नहीं जोड़ा गया है।",
    loaded: "आपूर्तिकर्ता लोड हुए।",
    couldNotLoad: "आपूर्तिकर्ता लोड नहीं हो सके।",
    supplier: "आपूर्तिकर्ता",
    contact: "संपर्क व्यक्ति",
    phone: "फ़ोन",
    email: "ईमेल",
    address: "पता",
    actions: "कार्रवाई",
    edit: "बदलें",
    delete: "हटाएँ",
    editSupplier: "आपूर्तिकर्ता बदलें",
    addSupplier: "आपूर्तिकर्ता जोड़ें",
    saveChanges: "बदलाव सहेजें",
    saveSupplier: "आपूर्तिकर्ता सहेजें",
    emptyValue: "—",
    saveSuccess: "आपूर्तिकर्ता सफलतापूर्वक सहेजा गया।",
    deleteSuccess: "आपूर्तिकर्ता सफलतापूर्वक हटाया गया।",
    confirmDelete: "इस आपूर्तिकर्ता को हटाएँ",
    requestFailed: "अनुरोध पूरा नहीं हो सका।"
  }
};

const words = supplierTranslations[language] || supplierTranslations.en;

const messageElement = document.getElementById("supplierMessage");
const supplierList = document.getElementById("supplierList");
const supplierFormCard = document.getElementById("supplierFormCard");
const supplierForm = document.getElementById("supplierForm");
const formHeading = document.getElementById("formHeading");
const saveButton = document.getElementById("saveSupplierButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const dashboardLink = document.getElementById("dashboardLink");

let editingSupplierId = null;

function showMessage(message, type = "") {
  messageElement.textContent = message;
  messageElement.className = `supplier-message ${type}`;
}

if (!token) {
  window.location.href = "/login.html";
} else if (!["admin", "contractor"].includes(role)) {
  showMessage(words.onlyAllowed, "error");
} else {
  // Contractors can add suppliers; only Admins can edit or delete catalog entries.
  supplierFormCard.hidden = false;
  if (role === "admin") {
    dashboardLink.href = "/admin/dashboard.html";
  } else {
    dashboardLink.href = "/contractor/dashboard.html";
  }

  loadSuppliers();
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

async function loadSuppliers(successMessage = "") {
  try {
    const data = await apiRequest("/api/suppliers");
    const suppliers = Array.isArray(data.suppliers) ? data.suppliers : [];

    supplierList.replaceChildren();

    if (suppliers.length === 0) {
      supplierList.textContent = words.noSuppliers;
    } else {
      renderSupplierTable(suppliers);
    }

    showMessage(
      successMessage || `${suppliers.length} ${words.loaded}`,
      "success"
    );
  } catch (error) {
    showMessage(error.message, "error");
    supplierList.textContent = words.couldNotLoad;
  }
}

function createTableCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value || words.emptyValue;
  return cell;
}

function renderSupplierTable(suppliers) {
  const table = document.createElement("table");
  table.className = "supplier-table";

  const headings = [
    words.supplier,
    words.contact,
    words.phone,
    words.email,
    words.address
  ];

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

  suppliers.forEach((supplier) => {
    const row = document.createElement("tr");

    [
      supplier.supplier_name,
      supplier.contact_person,
      supplier.phone,
      supplier.email,
      supplier.address
    ].forEach((value) => {
      row.appendChild(createTableCell(value));
    });

    if (role === "admin") {
      const actions = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "secondary";
      editButton.textContent = words.edit;
      editButton.addEventListener("click", () => startEditing(supplier));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger";
      deleteButton.textContent = words.delete;
      deleteButton.addEventListener("click", () => deleteSupplier(supplier));

      actions.append(editButton, document.createTextNode(" "), deleteButton);
      row.appendChild(actions);
    }

    body.appendChild(row);
  });

  table.append(header, body);
  supplierList.appendChild(table);
}

function startEditing(supplier) {
  editingSupplierId = supplier.supplier_id;
  formHeading.textContent = words.editSupplier;
  saveButton.textContent = words.saveChanges;
  cancelEditButton.hidden = false;

  document.getElementById("supplierName").value = supplier.supplier_name || "";
  document.getElementById("contactPerson").value =
    supplier.contact_person || "";
  document.getElementById("supplierPhone").value = supplier.phone || "";
  document.getElementById("supplierEmail").value = supplier.email || "";
  document.getElementById("supplierAddress").value = supplier.address || "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetSupplierForm() {
  editingSupplierId = null;
  supplierForm.reset();
  formHeading.textContent = words.addSupplier;
  saveButton.textContent = words.saveSupplier;
  cancelEditButton.hidden = true;
}

cancelEditButton.addEventListener("click", resetSupplierForm);

supplierForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const supplier = {
    supplier_name: document.getElementById("supplierName").value.trim(),
    contact_person: document.getElementById("contactPerson").value.trim(),
    phone: document.getElementById("supplierPhone").value.trim(),
    email: document.getElementById("supplierEmail").value.trim(),
    address: document.getElementById("supplierAddress").value.trim()
  };

  const isEditing = editingSupplierId !== null;
  const url = isEditing
    ? `/api/suppliers/${encodeURIComponent(editingSupplierId)}`
    : "/api/suppliers";

  try {
    await apiRequest(url, {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(supplier)
    });

    resetSupplierForm();
    await loadSuppliers(words.saveSuccess);
  } catch (error) {
    showMessage(error.message, "error");
  }
});

async function deleteSupplier(supplier) {
  const confirmed = window.confirm(
    `${words.confirmDelete} "${supplier.supplier_name}"?`
  );

  if (!confirmed) return;

  try {
    await apiRequest(
      `/api/suppliers/${encodeURIComponent(supplier.supplier_id)}`,
      { method: "DELETE" }
    );

    await loadSuppliers(words.deleteSuccess);
  } catch (error) {
    showMessage(error.message, "error");
  }
}
