// Edited By Amir

document.getElementById("returnLogin")?.addEventListener("click", () => {
    window.location.href = "login.html";
});

document.getElementById("questDirect")?.addEventListener("click", async () => {
    const data = {
        first_name: document.getElementById("Name")?.value.trim(),
        email: document.getElementById("usernamesignup")?.value.trim(),
        password: document.getElementById("passwordEntry")?.value
    };

    try {
        const res = await fetch("http://127.0.0.1:8000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            alert("Signup successful! Please log in.");
            window.location.href = "login.html";
        } else {
            alert(result.detail || "Signup failed.");
        }
    } catch (err) {
        alert("Network error: could not connect to backend.");
        console.error(err);
    }
});