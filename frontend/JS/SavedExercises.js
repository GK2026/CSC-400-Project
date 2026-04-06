// init
document.addEventListener("DOMContentLoaded", async () => {
    if (!requireLogin()) return;
    populateStudentDropdown();

    document.getElementById("new-exercise-btn")?.addEventListener("click", () => {
        sessionStorage.removeItem("current_saved_exercise");
        sessionStorage.removeItem("current_exercise_id");
        sessionStorage.removeItem("loaded_saved_exercise");
        sessionStorage.removeItem("current_generated_exercise");
        window.location.href = "ExploreData1.html";
    });

    const tbody = document.querySelector("#savedExercisesTable tbody");
    if (!tbody) return;

    try {
        const res = await fetch(API_BASE + "/gapminder/my-exercises", { headers: authHeaders() });
        const data = await res.json();

        if (!res.ok || !data.length) {
            tbody.innerHTML = "<tr><td colspan='5'>" + (!res.ok ? "Could not load saved exercises." : "No saved exercises yet. Go to Explore Data to create one.") + "</td></tr>";
            return;
        }

        tbody.innerHTML = "";
        data.forEach((item) => {
            const tr = document.createElement("tr");
            tr.innerHTML =
                "<td>" + (item.name || "Untitled Exercise") + "</td>" +
                "<td>" + item.indicator_1_name + " vs " + item.indicator_2_name + "</td>" +
                "<td>" + (item.start_year === item.end_year ? "Across Countries" : "Over Time") + "</td>" +
                "<td>" + new Date(item.created_at).toLocaleString() + "</td>" +
                "<td><button class='open-btn' data-id='" + item.id + "' style='padding:6px 14px; background:#7c3aed; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:600;'>Open</button></td>";
            tbody.appendChild(tr);
        });

        document.querySelectorAll(".open-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
                btn.textContent = "Loading...";
                btn.disabled = true;
                try {
                    const res = await fetch(API_BASE + "/gapminder/my-exercises/" + btn.dataset.id, { headers: authHeaders() });
                    const data = await res.json();
                    if (!res.ok) { alert(data.detail || "Could not load exercise."); return; }

                    const ex = { ...data, exercise_id: data.id };
                    sessionStorage.setItem("current_saved_exercise", JSON.stringify(ex));
                    sessionStorage.setItem("current_exercise_id", String(ex.exercise_id));
                    sessionStorage.setItem("loaded_saved_exercise", JSON.stringify(ex));

                    const countries = ex.countries || [];
                    const singleYear = ex.start_year === ex.end_year;
                    window.location.href = (singleYear && countries.length > 1) ? "ExploreData3.html" : "ExploreData2.html";
                } catch (err) {
                    console.error(err);
                    alert("Could not load exercise.");
                    btn.textContent = "Open";
                    btn.disabled = false;
                }
            });
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = "<tr><td colspan='5'>Could not load saved exercises.</td></tr>";
    }
});