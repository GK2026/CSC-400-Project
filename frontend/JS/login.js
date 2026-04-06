// config
const API_BASE = window.location.origin.includes("gapminder.scsu.southernct.edu")
    ? "/api"
    : "http://127.0.0.1:8000";

// jwt helpers
function parseJWT(token) {
    try {
        const parts = token.split(".");
        if (parts.length < 2) return {};

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)) % 4, "=");

        return JSON.parse(atob(padded));
    } catch (err) {
        console.warn("Could not parse JWT:", err);
        return {};
    }
}

// auth storage
function clearStoredAuth() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token_type");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("first_name");

    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("first_name");
}

function storeAuth(result, decoded) {
    const firstName =
        decoded.first_name ||
        decoded.name ||
        (decoded.email ? decoded.email.split("@")[0] : "Student");

    clearStoredAuth();

    sessionStorage.setItem("access_token", result.access_token);
    sessionStorage.setItem("token_type", result.token_type || "bearer");
    sessionStorage.setItem("role", decoded.role || "student");
    sessionStorage.setItem("email", decoded.email || "");
    sessionStorage.setItem("first_name", firstName);

    localStorage.setItem("access_token", result.access_token);
    localStorage.setItem("token_type", result.token_type || "bearer");
    localStorage.setItem("role", decoded.role || "student");
    localStorage.setItem("email", decoded.email || "");
    localStorage.setItem("first_name", firstName);
}

// event listeners
document.getElementById("signUp")?.addEventListener("click", () => {
    window.location.href = "signup.html";
});

document.getElementById("teacherSignUp")?.addEventListener("click", () => {
    window.location.href = "TeacherSignup.html";
});

document.getElementById("questDirect")?.addEventListener("click", async () => {
    const email = document.getElementById("username")?.value.trim();
    const password = document.getElementById("passwordEntry")?.value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    const data = { email, password };

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        let result = {};
        try {
            result = await res.json();
        } catch {
            result = {};
        }

        if (!res.ok) {
            clearStoredAuth();
            alert(result.detail || "Invalid login credentials.");
            return;
        }

        if (!result.access_token) {
            clearStoredAuth();
            alert("Login succeeded but no token was returned.");
            return;
        }

        const decoded = parseJWT(result.access_token);
        storeAuth(result, decoded);

        const role = (decoded.role || "student").toLowerCase();

        if (role === "teacher" || role === "instructor") {
            window.location.href = "Teacher.html";
        } else {
            window.location.href = "Home.html";
        }
    } catch (err) {
        console.error(err);
        clearStoredAuth();
        alert("Network error: could not connect to backend.");
    }
});