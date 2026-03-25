// Created By Oleksandr

document.addEventListener('DOMContentLoaded', () => {
    const role = sessionStorage.getItem("role");
    if (!role || role !== "instructor") {
        window.location.href = "login.html";
        return;
    }

    const name = sessionStorage.getItem("name");
    const select = document.getElementById("student-select");

    if (select && name) {
        select.options[0].text = name;
    }

    select?.addEventListener("change", (e) => {
        if (e.target.value === "Logout") {
            sessionStorage.clear();
            window.location.href = "login.html";
        }
    });
});