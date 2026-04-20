let currentExercise = null;
let hiddenCorrelationAnswer = null;

function loadExerciseFromSession() {
    const keys = ["loaded_saved_exercise", "current_generated_exercise", "current_saved_exercise"];
    for (const key of keys) {
        try {
            const raw = sessionStorage.getItem(key);
            if (raw) return JSON.parse(raw);
        } catch { }
    }
    return null;
}

function goToStep(n) {
    document.querySelectorAll(".step-panel").forEach(p => p.classList.remove("active"));
    document.getElementById(`step-${n}`)?.classList.add("active");

    document.querySelectorAll(".step-pill").forEach(pill => {
        const s = Number(pill.dataset.step);
        pill.classList.remove("active", "completed");
        if (s === n) pill.classList.add("active");
        else if (s < n) pill.classList.add("completed");
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function wireNavigation() {
    document.getElementById("link-home")?.addEventListener("click", (e) => { e.preventDefault(); window.location.href = "Home.html"; });
    document.getElementById("Return")?.addEventListener("click", (e) => { e.preventDefault(); window.location.href = "Home.html"; });
    document.getElementById("Back")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentExercise) {
            sessionStorage.setItem("current_generated_exercise", JSON.stringify(currentExercise));
            sessionStorage.setItem("restore_from_guide", "1");
            const countries = currentExercise.countries || [];
            const singleYear = currentExercise.start_year === currentExercise.end_year;
            window.location.href = (singleYear && countries.length > 1) ? "ExploreData3.html" : "ExploreData2.html";
        } else {
            window.location.href = "ExploreData1.html";
        }
    });
    document.getElementById("link-explore")?.addEventListener("click", (e) => { e.preventDefault(); window.location.href = "ExploreData1.html"; });
    document.getElementById("link-saved")?.addEventListener("click", (e) => { e.preventDefault(); window.location.href = "SavedExercises.html"; });
    document.getElementById("link-correlation")?.addEventListener("click", (e) => { e.preventDefault(); window.location.href = "Submissions.html"; });
}

function renderBanner(exercise) {
    const title = document.getElementById("bannerTitle");
    const meta = document.getElementById("bannerMeta");
    if (!title || !exercise) return;
    title.textContent = `${exercise.indicator_1_name} vs ${exercise.indicator_2_name}`;
    const countries = (exercise.countries || []).join(", ");
    meta.textContent = `${exercise.start_year}–${exercise.end_year}${countries ? " · " + countries : ""}`;
}

function getCountryLabel(row) {
    const raw = row.country || row.country_name || row.country_code || "";
    const code = row.country_code || "";
    if (!raw) return String(row.year || "");
    return (raw && raw.toLowerCase() !== code.toLowerCase())
        ? raw
        : code.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function renderStep1(exercise) {
    const rows = exercise.rows || [];
    const hasCountry = rows.some(r => r.country || r.country_name || r.country_code);

    document.getElementById("col1Header").textContent = hasCountry ? "Country" : "Year";
    document.getElementById("col2Header").textContent = `${exercise.indicator_1_name} (X)`;
    document.getElementById("col3Header").textContent = `${exercise.indicator_2_name} (Y)`;

    const tbody = document.getElementById("step1Body");
    tbody.innerHTML = "";
    rows.forEach(row => {
        const label = hasCountry ? getCountryLabel(row) : row.year;
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${label}</td><td>${row.indicator_1_value}</td><td>${row.indicator_2_value}</td>`;
        tbody.appendChild(tr);
    });
}

function prefillRelationship() {
    const sel = document.getElementById("relationshipSelect");
    if (!sel || sel.value) return;
    const label = (currentExercise?.relationship_label || "").toLowerCase();
    if (label.includes("negative")) sel.value = "negative";
    else if (label.includes("none") || label.includes("no")) sel.value = "none";
    else if (label.includes("positive")) sel.value = "positive";
}

async function saveAndSubmit() {
    if (!isLoggedIn()) { alert("Please log in to submit."); window.location.href = "login.html"; return; }
    if (!currentExercise) { alert("No dataset loaded."); return; }

    const nameInput = document.getElementById("exerciseNameInput");
    const rInput = document.getElementById("userCorrelationInput");
    const selectedLabel = document.getElementById("relationshipSelect")?.value;
    const explanation = document.getElementById("verbalExplanation")?.value.trim();
    const exerciseName = nameInput ? nameInput.value.trim() : "";

    if (!exerciseName) { nameInput.style.borderColor = "#ef4444"; nameInput.focus(); alert("Give your exercise a name first."); return; }

    const rVal = parseFloat(rInput?.value);
    if (isNaN(rVal) || rVal < -1 || rVal > 1) { alert("Enter a valid Pearson r value between −1 and 1."); return; }

    if (!selectedLabel) { alert("Select the type of correlation."); return; }
    if (!explanation) { alert("Write your explanation first."); return; }

    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Saving & Submitting..."; }

    try {
        let exerciseId = currentExercise.exercise_id || Number(sessionStorage.getItem("current_exercise_id")) || null;

        if (!exerciseId) {
            const saveRes = await fetch(`${API_BASE}/gapminder/save-exercise`, {
                method: "POST",
                headers: authHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({ ...currentExercise, name: exerciseName })
            });
            const saveResult = await saveRes.json();
            if (!saveRes.ok) { alert(saveResult.detail || "Could not save exercise."); return; }
            exerciseId = saveResult.exercise_id;
            currentExercise.exercise_id = exerciseId;
            sessionStorage.setItem("current_exercise_id", String(exerciseId));
        }

        const subRes = await fetch(`${API_BASE}/gapminder/submit-exercise`, {
            method: "POST",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({
                exercise_id: exerciseId,
                student_selected_label: selectedLabel,
                student_explanation: explanation,
                student_pearson_r: rVal
            })
        });
        const subResult = await subRes.json();
        if (!subRes.ok) { alert(subResult.detail || "Could not submit exercise."); return; }

        alert("Submitted! Your teacher will leave feedback on your My Submissions page.");
        window.location.href = "Submissions.html";
    } catch (err) {
        console.error(err);
        alert("Could not save and submit. Please try again.");
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Save & Submit for Grading"; }
    }
}

async function handleExportXlsx() {
    if (!currentExercise) { alert("No dataset loaded."); return; }
    try {
        await exportExerciseCsv(currentExercise);
    } catch (err) {
        console.error(err);
        alert(err.message || "Could not export.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    populateStudentDropdown();
    startAnnouncementPolling();
    wireNavigation();

    currentExercise = loadExerciseFromSession();

    if (!currentExercise) {
        document.getElementById("bannerTitle").textContent = "No dataset loaded — go back to Explore Data first.";
        return;
    }

    hiddenCorrelationAnswer = typeof currentExercise.pearson_r === "number"
        ? currentExercise.pearson_r
        : Number(currentExercise.pearson_r);

    renderBanner(currentExercise);
    renderStep1(currentExercise);
    prefillRelationship();

    document.getElementById("exportXlsxBtn")?.addEventListener("click", handleExportXlsx);
});