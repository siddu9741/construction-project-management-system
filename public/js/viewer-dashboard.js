const token = sessionStorage.getItem("authToken");
const role = sessionStorage.getItem("authRole");
if (!token || role !== "viewer") {
  window.location.href = "/login.html";
} else {
  document.getElementById("viewerName").textContent = sessionStorage.getItem("authName") || "User";
  fetch("/api/viewer/dashboard", { headers: { Authorization: `Bearer ${token}` } })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load dashboard.");
      document.getElementById("viewerName").textContent = data.viewer.name;
      document.getElementById("dashboardMessage").textContent = "";
      const cards = document.getElementById("summaryCards");
      for (const [label, value] of [["Total projects", data.summary.total_projects], ["Active projects", data.summary.active_projects]]) {
        const card = document.createElement("article");
        card.className = "metric-card";
        const title = document.createElement("p");
        title.textContent = label;
        const total = document.createElement("strong");
        total.textContent = value;
        card.append(title, total);
        cards.append(card);
      }
    })
    .catch((error) => {
      document.getElementById("dashboardMessage").textContent = error.message;
    });
}
document.getElementById("logoutButton").addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "/login.html";
});
