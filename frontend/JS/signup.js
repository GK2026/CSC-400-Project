const API_BASE = window.location.origin.includes("gapminder.scsu.southernct.edu")
    ? "/api"
    : "http://127.0.0.1:8000";

window.onload = function () {
    const signupBtn = document.getElementById("questDirect");
    const returnBtn = document.getElementById("returnLogin");
    const isTeacherCheckbox = document.getElementById("isTeacher");
    const inviteSection = document.getElementById("inviteSection");
    const pageTitle = document.getElementById("pageTitle");

    if (!signupBtn || !returnBtn) {
        console.error("Signup page buttons not found.");
        return;
    }

    isTeacherCheckbox.onchange = function () {
        if (this.checked) {
            inviteSection.classList.add("visible");
            pageTitle.textContent = "Teacher Registration";
        } else {
            inviteSection.classList.remove("visible");
            pageTitle.textContent = "Create Account";
            document.getElementById("inviteCode").value = "";
        }
    };

    returnBtn.onclick = function () {
        window.location.href = "login.html";
    };

    signupBtn.onclick = async function () {
        const firstName = document.getElementById("Name")?.value.trim();
        const email = document.getElementById("usernamesignup")?.value.trim();
        const password = document.getElementById("passwordEntry")?.value;
        const confirmPassword = document.getElementById("confirmPassword")?.value;
        const isTeacher = isTeacherCheckbox.checked;
        const inviteCode = document.getElementById("inviteCode")?.value.trim();
        const passwordError = document.getElementById("passwordError");
        const confirmInput = document.getElementById("confirmPassword");

        if (!firstName || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (!email.endsWith("@southernct.edu")) {
            alert("Please use your Southern Connecticut State University email.");
            return;
        }

        if (password !== confirmPassword) {
            passwordError.classList.add("visible");
            confirmInput.classList.add("input-error");
            return;
        } else {
            passwordError.classList.remove("visible");
            confirmInput.classList.remove("input-error");
        }

        if (isTeacher && !inviteCode) {
            alert("Please enter your invite code to register as a teacher.");
            return;
        }

        signupBtn.disabled = true;
        signupBtn.textContent = "Creating account...";

        try {
            const endpoint = isTeacher
                ? `${API_BASE}/auth/register-teacher?invite_code=${encodeURIComponent(inviteCode)}`
                : `${API_BASE}/auth/register`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ first_name: firstName, email, password })
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.detail || result.error || "Signup failed.");
                return;
            }

            alert(isTeacher
                ? "Teacher account created! Please log in."
                : "Account created! Please log in."
            );
            window.location.href = "login.html";

        } catch (err) {
            console.error("Signup error:", err);
            alert("Could not connect to backend.");
        } finally {
            signupBtn.disabled = false;
            signupBtn.textContent = "Sign Up";
        }
    };
};
