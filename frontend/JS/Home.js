document.addEventListener('DOMContentLoaded', () => {
    const navAuth = document.getElementById('nav-auth');
    const first_name = sessionStorage.getItem("first_name");
    const heroTitle = document.getElementById("hero-title");
    const heroSubtext = document.querySelector(".hero-content p"); // Targets the description paragraph

    // ====== Navbar & Hero Authentication Section ======
    if (first_name) {
        // 1. Update Navbar to show name and dropdown
        navAuth.innerHTML = `
            <div class="dropdown">
                <button class="btn-solid dropdown-btn">${first_name}</button>
                <div class="dropdown-content">
                    <a href="#" id="logout-btn">Logout</a>
                </div>
            </div>
        `;

        // 2. REPLACE the Hero Header Text
        if (heroTitle) {
            heroTitle.innerText = `Welcome back to GapMinder Project, ${first_name}!`;
        }

 
        // Logout logic
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = "Home.html";
        });

    } else {
        // What Guests see
        navAuth.innerHTML = `
            <button id="nav-signin-btn" class="btn-outline">Sign In</button>
            <button id="nav-register-btn" class="btn-solid">Register</button>
        `;

        document.getElementById('nav-signin-btn').addEventListener('click', () => {
            window.location.href = 'login.html';
        });
        document.getElementById('nav-register-btn').addEventListener('click', () => {
            window.location.href = 'signup.html';
        });
    }

    // ====== Hero Section Cards ======
    const cardExploreBtn = document.getElementById('card-explore-btn');
    const cardSubmitBtn = document.getElementById('card-submit-btn');
    const cardViewBtn = document.getElementById('card-view-btn');

    if (cardExploreBtn) cardExploreBtn.addEventListener('click', () => window.location.href = 'ExploreData1.html');
    if (cardSubmitBtn) cardSubmitBtn.addEventListener('click', () => window.location.href = 'Assignments.html');
    if (cardViewBtn) cardViewBtn.addEventListener('click', () => window.location.href = 'Assignments.html');

    // ====== Navbar Links ======
    document.getElementById('link-explore')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'ExploreData1.html';
    });
    document.getElementById('link-correlation')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'Assignments.html';
    });
});
