// ================= NAVBAR ELEMENTS =================
const linkhome = document.getElementById('Return'); // breadcrumb Home
const linkexplore = document.getElementById('link-explore');
const linkAssignments = document.getElementById('link-correlation');
const Current = document.getElementById('Current');
const Home = document.getElementById('Back');


// ================= CARD BUTTONS =================
// (Make sure these IDs exist in your HTML)
const overTimeBtn = document.getElementById('overTimeBtn');
const acrossCountriesBtn = document.getElementById('acrossCountriesBtn');

// ================= EVENT LISTENERS =================


if (Home) {
    Home.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'Home.html';
    });
}

if (linkAssignments) {
    linkAssignments.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'Assignments.html';
    });
}

if (linkexplore) {
    linkexplore.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'ExploreData1.html';
    });
}

// Breadcrumbs
if (Current) {
    Current.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'ExploreData1.html';
    });
}

// Card buttons
if (overTimeBtn) {
    overTimeBtn.addEventListener('click', () => {
        window.location.href = 'ExploreData2.html';
    });
}

if (Return) {
    Return.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'Home.html';
    });
}
if (acrossCountriesBtn) {
    acrossCountriesBtn.addEventListener('click', () => {
        window.location.href = 'ExploreData3.html';
    });
}
