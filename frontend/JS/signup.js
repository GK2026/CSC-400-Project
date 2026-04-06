// config
const API_BASE = window.location.origin.includes("gapminder.scsu.southernct.edu")
    ? "/api"
    : "http://127.0.0.1:8000";

window.onload = function () {
    const signupBtn = document.getElementById("questDirect");
    const returnBtn = document.getElementById("returnLogin");

    if (!signupBtn || !returnBtn) {
        console.error("Signup page buttons not found.");
        return;
    }

    returnBtn.onclick = function () {
        window.location.href = "login.html";
    };

    signupBtn.onclick = async function () {
        const firstName = document.getElementById("Name")?.value.trim();
        const email = document.getElementById("usernamesignup")?.value.trim();
        const password = document.getElementById("passwordEntry")?.value;

        if (!firstName || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        if (!email.endsWith("@southernct.edu")) {
            alert("Please use your Southern email.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    first_name: firstName,
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.detail || result.error || "Signup failed.");
                return;
            }

            alert("Signup successful. Please log in.");
            window.location.href = "login.html";
        } catch (error) {
            console.error("Signup error:", error);
            alert("Could not connect to backend.");
        }
    };
};