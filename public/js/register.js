const registerForm = document.getElementById("registerForm");
const roleSelect = document.getElementById("role");
const messageElement = document.getElementById("registerMessage");
const registerButton = document.getElementById("registerButton");
const contractorFields = document.getElementById("contractorFields");
const workerFields = document.getElementById("workerFields");
const companyNameInput = document.getElementById("companyName");
const skillInput = document.getElementById("skill");
const experienceInput = document.getElementById("experienceYears");
const simpleViewerRegistration = !new URLSearchParams(window.location.search).has("full");

const registrationTranslations = {
  en: {
    eyebrow: "CONSTRUCTION PROJECT MANAGEMENT",
    title: "Create an account",
    intro: "Create a Registered User account to view the dashboard and project details.",
    accountType: "Account type",
    contractor: "Contractor",
    worker: "Worker",
    fullName: "Full name",
    email: "Email address",
    phone: "Phone",
    address: "Address",
    companyName: "Company name",
    skill: "Skill",
    experience: "Experience (years)",
    password: "Password (at least 12 characters)",
    confirmPassword: "Confirm password",
    register: "Register",
    alreadyHaveAccount: "Already registered?",
    signIn: "Sign in",
    submitting: "Submitting...",
    success: "Registration submitted. An Admin must approve your account before you can sign in.",
    genericError: "Registration could not be completed."
  },
  kn: {
    eyebrow: "ನಿರ್ಮಾಣ ಯೋಜನಾ ನಿರ್ವಹಣೆ",
    title: "ಖಾತೆ ರಚಿಸಿ",
    intro: "ಗುತ್ತಿಗೆದಾರ ಅಥವಾ ಕಾರ್ಮಿಕರಾಗಿ ನೋಂದಾಯಿಸಿ. ಸೈನ್ ಇನ್ ಮಾಡುವ ಮೊದಲು ನಿರ್ವಾಹಕರ ಅನುಮೋದನೆ ಅಗತ್ಯ.",
    accountType: "ಖಾತೆಯ ಪ್ರಕಾರ",
    contractor: "ಗುತ್ತಿಗೆದಾರ",
    worker: "ಕಾರ್ಮಿಕ",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    email: "ಇಮೇಲ್ ವಿಳಾಸ",
    phone: "ದೂರವಾಣಿ",
    address: "ವಿಳಾಸ",
    companyName: "ಕಂಪನಿಯ ಹೆಸರು",
    skill: "ಕೌಶಲ್ಯ",
    experience: "ಅನುಭವ (ವರ್ಷಗಳು)",
    password: "ಪಾಸ್‌ವರ್ಡ್ (ಕನಿಷ್ಠ 12 ಅಕ್ಷರಗಳು)",
    confirmPassword: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    register: "ನೋಂದಣಿ",
    alreadyHaveAccount: "ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಿದ್ದೀರಾ?",
    signIn: "ಸೈನ್ ಇನ್",
    submitting: "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
    success: "ನೋಂದಣಿ ಸಲ್ಲಿಸಲಾಗಿದೆ. ಸೈನ್ ಇನ್ ಮಾಡುವ ಮೊದಲು ನಿರ್ವಾಹಕರು ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಅನುಮೋದಿಸಬೇಕು.",
    genericError: "ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
  },
  hi: {
    eyebrow: "निर्माण परियोजना प्रबंधन",
    title: "खाता बनाएँ",
    intro: "ठेकेदार या श्रमिक के रूप में पंजीकरण करें। साइन इन करने से पहले व्यवस्थापक की मंज़ूरी आवश्यक है।",
    accountType: "खाते का प्रकार",
    contractor: "ठेकेदार",
    worker: "श्रमिक",
    fullName: "पूरा नाम",
    email: "ईमेल पता",
    phone: "फ़ोन",
    address: "पता",
    companyName: "कंपनी का नाम",
    skill: "कौशल",
    experience: "अनुभव (वर्ष)",
    password: "पासवर्ड (कम से कम 12 अक्षर)",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    register: "पंजीकरण करें",
    alreadyHaveAccount: "पहले से पंजीकृत हैं?",
    signIn: "साइन इन",
    submitting: "जमा किया जा रहा है...",
    success: "पंजीकरण जमा हो गया। साइन इन करने से पहले व्यवस्थापक को आपका खाता मंज़ूर करना होगा।",
    genericError: "पंजीकरण पूरा नहीं हो सका।"
  }
};

function getLanguage() {
  try {
    const savedLanguage = localStorage.getItem("buildwise-language");
    return registrationTranslations[savedLanguage] ? savedLanguage : "en";
  } catch {
    return "en";
  }
}

function applyRegistrationLanguage() {
  const language = getLanguage();
  const words = registrationTranslations[language];

  document.documentElement.lang = language;

  document.querySelectorAll("[data-reg-i18n]").forEach((element) => {
    const key = element.dataset.regI18n;
    if (words[key]) element.textContent = words[key];
  });
}

function updateRoleFields() {
  const isViewer = simpleViewerRegistration || roleSelect.value === "viewer";
  if (simpleViewerRegistration) roleSelect.value = "viewer";
  const isContractor = roleSelect.value === "contractor";

  contractorFields.hidden = isViewer || !isContractor;
  workerFields.hidden = isViewer || isContractor;

  companyNameInput.required = isContractor;
  skillInput.required = !isContractor && !isViewer;
  experienceInput.required = !isContractor && !isViewer;

  const toggleField = (input, visible) => {
    input.hidden = !visible;
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) label.hidden = !visible;
  };
  toggleField(document.getElementById("phone"), !isViewer);
  toggleField(document.getElementById("address"), !isViewer);
  toggleField(document.getElementById("confirmPassword"), !isViewer);
  document.getElementById("phone").required = !isViewer;
  document.getElementById("address").required = !isViewer;
  roleSelect.hidden = simpleViewerRegistration;
  const roleLabel = document.querySelector('label[for="role"]');
  if (roleLabel) roleLabel.hidden = simpleViewerRegistration;
  document.querySelector('a[href="/register.html?full=1"]').hidden = !simpleViewerRegistration;
}

roleSelect.addEventListener("change", updateRoleFields);

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const role = roleSelect.value;
  const words = registrationTranslations[getLanguage()];

  const body = {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    password: document.getElementById("password").value,
    confirmPassword: role === "viewer"
      ? document.getElementById("password").value
      : document.getElementById("confirmPassword").value
  };

  if (role === "contractor") {
    body.companyName = companyNameInput.value.trim();
  } else if (role === "worker") {
    body.skill = skillInput.value.trim();
    body.experienceYears = Number(experienceInput.value);
  }

  registerButton.disabled = true;
  registerButton.textContent = words.submitting;
  messageElement.textContent = "";

  try {
    const response = await fetch(`/api/${role}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || words.genericError);
    }

    messageElement.textContent = role === "viewer"
      ? "Registered User account created. You can now sign in and view projects."
      : words.success;
    registerForm.reset();
    roleSelect.value = "viewer";
    updateRoleFields();
  } catch (error) {
    messageElement.textContent = error.message;
  } finally {
    registerButton.disabled = false;
    registerButton.textContent =
      registrationTranslations[getLanguage()].register;
  }
});

updateRoleFields();
applyRegistrationLanguage();
