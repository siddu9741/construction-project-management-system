const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
const language = localStorage.getItem("buildwise-language") || "en";

const paymentTranslations = {
  en: {
    onlyAllowed: "Only an Admin or Contractor can view project payments.",
    requestFailed: "The request could not be completed.",
    loading: "Loading projects and payments...",
    chooseProject: "Choose a project",
    loaded: "Payment information loaded.",
    cannotLoad: "Could not load project payments.",
    noPayments: "No project payments have been recorded yet.",
    date: "Date",
    project: "Project",
    contract: "Contract",
    projectLevel: "Project-level",
    method: "Method",
    reference: "Reference",
    status: "Status",
    amount: "Amount",
    adminActions: "Admin actions",
    markPaid: "Mark paid",
    cancel: "Cancel",
    pending: "Pending",
    paid: "Paid",
    cancelled: "Cancelled",
    bankTransfer: "Bank transfer",
    upi: "UPI",
    cheque: "Cheque",
    cash: "Cash",
    other: "Other",
    saved: "Payment saved successfully.",
    updated: "Payment status updated successfully.",
    confirmPaid: "Are you sure you want to mark this payment as paid?",
    confirmCancel: "Are you sure you want to cancel this payment?",
    emptyValue: "—"
  },
  kn: {
    onlyAllowed: "ನಿರ್ವಾಹಕರು ಅಥವಾ ಗುತ್ತಿಗೆದಾರರು ಮಾತ್ರ ಯೋಜನಾ ಪಾವತಿಗಳನ್ನು ವೀಕ್ಷಿಸಬಹುದು.",
    requestFailed: "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    loading: "ಯೋಜನೆಗಳು ಮತ್ತು ಪಾವತಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    chooseProject: "ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    loaded: "ಪಾವತಿ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",
    cannotLoad: "ಯೋಜನಾ ಪಾವತಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    noPayments: "ಇನ್ನೂ ಯಾವುದೇ ಯೋಜನಾ ಪಾವತಿಗಳನ್ನು ದಾಖಲಿಸಿಲ್ಲ.",
    date: "ದಿನಾಂಕ",
    project: "ಯೋಜನೆ",
    contract: "ಒಪ್ಪಂದ",
    projectLevel: "ಯೋಜನೆ ಮಟ್ಟದ",
    method: "ವಿಧಾನ",
    reference: "ಉಲ್ಲೇಖ",
    status: "ಸ್ಥಿತಿ",
    amount: "ಮೊತ್ತ",
    adminActions: "ನಿರ್ವಾಹಕರ ಕ್ರಿಯೆಗಳು",
    markPaid: "ಪಾವತಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    pending: "ಬಾಕಿಯಿದೆ",
    paid: "ಪಾವತಿಸಲಾಗಿದೆ",
    cancelled: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
    bankTransfer: "ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ",
    upi: "UPI",
    cheque: "ಚೆಕ್",
    cash: "ನಗದು",
    other: "ಇತರೆ",
    saved: "ಪಾವತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
    updated: "ಪಾವತಿಯ ಸ್ಥಿತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
    confirmPaid: "ಈ ಪಾವತಿಯನ್ನು ಪಾವತಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಬೇಕೆ?",
    confirmCancel: "ಈ ಪಾವತಿಯನ್ನು ರದ್ದುಮಾಡಬೇಕೆ?",
    emptyValue: "—"
  },
  hi: {
    onlyAllowed: "केवल प्रशासक या ठेकेदार परियोजना भुगतान देख सकते हैं।",
    requestFailed: "अनुरोध पूरा नहीं हो सका।",
    loading: "परियोजनाएँ और भुगतान लोड हो रहे हैं...",
    chooseProject: "परियोजना चुनें",
    loaded: "भुगतान की जानकारी लोड हो गई।",
    cannotLoad: "परियोजना भुगतान लोड नहीं हो सके।",
    noPayments: "अभी तक कोई परियोजना भुगतान दर्ज नहीं किया गया है।",
    date: "तारीख",
    project: "परियोजना",
    contract: "अनुबंध",
    projectLevel: "परियोजना स्तर",
    method: "तरीका",
    reference: "संदर्भ",
    status: "स्थिति",
    amount: "राशि",
    adminActions: "प्रशासक की कार्रवाई",
    markPaid: "भुगतान हुआ चिह्नित करें",
    cancel: "रद्द करें",
    pending: "लंबित",
    paid: "भुगतान हो गया",
    cancelled: "रद्द",
    bankTransfer: "बैंक ट्रांसफर",
    upi: "UPI",
    cheque: "चेक",
    cash: "नकद",
    other: "अन्य",
    saved: "भुगतान सफलतापूर्वक सहेजा गया।",
    updated: "भुगतान की स्थिति सफलतापूर्वक बदली गई।",
    confirmPaid: "क्या आप इस भुगतान को भुगतान हुआ चिह्नित करना चाहते हैं?",
    confirmCancel: "क्या आप इस भुगतान को रद्द करना चाहते हैं?",
    emptyValue: "—"
  }
};

