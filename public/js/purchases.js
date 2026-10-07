const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
const language = localStorage.getItem("buildwise-language") || "en";

const purchaseTranslations = {
  en: {
    onlyAllowed: "Only an Admin or Contractor can manage purchases.",
    requestFailed: "The request could not be completed.",
    loadingInfo: "Loading project and catalog information...",
    loadedInfo: "Purchase information loaded.",
    chooseProject: "Choose a project",
    chooseSupplier: "Choose a supplier",
    chooseMaterial: "Choose material",
    material: "Material",
    quantity: "Quantity *",
    unitPrice: "Unit price *",
    remove: "Remove",
    atLeastOne: "A purchase must contain at least one material item.",
    noPurchases: "No purchases have been recorded yet.",
    project: "Project",
    supplier: "Supplier",
    date: "Date",
    invoice: "Invoice",
    status: "Status",
    total: "Total",
    details: "Details",
    view: "View",
    requested: "Requested",
    ordered: "Ordered",
    received: "Received",
    cancelled: "Cancelled",
    purchaseNumber: "Purchase #",
    statusText: "Status:",
    totalText: "Total:",
    unit: "Unit",
    lineTotal: "Line total",
    saved: "Purchase saved successfully.",
    emptyValue: "—"
  },
  kn: {
    onlyAllowed: "ನಿರ್ವಾಹಕರು ಅಥವಾ ಗುತ್ತಿಗೆದಾರರು ಮಾತ್ರ ಖರೀದಿಗಳನ್ನು ನಿರ್ವಹಿಸಬಹುದು.",
    requestFailed: "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    loadingInfo: "ಯೋಜನೆ ಮತ್ತು ಪಟ್ಟಿಯ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    loadedInfo: "ಖರೀದಿ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",
    chooseProject: "ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    chooseSupplier: "ಪೂರೈಕೆದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    chooseMaterial: "ಸಾಮಗ್ರಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    material: "ಸಾಮಗ್ರಿ",
    quantity: "ಪ್ರಮಾಣ *",
    unitPrice: "ಪ್ರತಿ ಘಟಕದ ಬೆಲೆ *",
    remove: "ತೆಗೆದುಹಾಕಿ",
    atLeastOne: "ಖರೀದಿಯಲ್ಲಿ ಕನಿಷ್ಠ ಒಂದು ಸಾಮಗ್ರಿ ಇರಬೇಕು.",
    noPurchases: "ಇನ್ನೂ ಯಾವುದೇ ಖರೀದಿಗಳನ್ನು ದಾಖಲಿಸಿಲ್ಲ.",
    project: "ಯೋಜನೆ",
    supplier: "ಪೂರೈಕೆದಾರರು",
    date: "ದಿನಾಂಕ",
    invoice: "ಸರಕುಪಟ್ಟಿ",
    status: "ಸ್ಥಿತಿ",
    total: "ಒಟ್ಟು",
    details: "ವಿವರಗಳು",
    view: "ವೀಕ್ಷಿಸಿ",
    requested: "ಕೋರಲಾಗಿದೆ",
    ordered: "ಆರ್ಡರ್ ಮಾಡಲಾಗಿದೆ",
    received: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    cancelled: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
    purchaseNumber: "ಖರೀದಿ ಸಂಖ್ಯೆ ",
    statusText: "ಸ್ಥಿತಿ:",
    totalText: "ಒಟ್ಟು:",
    unit: "ಅಳತೆ ಘಟಕ",
    lineTotal: "ಸಾಲಿನ ಒಟ್ಟು",
    saved: "ಖರೀದಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
    emptyValue: "—"
  },
  hi: {
    onlyAllowed: "केवल प्रशासक या ठेकेदार खरीद प्रबंधित कर सकते हैं।",
    requestFailed: "अनुरोध पूरा नहीं हो सका।",
    loadingInfo: "परियोजना और सूची की जानकारी लोड हो रही है...",
    loadedInfo: "खरीद की जानकारी लोड हो गई।",
    chooseProject: "परियोजना चुनें",
    chooseSupplier: "आपूर्तिकर्ता चुनें",
    chooseMaterial: "सामग्री चुनें",
    material: "सामग्री",
    quantity: "मात्रा *",
    unitPrice: "इकाई मूल्य *",
    remove: "हटाएँ",
    atLeastOne: "खरीद में कम से कम एक सामग्री होनी चाहिए।",
    noPurchases: "अभी तक कोई खरीद दर्ज नहीं की गई है।",
    project: "परियोजना",
    supplier: "आपूर्तिकर्ता",
    date: "तारीख",
    invoice: "चालान",
    status: "स्थिति",
    total: "कुल",
    details: "विवरण",
    view: "देखें",
    requested: "अनुरोधित",
    ordered: "ऑर्डर किया गया",
    received: "प्राप्त",
    cancelled: "रद्द",
    purchaseNumber: "खरीद संख्या ",
    statusText: "स्थिति:",
    totalText: "कुल:",
    unit: "इकाई",
    lineTotal: "पंक्ति का कुल",
    saved: "खरीद सफलतापूर्वक सहेजी गई।",
    emptyValue: "—"
  }
};

