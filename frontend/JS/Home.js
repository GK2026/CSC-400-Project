// Home.js
document.addEventListener('DOMContentLoaded', () => {
    const navAuth = document.getElementById('nav-auth');
    const username = localStorage.getItem("username"); // stored after login/register
    const welcomeDiv = document.getElementById("welcomeMessage");


    // ====== Navbar Authentication Section ======
    if (username) {
        // Show username with dropdown
        navAuth.innerHTML = `
            <div class="dropdown">
                <button class="btn-solid dropdown-btn">${name}</button>
                <div class="dropdown-content">
                    <a href="#" id="logout-btn">Logout</a>
                </div>
            </div>
        `;

        // Show welcome message
        if (welcomeDiv) {
            welcomeDiv.innerHTML = `<h2>Welcome back to GapMinder Project, ${name}!</h2>`;
        }

        // Logout functionality
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem("username");
            window.location.href = "Home.html"; // refresh page after logout
        });

    } else {
        // Show Sign In / Register buttons
        navAuth.innerHTML = `
            <button id="nav-signin-btn" class="btn-outline">Sign In</button>
            <button id="nav-register-btn" class="btn-solid">Register</button>
        `;

        // Add event listeners
        document.getElementById('nav-signin-btn').addEventListener('click', () => {
            window.location.href = 'Login.html';
        });
        document.getElementById('nav-register-btn').addEventListener('click', () => {
            window.location.href = 'Signup.html';
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

