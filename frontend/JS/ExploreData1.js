// --- Navbar & Navigation Elements ---
const exploreDataBtn = document.getElementById('exploreDataBtn');
const homeBtn = document.getElementById('homeBtn');
const linkexplore = document.getElementById('link-explore');
const linkAssignments= document.getElementById('link-correlation');

// --- Main Action Buttons ---
const overTimeBtn = document.getElementById('overTimeBtn');
const acrossCountriesBtn = document.getElementById('acrossCountriesBtn');

// --- Event Listeners ---

// Navigation
if (exploreDataBtn) {
    exploreDataBtn.addEventListener('click', () => {
        window.location.href = 'ExploreData1.html';
    });
}

if (linkAssignments) {
    linkAssignments.addEventListener('click', () => {
        window.location.href = 'Assignments.html';
    });
}

if (homeBtn) {
    homeBtn.addEventListener('click', () => {
        window.location.href = 'Home.html'; 
    });
}

if (linkexplore) {
    linkexplore.addEventListener('click', () => {
        window.location.href = 'ExploreData1.html'; 
    });
}

// Cards
if (overTimeBtn) {
    overTimeBtn.addEventListener('click', () => {
        window.location.href = 'ExploreData2.html';
    });
}

if (acrossCountriesBtn) {
    acrossCountriesBtn.addEventListener('click', () => {
        window.location.href = 'ExploreData3.html';
    });
}
