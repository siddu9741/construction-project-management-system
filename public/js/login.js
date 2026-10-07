const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const loginEndpoints = {
  admin: "/api/admin/login",
  contractor: "/api/contractor/login",
  worker: "/api/worker/login",
  viewer: "/api/viewer/login",
};

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "";

  const role = document.getElementById("role").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const submitButton = loginForm.querySelector("button[type='submit']");

  submitButton.disabled = true;
  submitButton.textContent = "Signing in...";

  try {
    const result = await fetch(loginEndpoints[role], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error || "Sign in failed.");
    }

    if (!data.token) {
      throw new Error("The server did not return a login token.");
    }

    sessionStorage.setItem("authToken", data.token);
    sessionStorage.setItem("authRole", role);

    const account = data[role] || {};
    sessionStorage.setItem(
      "authName",
      account.name || account.full_name || "User"
    );

    window.location.href = `/${role}/dashboard.html`;
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Sign in";
  }
});
