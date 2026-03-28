document.addEventListener("DOMContentLoaded", () => {

    /*******************************
     * NAVBAR ELEMENTS
     *******************************/
    const linkhome = document.getElementById('Return'); 
    const linkexplore = document.getElementById('link-explore');
    const linkAssignments = document.getElementById('link-correlation');
    const Current = document.getElementById('Current');
    const Home = document.getElementById('Back');

    const studentSelect = document.getElementById("student-select");
    const firstName = sessionStorage.getItem("first_name");

    /*******************************
     * STUDENT NAME + LOGOUT
     *******************************/
    if (studentSelect) {
        if (firstName) {
            studentSelect.innerHTML = `
                <option>${firstName}</option>
                <option value="logout">Logout</option>
            `;
        } else {
            studentSelect.innerHTML = `
                <option>Student Name</option>
            `;
        }

        studentSelect.addEventListener("change", (e) => {
            if (e.target.value === "logout") {
                sessionStorage.clear();
                window.location.href = "Home.html";
            }
        });
    }

    /*******************************
     * NAVIGATION
     *******************************/
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

    if (Current) {
        Current.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'ExploreData1.html';
        });
    }

    if (linkhome) {
        linkhome.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'Home.html';
        });
    }

});
