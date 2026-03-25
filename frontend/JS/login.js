// Edited By Amir & Oleksandr

function parseJWT(token) {
    return JSON.parse(atob(token.split('.')[1]));
}

document.getElementById("signUp")?.addEventListener("click", function () {
    window.location.href = "signup.html";
});

document.getElementById("questDirect")?.addEventListener("click", async () => {
    const data = {
        email: document.getElementById("username")?.value.trim(),
        password: document.getElementById("passwordEntry")?.value
    };

    try {
        const res = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            const decoded = parseJWT(result.access_token);

            sessionStorage.setItem("access_token", result.access_token);
            sessionStorage.setItem("token_type", result.token_type);
            sessionStorage.setItem("role", decoded.role);
            sessionStorage.setItem("name", decoded.email);

            if (decoded.role === "instructor") {
                window.location.href = "Teacher.html";
            } else {
                window.location.href = "Home.html";
            }
        } else {
            alert(result.detail || "Invalid login credentials.");
        }
    } catch (err) {
        alert("Network error: could not connect to backend.");
        console.error(err);
    }
});