const words = purchaseTranslations[language] || purchaseTranslations.en;

const messageElement = document.getElementById("purchaseMessage");
const projectSelect = document.getElementById("projectSelect");
const supplierSelect = document.getElementById("supplierSelect");
const purchaseItems = document.getElementById("purchaseItems");
const purchaseTotal = document.getElementById("purchaseTotal");
const purchaseForm = document.getElementById("purchaseForm");
const purchaseList = document.getElementById("purchaseList");
const addItemButton = document.getElementById("addItemButton");
const detailsCard = document.getElementById("purchaseDetailsCard");
const detailsContent = document.getElementById("purchaseDetails");
const dashboardLink = document.getElementById("dashboardLink");

let materials = [];

function showMessage(message, type = "") {
  messageElement.textContent = message;
  messageElement.className = `purchase-message ${type}`;
}

function translateStatus(status) {
  return words[String(status || "").toLowerCase()] || status || words.emptyValue;
}

if (!token) {
  window.location.href = "/login.html";
} else if (!["admin", "contractor"].includes(role)) {
  showMessage(words.onlyAllowed, "error");
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
    const [projectData, supplierData, materialData] = await Promise.all([
      apiRequest("/api/projects"),
      apiRequest("/api/suppliers"),
      apiRequest("/api/materials")
    ]);

    fillProjectDropdown(projectData.projects || []);
    fillSupplierDropdown(supplierData.suppliers || []);
    materials = Array.isArray(materialData.materials)
      ? materialData.materials
      : [];

    addItemRow();
    await loadPurchases();
    showMessage(words.loadedInfo, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function fillProjectDropdown(projects) {
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

function fillSupplierDropdown(suppliers) {
  supplierSelect.replaceChildren(new Option(words.chooseSupplier, ""));

  suppliers.forEach((supplier) => {
    supplierSelect.add(new Option(supplier.supplier_name, supplier.supplier_id));
  });
}

function addItemRow() {
  const row = document.createElement("div");
  row.className = "purchase-item-row";

  const materialField = document.createElement("div");
  const materialLabel = document.createElement("label");
  materialLabel.textContent = `${words.material} *`;

  const materialSelect = document.createElement("select");
  materialSelect.className = "item-material";
  materialSelect.required = true;
  materialSelect.add(new Option(words.chooseMaterial, ""));

  materials.forEach((material) => {
    materialSelect.add(
      new Option(
        `${material.material_name} (${material.unit})`,
        material.material_id
      )
    );
  });

  materialLabel.appendChild(materialSelect);
  materialField.appendChild(materialLabel);

  const quantityField = createNumberField(
    words.quantity,
    "item-quantity",
    "0.01",
    "0.01"
  );
  const priceField = createNumberField(
    words.unitPrice,
    "item-price",
    "0.01",
    "0"
  );

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "secondary";
  removeButton.textContent = words.remove;
  removeButton.addEventListener("click", () => {
    if (purchaseItems.children.length > 1) {
      row.remove();
      updateTotal();
    } else {
      showMessage(words.atLeastOne, "error");
    }
  });

  row.append(materialField, quantityField, priceField, removeButton);
  purchaseItems.appendChild(row);

  row.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("input", updateTotal);
    field.addEventListener("change", updateTotal);
  });

  updateTotal();
}

function createNumberField(labelText, className, step, minimum) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = labelText;

  const input = document.createElement("input");
  input.type = "number";
  input.className = className;
  input.min = minimum;
  input.step = step;
  input.required = true;

  label.appendChild(input);
  wrapper.appendChild(label);
  return wrapper;
}

