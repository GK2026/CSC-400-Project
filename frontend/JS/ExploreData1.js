document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("overTimeBtn")?.addEventListener("click", () => {
        sessionStorage.removeItem("loaded_saved_exercise");
        window.location.href = "ExploreData2.html";
    });

    document.getElementById("acrossCountriesBtn")?.addEventListener("click", () => {
        sessionStorage.removeItem("loaded_saved_exercise");
        window.location.href = "ExploreData3.html";
    });

    document.getElementById("link-home")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "Home.html";
    });

    document.getElementById("Return")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "Home.html";
    });

    document.getElementById("link-explore")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "ExploreData1.html";
    });

    document.getElementById("link-correlation")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "Submissions.html";
    });

    populateStudentDropdown();
});