document.addEventListener("DOMContentLoaded", () => {
    const navAuth = document.getElementById("nav-auth");
    const firstName = sessionStorage.getItem("first_name") || localStorage.getItem("first_name");
    const role = sessionStorage.getItem("role") || localStorage.getItem("role");
    const heroTitle = document.getElementById("hero-title");

    if (firstName) {
        navAuth.innerHTML = `
            <div class="user-menu" id="user-menu">
                <button class="user-menu-btn" id="user-menu-btn">
                    <span id="user-name-display">${firstName}</span> &#9662;
                </button>
                <div class="user-menu-dropdown" id="user-menu-dropdown">
                    <button id="logout-btn">Logout</button>
                </div>
            </div>
        `;

        if (heroTitle) {
            heroTitle.innerText = `Welcome back to Correlation Assistant, ${firstName}!`;
        }

        const menuBtn = document.getElementById("user-menu-btn");
        const dropdown = document.getElementById("user-menu-dropdown");
        menuBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        });
        document.addEventListener("click", () => { if (dropdown) dropdown.style.display = "none"; });

        document.getElementById("logout-btn")?.addEventListener("click", () => {
            sessionStorage.clear(); localStorage.clear();
            window.location.href = "Home.html";
        });
    } else {
        navAuth.innerHTML = `
            <button id="nav-signin-btn" class="btn-outline">Sign In</button>
            <button id="nav-register-btn" class="btn-solid">Register</button>
        `;

        document.getElementById("nav-signin-btn")?.addEventListener("click", () => {
            window.location.href = "login.html";
        });

        document.getElementById("nav-register-btn")?.addEventListener("click", () => {
            window.location.href = "signup.html";
        });
    }

    document.getElementById("card-explore-btn")?.addEventListener("click", () => {
        window.location.href = "ExploreData1.html";
    });

    document.getElementById("card-submit-btn")?.addEventListener("click", () => {
        window.location.href = "SavedExercises.html";
    });

    document.getElementById("card-view-btn")?.addEventListener("click", () => {
        if (role === "teacher" || role === "instructor") {
            window.location.href = "Teacher.html";
        } else {
            window.location.href = "Submissions.html";
        }
    });

    document.getElementById("link-home")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "Home.html";
    });

    document.getElementById("link-explore")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "ExploreData1.html";
    });

    document.getElementById("link-saved")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "SavedExercises.html";
    });

    document.getElementById("link-correlation")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "Submissions.html";
    });
});