function updateTotal() {
  let total = 0;

  document.querySelectorAll(".purchase-item-row").forEach((row) => {
    const quantity = Number(row.querySelector(".item-quantity").value) || 0;
    const price = Number(row.querySelector(".item-price").value) || 0;
    total += quantity * price;
  });

  purchaseTotal.textContent = total.toFixed(2);
}

addItemButton.addEventListener("click", addItemRow);

function addTableHeaderRow(table, headings) {
  const header = document.createElement("thead");
  const row = document.createElement("tr");

  headings.forEach((heading) => {
    const cell = document.createElement("th");
    cell.textContent = heading;
    row.appendChild(cell);
  });

  header.appendChild(row);
  table.appendChild(header);
}

function addTableCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value || words.emptyValue;
  row.appendChild(cell);
}

async function loadPurchases() {
  const data = await apiRequest("/api/purchases");
  const purchases = Array.isArray(data.purchases) ? data.purchases : [];

  purchaseList.replaceChildren();

  if (purchases.length === 0) {
    purchaseList.textContent = words.noPurchases;
    return;
  }

  const table = document.createElement("table");
  table.className = "purchase-table";

  addTableHeaderRow(table, [
    words.project,
    words.supplier,
    words.date,
    words.invoice,
    words.status,
    words.total,
    words.details
  ]);

  const body = document.createElement("tbody");

  purchases.forEach((purchase) => {
    const row = document.createElement("tr");

    [
      purchase.project_name,
      purchase.supplier_name,
      purchase.purchase_date,
      purchase.invoice_number || words.emptyValue,
      translateStatus(purchase.status),
      Number(purchase.total_amount).toFixed(2)
    ].forEach((value) => addTableCell(row, value));

    const actionCell = document.createElement("td");
    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.className = "secondary";
    detailsButton.textContent = words.view;
    detailsButton.addEventListener("click", () => {
      showPurchaseDetails(purchase.purchase_id);
    });

    actionCell.appendChild(detailsButton);
    row.appendChild(actionCell);
    body.appendChild(row);
  });

  table.appendChild(body);
  purchaseList.appendChild(table);
}

async function showPurchaseDetails(purchaseId) {
  try {
    const data = await apiRequest(
      `/api/purchases/${encodeURIComponent(purchaseId)}`
    );

    detailsContent.replaceChildren();

    const summary = document.createElement("p");
    summary.textContent =
      `${words.purchaseNumber}${data.purchase.purchase_id}: ` +
      `${data.purchase.project_name} — ${data.purchase.supplier_name}; ` +
      `${words.statusText} ${translateStatus(data.purchase.status)}; ` +
      `${words.totalText} ${Number(data.purchase.total_amount).toFixed(2)}`;
    detailsContent.appendChild(summary);

    const table = document.createElement("table");
    table.className = "purchase-table";

    addTableHeaderRow(table, [
      words.material,
      words.quantity.replace(" *", ""),
      words.unit,
      words.unitPrice.replace(" *", ""),
      words.lineTotal
    ]);

    const body = document.createElement("tbody");

    (data.items || []).forEach((item) => {
      const row = document.createElement("tr");

      [
        item.material_name,
        item.quantity,
        item.unit,
        Number(item.unit_price).toFixed(2),
        Number(item.line_total).toFixed(2)
      ].forEach((value) => addTableCell(row, value));

      body.appendChild(row);
    });

    table.appendChild(body);
    detailsContent.appendChild(table);
    detailsCard.hidden = false;
    detailsCard.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

purchaseForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const items = Array.from(
    document.querySelectorAll(".purchase-item-row")
  ).map((row) => ({
    material_id: Number(row.querySelector(".item-material").value),
    quantity: Number(row.querySelector(".item-quantity").value),
    unit_price: Number(row.querySelector(".item-price").value)
  }));

  const body = {
    project_id: Number(projectSelect.value),
    supplier_id: Number(supplierSelect.value),
    purchase_date: document.getElementById("purchaseDate").value || null,
    invoice_number: document.getElementById("invoiceNumber").value.trim(),
    status: document.getElementById("purchaseStatus").value,
    items
  };

  const saveButton = document.getElementById("savePurchaseButton");
  saveButton.disabled = true;

  try {
    await apiRequest("/api/purchases", {
      method: "POST",
      body: JSON.stringify(body)
    });

    purchaseForm.reset();
    purchaseItems.replaceChildren();
    addItemRow();
    detailsCard.hidden = true;

    await loadPurchases();
    showMessage(words.saved, "success");
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
});