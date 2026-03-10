// Edited By Amir

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
            alert("Login successful!");

            sessionStorage.setItem("access_token", result.access_token);
            sessionStorage.setItem("token_type", result.token_type);

            window.location.href = "ExploreData1.html";
        } else {
            alert(result.detail || "Invalid login credentials.");
        }
    } catch (err) {
        alert("Network error: could not connect to backend.");
        console.error(err);
    }
});