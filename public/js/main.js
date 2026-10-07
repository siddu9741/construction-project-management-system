// Text shown by the language selector. Login and registration remain placeholders.
const translations = {
  en: {
    navHome: "Home", navAbout: "About", navFeatures: "Features", navLogin: "Login", navRegister: "Register",
    eyebrow: "BUILT FOR THE PEOPLE WHO BUILD",
    heroTitle: 'Bring every project<br>piece <span>together.</span>',
    heroDescription: "One clear view of your sites, teams, materials and progress. Keep the work moving with less chasing and more confidence.",
    heroPrimary: "Explore the platform", heroSecondary: "See how it works",
    proofTitle: "One team. One source of truth.", proofCopy: "Designed for the realities of the jobsite.",
    visualTag: "PROJECT OVERVIEW", progressLabel: "SITE PROGRESS", progressNote: "On track this week",
    materialTitle: "Materials", materialNote: "Delivery scheduled", visualCaption: "A clearer view of the work",
    trustIntro: "THE DETAILS THAT KEEP A SITE MOVING", trustOne: "People aligned", trustTwo: "Materials visible", trustThree: "Progress understood",
    aboutEyebrow: "A BETTER WAY TO BUILD", aboutTitle: 'Great work needs a<br><span>clear plan.</span>',
    aboutText: "Construction brings people, timelines, suppliers and budgets together. Buildwise gives your team a shared place to keep those moving parts organized—so everyone can focus on what is taking shape.",
    aboutLink: "A closer look at the platform", featureEyebrow: "ONE CONNECTED WORKSPACE",
    featureTitle: 'From first plan to<br><span>final handover.</span>',
    featureIntro: "The essentials for keeping your project, people and resources in sync.",
    cardOneTitle: "Projects, at a glance", cardOneCopy: "See project status, key dates, teams and progress in one organized view.",
    cardTwoTitle: "A team that stays aligned", cardTwoCopy: "Keep contractor, manager and worker assignments easy to understand.",
    cardThreeTitle: "Materials in view", cardThreeCopy: "Organize suppliers, material needs and purchase records by project.",
    cardFourTitle: "Progress you can follow", cardFourCopy: "Record updates and attendance to make day-to-day work visible.",
    ctaEyebrow: "YOUR NEXT PROJECT STARTS HERE", ctaTitle: 'Let’s make the work<br><span>work better.</span>',
    ctaCopy: "Login and registration will be added in a later development step.", ctaButton: "Back to the top",
    footerCopy: "Built around the people, plans and progress behind every project.",
    footerNote: "A construction project management concept", footerLocation: "Made for teams on the ground"
  },
  kn: {
    navHome: "ಮುಖಪುಟ", navAbout: "ನಮ್ಮ ಬಗ್ಗೆ", navFeatures: "ವೈಶಿಷ್ಟ್ಯಗಳು", navLogin: "ಲಾಗಿನ್", navRegister: "ನೋಂದಣಿ",
    eyebrow: "ನಿರ್ಮಾಣ ಮಾಡುವವರಿಗಾಗಿ ರೂಪಿಸಲಾಗಿದೆ",
    heroTitle: 'ಪ್ರತಿ ಯೋಜನೆಯ<br>ಅಂಶಗಳನ್ನು <span>ಒಟ್ಟುಗೂಡಿಸಿ.</span>',
    heroDescription: "ನಿಮ್ಮ ನಿರ್ಮಾಣ ಸ್ಥಳಗಳು, ತಂಡಗಳು, ಸಾಮಗ್ರಿಗಳು ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ಒಂದೇ ಸ್ಪಷ್ಟ ನೋಟದಲ್ಲಿ ನೋಡಿ. ಕಡಿಮೆ ಗೊಂದಲದೊಂದಿಗೆ ಕೆಲಸವನ್ನು ಮುಂದುವರಿಸಿ.",
    heroPrimary: "ವೇದಿಕೆಯನ್ನು ವೀಕ್ಷಿಸಿ", heroSecondary: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    proofTitle: "ಒಂದು ತಂಡ. ಒಂದೇ ವಿಶ್ವಾಸಾರ್ಹ ಮಾಹಿತಿ.", proofCopy: "ನಿರ್ಮಾಣ ಸ್ಥಳದ ನೈಜ ಅಗತ್ಯಗಳಿಗಾಗಿ ರೂಪಿಸಲಾಗಿದೆ.",
    visualTag: "ಯೋಜನೆಯ ಅವಲೋಕನ", progressLabel: "ಸ್ಥಳದ ಪ್ರಗತಿ", progressNote: "ಈ ವಾರದ ಕೆಲಸ ಯೋಜನೆಯಂತೆ ಇದೆ",
    materialTitle: "ಸಾಮಗ್ರಿಗಳು", materialNote: "ವಿತರಣೆಯನ್ನು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ", visualCaption: "ಕೆಲಸದ ಸ್ಪಷ್ಟ ನೋಟ",
    trustIntro: "ನಿರ್ಮಾಣ ಸ್ಥಳದ ಕೆಲಸವನ್ನು ಮುಂದುವರಿಸುವ ಅಂಶಗಳು", trustOne: "ತಂಡದ ಹೊಂದಾಣಿಕೆ", trustTwo: "ಸಾಮಗ್ರಿಗಳ ಮಾಹಿತಿ", trustThree: "ಪ್ರಗತಿಯ ಸ್ಪಷ್ಟತೆ",
    aboutEyebrow: "ನಿರ್ಮಾಣಕ್ಕೆ ಉತ್ತಮ ವಿಧಾನ", aboutTitle: 'ಉತ್ತಮ ಕೆಲಸಕ್ಕೆ<br><span>ಸ್ಪಷ್ಟ ಯೋಜನೆ.</span>',
    aboutText: "ನಿರ್ಮಾಣದಲ್ಲಿ ಜನರು, ವೇಳಾಪಟ್ಟಿಗಳು, ಪೂರೈಕೆದಾರರು ಮತ್ತು ಬಜೆಟ್‌ಗಳು ಒಟ್ಟಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತವೆ. Buildwise ನಿಮ್ಮ ತಂಡಕ್ಕೆ ಈ ಎಲ್ಲವನ್ನು ವ್ಯವಸ್ಥಿತವಾಗಿ ನಿರ್ವಹಿಸಲು ಒಂದೇ ಸ್ಥಳ ಒದಗಿಸುತ್ತದೆ.",
    aboutLink: "ವೇದಿಕೆಯ ಕುರಿತು ಇನ್ನಷ್ಟು", featureEyebrow: "ಒಂದೇ ಸಂಪರ್ಕಿತ ಕಾರ್ಯಸ್ಥಳ",
    featureTitle: 'ಮೊದಲ ಯೋಜನೆಯಿಂದ<br><span>ಅಂತಿಮ ಹಸ್ತಾಂತರದವರೆಗೆ.</span>',
    featureIntro: "ನಿಮ್ಮ ಯೋಜನೆ, ಜನರು ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳನ್ನು ಹೊಂದಾಣಿಕೆಯಲ್ಲಿ ಇಡುವ ಅಗತ್ಯ ಸಾಧನಗಳು.",
    cardOneTitle: "ಯೋಜನೆಗಳ ಸ್ಪಷ್ಟ ನೋಟ", cardOneCopy: "ಯೋಜನೆಯ ಸ್ಥಿತಿ, ಪ್ರಮುಖ ದಿನಾಂಕಗಳು, ತಂಡಗಳು ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ಒಂದೇ ಜಾಗದಲ್ಲಿ ನೋಡಿ.",
    cardTwoTitle: "ಹೊಂದಾಣಿಕೆಯಿಂದ ಕೆಲಸ ಮಾಡುವ ತಂಡ", cardTwoCopy: "ಗುತ್ತಿಗೆದಾರರು, ವ್ಯವಸ್ಥಾಪಕರು ಮತ್ತು ಕಾರ್ಮಿಕರ ನಿಯೋಜನೆಯನ್ನು ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.",
    cardThreeTitle: "ಸಾಮಗ್ರಿಗಳ ಮಾಹಿತಿ", cardThreeCopy: "ಪೂರೈಕೆದಾರರು, ಸಾಮಗ್ರಿಗಳ ಅಗತ್ಯ ಮತ್ತು ಖರೀದಿ ದಾಖಲೆಗಳನ್ನು ಯೋಜನೆಯಂತೆ ನಿರ್ವಹಿಸಿ.",
    cardFourTitle: "ಅನುಸರಿಸಬಹುದಾದ ಪ್ರಗತಿ", cardFourCopy: "ದೈನಂದಿನ ಕೆಲಸವನ್ನು ಸ್ಪಷ್ಟಗೊಳಿಸಲು ಪ್ರಗತಿ ಮತ್ತು ಹಾಜರಾತಿ ದಾಖಲಿಸಿ.",
    ctaEyebrow: "ನಿಮ್ಮ ಮುಂದಿನ ಯೋಜನೆ ಇಲ್ಲಿಂದ ಪ್ರಾರಂಭ", ctaTitle: 'ಕೆಲಸವನ್ನು ಇನ್ನಷ್ಟು<br><span>ಉತ್ತಮಗೊಳಿಸೋಣ.</span>',
    ctaCopy: "ಲಾಗಿನ್ ಮತ್ತು ನೋಂದಣಿ ಸೌಲಭ್ಯಗಳನ್ನು ಮುಂದಿನ ಅಭಿವೃದ್ಧಿ ಹಂತದಲ್ಲಿ ಸೇರಿಸಲಾಗುತ್ತದೆ.", ctaButton: "ಮೇಲಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    footerCopy: "ಪ್ರತಿ ಯೋಜನೆಯ ಜನರು, ಯೋಜನೆಗಳು ಮತ್ತು ಪ್ರಗತಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.",
    footerNote: "ನಿರ್ಮಾಣ ಯೋಜನಾ ನಿರ್ವಹಣೆಯ ಕಲ್ಪನೆ", footerLocation: "ಕ್ಷೇತ್ರದ ತಂಡಗಳಿಗಾಗಿ ರೂಪಿಸಲಾಗಿದೆ"
  },
  hi: {
    navHome: "होम", navAbout: "हमारे बारे में", navFeatures: "विशेषताएँ", navLogin: "लॉग इन", navRegister: "रजिस्टर",
    eyebrow: "निर्माण करने वाली टीमों के लिए",
    heroTitle: 'हर परियोजना के<br>हिस्सों को <span>एक साथ लाएँ।</span>',
    heroDescription: "अपनी साइट, टीम, सामग्री और प्रगति को एक स्पष्ट दृश्य में देखें। कम भागदौड़ के साथ काम आगे बढ़ाएँ।",
    heroPrimary: "प्लेटफ़ॉर्म देखें", heroSecondary: "यह कैसे काम करता है",
    proofTitle: "एक टीम। जानकारी का एक भरोसेमंद स्रोत।", proofCopy: "निर्माण स्थल की वास्तविक ज़रूरतों के लिए बनाया गया।",
    visualTag: "परियोजना का सारांश", progressLabel: "साइट की प्रगति", progressNote: "इस सप्ताह काम योजना के अनुसार",
    materialTitle: "सामग्री", materialNote: "डिलीवरी तय है", visualCaption: "काम की स्पष्ट तस्वीर",
    trustIntro: "साइट का काम आगे बढ़ाने वाली बातें", trustOne: "टीम में तालमेल", trustTwo: "सामग्री की जानकारी", trustThree: "प्रगति की स्पष्टता",
    aboutEyebrow: "निर्माण का बेहतर तरीका", aboutTitle: 'अच्छे काम के लिए<br><span>स्पष्ट योजना।</span>',
    aboutText: "निर्माण में लोग, समय-सीमा, सप्लायर और बजट साथ मिलकर काम करते हैं। Buildwise आपकी टीम को इन सभी कामों को व्यवस्थित रखने के लिए एक साझा जगह देता है।",
    aboutLink: "प्लेटफ़ॉर्म को और करीब से देखें", featureEyebrow: "एक साझा कार्यस्थल",
    featureTitle: 'पहली योजना से<br><span>अंतिम हस्तांतरण तक।</span>',
    featureIntro: "परियोजना, लोगों और संसाधनों में तालमेल रखने के लिए ज़रूरी सुविधाएँ।",
    cardOneTitle: "परियोजनाएँ एक नज़र में", cardOneCopy: "परियोजना की स्थिति, ज़रूरी तारीखें, टीम और प्रगति एक जगह देखें।",
    cardTwoTitle: "तालमेल से काम करती टीम", cardTwoCopy: "ठेकेदार, प्रबंधक और श्रमिकों की ज़िम्मेदारियाँ आसानी से समझें।",
    cardThreeTitle: "सामग्री की जानकारी", cardThreeCopy: "सप्लायर, सामग्री की ज़रूरत और खरीद रिकॉर्ड परियोजना के अनुसार रखें।",
    cardFourTitle: "प्रगति पर नज़र रखें", cardFourCopy: "रोज़मर्रा का काम देखने के लिए प्रगति और उपस्थिति दर्ज करें।",
    ctaEyebrow: "आपकी अगली परियोजना यहाँ से शुरू", ctaTitle: 'काम को और<br><span>बेहतर बनाएँ।</span>',
    ctaCopy: "लॉग इन और रजिस्ट्रेशन अगले विकास चरण में जोड़े जाएँगे।", ctaButton: "ऊपर वापस जाएँ",
    footerCopy: "हर परियोजना के लोगों, योजनाओं और प्रगति के लिए बनाया गया।",
    footerNote: "निर्माण परियोजना प्रबंधन की अवधारणा", footerLocation: "मैदान में काम करने वाली टीमों के लिए"
  }
};

const languageSelect = document.querySelector("#language-select");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

// Change all marked text and keep the page's language metadata in sync.
function setLanguage(language) {
  const selectedLanguage = translations[language] ? language : "en";
  document.documentElement.lang = selectedLanguage;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const translatedText = translations[selectedLanguage][element.dataset.i18n];
    if (translatedText) element.innerHTML = translatedText;
  });

  languageSelect.value = selectedLanguage;
  try {
    localStorage.setItem("buildwise-language", selectedLanguage);
  } catch (error) {
    // Language switching still works if browser storage is disabled.
  }
}

languageSelect.addEventListener("change", (event) => setLanguage(event.target.value));

// On smaller screens, the menu button shows or hides the navigation links.
menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  navigation.classList.toggle("is-open", !isOpen);
});

// Close the mobile menu after choosing a navigation link.
navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  });
});

// Display the current year automatically in the footer.
document.querySelector("#current-year").textContent = new Date().getFullYear();

// Restore the last language choice; default to English for a first visit.
try {
  setLanguage(localStorage.getItem("buildwise-language") || "en");
} catch (error) {
  setLanguage("en");
}
