document.addEventListener('DOMContentLoaded', () => {
    const navAuth = document.getElementById('nav-auth');
    const heroTitle = document.getElementById("hero-title");
    const heroSubtext = document.querySelector(".hero-content p"); // Targets the description paragraph
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
