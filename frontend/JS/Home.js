// Home.js
document.addEventListener('DOMContentLoaded', () => {
    const navAuth = document.getElementById('nav-auth');
    const username = sessionStorage.getItem("name");
    const welcomeDiv = document.getElementById("welcomeMessage");

    // ====== Navbar Authentication Section ======
    if (username) {
        navAuth.innerHTML = `
            <div class="dropdown">
                <button class="btn-solid dropdown-btn">${username}</button>
                <div class="dropdown-content">
                    <a href="#" id="logout-btn">Logout</a>
                </div>
            </div>
        `;

        if (welcomeDiv) {
            welcomeDiv.innerHTML = `<h2>Welcome back to GapMinder Project, ${username}!</h2>`;
        }

        document.getElementById('logout-btn').addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = "Home.html";
        });

    } else {
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
    document.getElementById('link-explore')?.addEventListener('click', () => window.location.href = 'ExploreData1.html');
    document.getElementById('link-correlation')?.addEventListener('click', () => window.location.href = 'Assignments.html');
});