const words = paymentTranslations[language] || paymentTranslations.en;

const messageElement = document.getElementById("paymentMessage");
const paymentFormCard = document.getElementById("paymentFormCard");
const paymentForm = document.getElementById("paymentForm");
const projectSelect = document.getElementById("projectSelect");
const paymentList = document.getElementById("paymentList");
const saveButton = document.getElementById("savePaymentButton");
const dashboardLink = document.getElementById("dashboardLink");

function showMessage(message, type = "") {
  messageElement.textContent = message;
  messageElement.className = `payment-message ${type}`;
}

function translatedStatus(status) {
  const key = String(status || "").toLowerCase();
  return words[key] || status || words.emptyValue;
}

function translatedMethod(method) {
  if (!method) return words.emptyValue;
  const normalized = method.toLowerCase();

  if (normalized === "bank transfer") return words.bankTransfer;
  if (normalized === "upi") return words.upi;
  if (normalized === "cheque") return words.cheque;
  if (normalized === "cash") return words.cash;
  if (normalized === "other") return words.other;

  return method;
}

if (!token) {
  window.location.href = "/login.html";
} else if (!["admin", "contractor"].includes(role)) {
  showMessage(words.onlyAllowed, "error");
} else {
  if (role === "admin") {
    paymentFormCard.hidden = false;
    dashboardLink.href = "/admin/dashboard.html";
  } else {
    dashboardLink.href = "/contractor/dashboard.html";
  }

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
    showMessage(words.loading);

    const [projectData, paymentData] = await Promise.all([
      apiRequest("/api/projects"),
      apiRequest("/api/payments")
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

    renderPayments(paymentData.payments || []);
    showMessage(words.loaded, "success");
  } catch (error) {
    showMessage(error.message, "error");
    paymentList.textContent = words.cannotLoad;
  }
}

function addHeaderCell(row, value) {
  const cell = document.createElement("th");
  cell.textContent = value;
  row.appendChild(cell);
}

function addDataCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value || words.emptyValue;
  row.appendChild(cell);
}

function renderPayments(payments) {
  paymentList.replaceChildren();

  if (payments.length === 0) {
    paymentList.textContent = words.noPayments;
    return;
  }

  const table = document.createElement("table");
  table.className = "payment-table";

  const header = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const headings = [
    words.date,
    words.project,
    words.contract,
    words.method,
    words.reference,
    words.status,
    words.amount
  ];

  if (role === "admin") {
    headings.push(words.adminActions);
  }

  headings.forEach((heading) => addHeaderCell(headerRow, heading));
  header.appendChild(headerRow);

  const body = document.createElement("tbody");

  payments.forEach((payment) => {
    const row = document.createElement("tr");

    [
      payment.payment_date,
      `${payment.project_name} (${payment.project_code})`,
      payment.contract_number || words.projectLevel,
      translatedMethod(payment.payment_method),
      payment.reference_number || words.emptyValue,
      translatedStatus(payment.status),
      Number(payment.amount).toFixed(2)
    ].forEach((value) => addDataCell(row, value));

    if (role === "admin") {
      const actionCell = document.createElement("td");

      if (payment.status !== "cancelled") {
        if (payment.status !== "paid") {
          const paidButton = document.createElement("button");
          paidButton.type = "button";
          paidButton.textContent = words.markPaid;
          paidButton.addEventListener("click", () => {
            updatePaymentStatus(payment.payment_id, "paid");
          });
          actionCell.appendChild(paidButton);
        }

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "secondary";
        cancelButton.textContent = words.cancel;
        cancelButton.addEventListener("click", () => {
          updatePaymentStatus(payment.payment_id, "cancelled");
        });
        actionCell.appendChild(cancelButton);
      } else {
        actionCell.textContent = words.emptyValue;
      }

      row.appendChild(actionCell);
    }

    body.appendChild(row);
  });

  table.append(header, body);
  paymentList.appendChild(table);
}

paymentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    project_id: Number(projectSelect.value),
    payment_date: document.getElementById("paymentDate").value || null,
    amount: Number(document.getElementById("paymentAmount").value),
    payment_method: document.getElementById("paymentMethod").value,
    reference_number: document.getElementById("referenceNumber").value.trim(),
    status: document.getElementById("paymentStatus").value
  };

  saveButton.disabled = true;

  try {
    const result = await apiRequest("/api/payments", {
      method: "POST",
      body: JSON.stringify(body)
    });

    paymentForm.reset();
    await reloadPayments();

    showMessage(
      `${words.saved} #${result.payment_id}; ${words.amount.toLowerCase()}: ${Number(
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

async function updatePaymentStatus(paymentId, status) {
  const confirmation =
    status === "paid" ? words.confirmPaid : words.confirmCancel;

  if (!window.confirm(confirmation)) return;

  try {
    await apiRequest(
      `/api/payments/${encodeURIComponent(paymentId)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status })
      }
    );

    await reloadPayments();
    showMessage(words.updated, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function reloadPayments() {
  const data = await apiRequest("/api/payments");
  renderPayments(data.payments || []);
}