let currentExercise = null;
let hiddenCorrelationAnswer = null;
let currentStep = 1;
let correctMeanX = null;
let correctMeanY = null;
let correctDeviations = [];
let correctProducts = [];
let correctSumXY = null;
let correctSumX2 = null;
let correctSumY2 = null;

let meanXConfirmed = false;
let meanYConfirmed = false;
let deviationsConfirmed = false;
let productsConfirmed = false;

// math helpers
function round3(n) { return Math.round(n * 1000) / 1000; }

function withinTolerance(a, b, tol = 0.01) { return Math.abs(a - b) <= tol; }

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


// nav
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

function goToStep(n) {
    document.querySelectorAll(".step-panel").forEach(p => p.classList.remove("active"));
    document.getElementById(`step-${n}`)?.classList.add("active");

    document.querySelectorAll(".step-pill").forEach(pill => {
        const s = Number(pill.dataset.step);
        pill.classList.remove("active", "completed");
        if (s === n) pill.classList.add("active");
        else if (s < n) pill.classList.add("completed");
    });

    currentStep = n;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderBanner(exercise) {
    const title = document.getElementById("bannerTitle");
    const meta = document.getElementById("bannerMeta");
    if (!title || !exercise) return;

    title.textContent = `${exercise.indicator_1_name} vs ${exercise.indicator_2_name}`;
    const countries = (exercise.countries || []).join(", ");
    meta.textContent = `${exercise.start_year}–${exercise.end_year}${countries ? " · " + countries : ""}`;
}

// step rendering
function renderStep1(exercise) {
    const rows = exercise.rows || [];
    const hasCountry = rows.some(r => r.country || r.country_name || r.country_code);

    document.getElementById("col1Header").textContent = hasCountry ? "Country" : "Year";
    document.getElementById("col2Header").textContent = `${exercise.indicator_1_name} (X)`;
    document.getElementById("col3Header").textContent = `${exercise.indicator_2_name} (Y)`;

    const tbody = document.getElementById("step1Body");
    tbody.innerHTML = "";
    rows.forEach(row => {
        const rawLabel = row.country || row.country_name || row.country_code || "";
        const code = row.country_code || "";
        const label = hasCountry
            ? (rawLabel && rawLabel.toLowerCase() !== code.toLowerCase()
                ? rawLabel
                : code.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()))
            : row.year;
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${label}</td><td>${row.indicator_1_value}</td><td>${row.indicator_2_value}</td>`;
        tbody.appendChild(tr);
    });
}

// setup calculations
function prepareCalculations(exercise) {
    const rows = exercise.rows || [];
    const xs = rows.map(r => r.indicator_1_value);
    const ys = rows.map(r => r.indicator_2_value);
    const n = rows.length;

    correctMeanX = round3(xs.reduce((a, b) => a + b, 0) / n);
    correctMeanY = round3(ys.reduce((a, b) => a + b, 0) / n);

    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);

    document.getElementById("sumHint").innerHTML =
        `ΣX = <span>${round3(sumX)}</span> &nbsp;&nbsp; ΣY = <span>${round3(sumY)}</span> &nbsp;&nbsp; n = <span>${n}</span>`;

    correctDeviations = rows.map((row, i) => ({
        label: (() => {
            const raw = row.country || row.country_name || row.country_code || "";
            const code = row.country_code || "";
            if (!raw) return row.year;
            return (raw && raw.toLowerCase() !== code.toLowerCase())
                ? raw
                : code.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        })(),
        x: row.indicator_1_value,
        y: row.indicator_2_value,
        dx: round3(row.indicator_1_value - correctMeanX),
        dy: round3(row.indicator_2_value - correctMeanY)
    }));

    correctProducts = correctDeviations.map(d => ({
        ...d,
        dxdy: round3(d.dx * d.dy),
        dx2: round3(d.dx * d.dx),
        dy2: round3(d.dy * d.dy)
    }));

    correctSumXY = round3(correctProducts.reduce((a, p) => a + p.dxdy, 0));
    correctSumX2 = round3(correctProducts.reduce((a, p) => a + p.dx2, 0));
    correctSumY2 = round3(correctProducts.reduce((a, p) => a + p.dy2, 0));
}

function renderStep3() {
    document.getElementById("deviationFormula").innerHTML =
        `X̄ = ${correctMeanX} &nbsp;&nbsp; Ȳ = ${correctMeanY}<br>` +
        `For each row: &nbsp; X − X̄ &nbsp; and &nbsp; Y − Ȳ`;

    document.getElementById("devCol1").textContent =
        (currentExercise.rows[0]?.country || currentExercise.rows[0]?.country_name) ? "Country" : "Year";

    const tbody = document.getElementById("step3Body");
    tbody.innerHTML = "";

    correctDeviations.forEach((d, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${d.label}</td>
            <td>${d.x}</td>
            <td>${d.y}</td>
            <td><input type="text" class="calc-input" id="dx_${i}" placeholder="0.000" style="width:100px;padding:6px 8px;font-size:0.82rem;" inputmode="decimal"></td>
            <td><input type="text" class="calc-input" id="dy_${i}" placeholder="0.000" style="width:100px;padding:6px 8px;font-size:0.82rem;" inputmode="decimal"></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderStep4() {
    document.getElementById("prodCol1").textContent =
        (currentExercise.rows[0]?.country || currentExercise.rows[0]?.country_name) ? "Country" : "Year";

    const tbody = document.getElementById("step4Body");
    tbody.innerHTML = "";

    correctDeviations.forEach((d, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${d.label}</td>
            <td>${d.dx}</td>
            <td>${d.dy}</td>
            <td><input type="text" class="calc-input" id="prod_${i}" placeholder="0.000" style="width:90px;padding:6px 8px;font-size:0.82rem;" inputmode="decimal"></td>
            <td><input type="text" class="calc-input" id="sq2_${i}" placeholder="0.000" style="width:90px;padding:6px 8px;font-size:0.82rem;" inputmode="decimal"></td>
            <td><input type="text" class="calc-input" id="sq3_${i}" placeholder="0.000" style="width:90px;padding:6px 8px;font-size:0.82rem;" inputmode="decimal"></td>
        `;
        tbody.appendChild(tr);
    });

    const tfoot = document.getElementById("step4Foot");
    tfoot.innerHTML = `
        <tr style="background:#f5f3ff;">
            <td colspan="3" style="font-weight:700; text-align:right; color:#4c1d95;">Sums →</td>
            <td><input type="text" class="calc-input" id="sumXY" placeholder="Σ" style="width:90px;padding:6px 8px;font-size:0.82rem;" inputmode="decimal"></td>
            <td><input type="text" class="calc-input" id="sumX2" placeholder="Σ" style="width:90px;padding:6px 8px;font-size:0.82rem;" inputmode="decimal"></td>
            <td><input type="text" class="calc-input" id="sumY2" placeholder="Σ" style="width:90px;padding:6px 8px;font-size:0.82rem;" inputmode="decimal"></td>
        </tr>
    `;
}

function renderStep5() {
    document.getElementById("finalFormulaDisplay").innerHTML =
        `<strong>r = Σ[(X−X̄)(Y−Ȳ)] / √( Σ(X−X̄)² × Σ(Y−Ȳ)² )</strong><br><br>` +
        `Use your sums from Step 4:<br>` +
        `<span style="color:#6b21a8;">ΣXY = ${correctSumXY} &nbsp; ΣX² = ${correctSumX2} &nbsp; ΣY² = ${correctSumY2}</span><br><br>` +
        `Plug them in: <em>r = ΣXY / √(ΣX² × ΣY²)</em><br>` +
        `<span style="color:#dc2626; font-weight:600;">Your answer must be between −1 and 1.</span>`;
}

// step checks
function checkMeanX() {
    const val = parseFloat(document.getElementById("inputMeanX").value);
    const fb = document.getElementById("feedbackMeanX");
    const input = document.getElementById("inputMeanX");

    if (isNaN(val)) { fb.textContent = "Enter a number."; fb.className = "feedback-inline bad"; return; }

    if (withinTolerance(val, correctMeanX)) {
        fb.textContent = `✓ Correct! X̄ = ${correctMeanX}`;
        fb.className = "feedback-inline ok";
        input.classList.add("correct");
        meanXConfirmed = true;
        checkStep2Done();
    } else {
        fb.textContent = `✗ Not quite. Try again.`;
        fb.className = "feedback-inline bad";
        input.classList.add("incorrect");
        input.classList.remove("correct");
    }
}

function checkMeanY() {
    const val = parseFloat(document.getElementById("inputMeanY").value);
    const fb = document.getElementById("feedbackMeanY");
    const input = document.getElementById("inputMeanY");

    if (isNaN(val)) { fb.textContent = "Enter a number."; fb.className = "feedback-inline bad"; return; }

    if (withinTolerance(val, correctMeanY)) {
        fb.textContent = `✓ Correct! Ȳ = ${correctMeanY}`;
        fb.className = "feedback-inline ok";
        input.classList.add("correct");
        meanYConfirmed = true;
        checkStep2Done();
    } else {
        fb.textContent = `✗ Not quite. Try again.`;
        fb.className = "feedback-inline bad";
        input.classList.add("incorrect");
        input.classList.remove("correct");
    }
}

function checkStep2Done() {
    if (meanXConfirmed && meanYConfirmed) {
        document.getElementById("nextStep2").disabled = false;
        renderStep3();
    }
}

// deviations check
function checkAllDeviations() {
    let allCorrect = true;
    let wrongCount = 0;

    correctDeviations.forEach((d, i) => {
        const dxInput = document.getElementById(`dx_${i}`);
        const dyInput = document.getElementById(`dy_${i}`);
        const dxVal = parseFloat(dxInput?.value);
        const dyVal = parseFloat(dyInput?.value);

        const dxOk = !isNaN(dxVal) && withinTolerance(dxVal, d.dx, 0.1);
        const dyOk = !isNaN(dyVal) && withinTolerance(dyVal, d.dy, 0.1);

        if (dxInput) { dxInput.classList.toggle("correct", dxOk); dxInput.classList.toggle("incorrect", !dxOk); }
        if (dyInput) { dyInput.classList.toggle("correct", dyOk); dyInput.classList.toggle("incorrect", !dyOk); }

        if (!dxOk || !dyOk) { allCorrect = false; wrongCount++; }
    });

    const fb = document.getElementById("feedbackDeviations");

    if (allCorrect) {
        fb.textContent = "✓ All deviations correct! Continue to the next step.";
        fb.style.color = "#16a34a";
        document.getElementById("nextStep3").disabled = false;
        deviationsConfirmed = true;
        renderStep4();
    } else {
        fb.textContent = `${wrongCount} row(s) have errors. Check the highlighted cells — subtract the mean from each value.`;
        fb.style.color = "#dc2626";
    }
}

// products check
function checkAllProducts() {
    let allCorrect = true;
    let wrongCount = 0;

    correctProducts.forEach((p, i) => {
        const prodInput = document.getElementById(`prod_${i}`);
        const sq2Input = document.getElementById(`sq2_${i}`);
        const sq3Input = document.getElementById(`sq3_${i}`);

        const prodVal = parseFloat(prodInput?.value);
        const sq2Val = parseFloat(sq2Input?.value);
        const sq3Val = parseFloat(sq3Input?.value);

        const prodOk = !isNaN(prodVal) && withinTolerance(prodVal, p.dxdy, 0.1);
        const sq2Ok = !isNaN(sq2Val) && withinTolerance(sq2Val, p.dx2, 0.1);
        const sq3Ok = !isNaN(sq3Val) && withinTolerance(sq3Val, p.dy2, 0.1);

        [prodInput, sq2Input, sq3Input].forEach((inp, idx) => {
            const ok = [prodOk, sq2Ok, sq3Ok][idx];
            if (inp) { inp.classList.toggle("correct", ok); inp.classList.toggle("incorrect", !ok); }
        });

        if (!prodOk || !sq2Ok || !sq3Ok) { allCorrect = false; wrongCount++; }
    });

    const sumXYInput = document.getElementById("sumXY");
    const sumX2Input = document.getElementById("sumX2");
    const sumY2Input = document.getElementById("sumY2");

    const sumXYVal = parseFloat(sumXYInput?.value);
    const sumX2Val = parseFloat(sumX2Input?.value);
    const sumY2Val = parseFloat(sumY2Input?.value);

    const sumXYOk = !isNaN(sumXYVal) && withinTolerance(sumXYVal, correctSumXY, Math.max(0.1, Math.abs(correctSumXY) * 0.02));
    const sumX2Ok = !isNaN(sumX2Val) && withinTolerance(sumX2Val, correctSumX2, Math.max(0.1, Math.abs(correctSumX2) * 0.02));
    const sumY2Ok = !isNaN(sumY2Val) && withinTolerance(sumY2Val, correctSumY2, Math.max(0.1, Math.abs(correctSumY2) * 0.02));

    if (sumXYInput) { sumXYInput.classList.toggle("correct", sumXYOk); sumXYInput.classList.toggle("incorrect", !sumXYOk); }
    if (sumX2Input) { sumX2Input.classList.toggle("correct", sumX2Ok); sumX2Input.classList.toggle("incorrect", !sumX2Ok); }
    if (sumY2Input) { sumY2Input.classList.toggle("correct", sumY2Ok); sumY2Input.classList.toggle("incorrect", !sumY2Ok); }

    const fb = document.getElementById("feedbackProducts");

    if (allCorrect && sumXYOk && sumX2Ok && sumY2Ok) {
        fb.textContent = "✓ Everything correct! Proceed to the final step.";
        fb.style.color = "#16a34a";
        document.getElementById("nextStep4").disabled = false;
        productsConfirmed = true;
        renderStep5();
    } else {
        const totalErrors = wrongCount + (!sumXYOk ? 1 : 0) + (!sumX2Ok ? 1 : 0) + (!sumY2Ok ? 1 : 0);
        fb.textContent = `${totalErrors} value(s) are incorrect. Check the highlighted cells.`;
        fb.style.color = "#dc2626";
    }
}

function interpretR(r) {
    const abs = Math.abs(r);
    const dir = r > 0 ? "positive" : "negative";
    if (abs >= 0.9) return `Very strong ${dir} correlation — the indicators move almost perfectly together${r < 0 ? " in opposite directions" : ""}.`;
    if (abs >= 0.7) return `Strong ${dir} correlation — as one indicator rises, the other tends to ${r > 0 ? "rise" : "fall"} consistently.`;
    if (abs >= 0.5) return `Moderate ${dir} correlation — a noticeable trend exists but with meaningful variation.`;
    if (abs >= 0.3) return `Weak ${dir} correlation — a slight pattern exists but it is not very reliable.`;
    return `Little to no linear correlation — the two indicators do not have a consistent linear relationship.`;
}

function prefillRelationship() {
    const sel = document.getElementById("relationshipSelect");
    if (!sel || sel.value) return;
    const label = (currentExercise?.relationship_label || "").toLowerCase();
    if (label.includes("negative")) sel.value = "negative";
    else if (label.includes("none") || label.includes("no")) sel.value = "none";
    else if (label.includes("positive")) sel.value = "positive";
}

// final answer check
function checkFinalAnswer() {
    const rawVal = document.getElementById("userCorrelationInput")?.value?.trim();
    const fb = document.getElementById("answerFeedback");
    const input = document.getElementById("userCorrelationInput");

    if (!rawVal) { fb.textContent = "Enter your answer first."; fb.className = ""; return; }

    const userVal = Number(rawVal);
    if (isNaN(userVal) || userVal < -1 || userVal > 1) {
        fb.textContent = "Enter a number between -1 and 1.";
        fb.className = "";
        return;
    }

    const correct = Number(hiddenCorrelationAnswer.toFixed(3));
    const diff = Math.abs(userVal - correct);
    const interpretation = interpretR(correct);

    if (diff <= 0.01) {
        fb.innerHTML = `✓ Exact. Your answer: <strong>${userVal}</strong>. Correct answer: <strong>${correct}</strong>.<br><br>${interpretation}`;
        fb.className = "feedback-correct";
        input.classList.add("correct");
        document.getElementById("submitSection").style.display = "flex";
        prefillRelationship();
    } else if (diff <= 0.05) {
        fb.innerHTML = `✓ Very close. Your answer: <strong>${userVal}</strong>. Correct: <strong>${correct}</strong> (off by ${diff.toFixed(3)}).<br><br>${interpretation}`;
        fb.className = "feedback-close";
        input.classList.add("correct");
        document.getElementById("submitSection").style.display = "flex";
        prefillRelationship();
    } else if (diff <= 0.15) {
        fb.innerHTML = `△ Not quite. Your answer: <strong>${userVal}</strong>. Correct: <strong>${correct}</strong> (off by ${diff.toFixed(3)}). Double-check your sums from Step 4.`;
        fb.className = "feedback-close";
        input.classList.remove("correct");
        input.classList.add("incorrect");
    } else {
        const signHint = Math.sign(userVal) !== Math.sign(correct)
            ? " Your sign is wrong too — check whether X and Y move in the same direction or opposite directions."
            : " Recheck your sums from Step 4 and the denominator calculation.";
        fb.innerHTML = `✗ Incorrect. Your answer: <strong>${userVal}</strong>. Correct: <strong>${correct}</strong> (off by ${diff.toFixed(3)}).${signHint}`;
        fb.className = "feedback-incorrect";
        input.classList.add("incorrect");
        input.classList.remove("correct");
    }
}

// save
function handleSaveExercise() {
    if (!isLoggedIn()) { alert("Please log in to save."); window.location.href = "login.html"; return; }
    if (!currentExercise) { alert("No dataset loaded."); return; }
    const box = document.getElementById("saveExerciseInline");
    if (box) { box.classList.add("visible"); document.getElementById("exerciseNameInput")?.focus(); }
}

async function confirmSave() {
    const input = document.getElementById("exerciseNameInput");
    const box = document.getElementById("saveExerciseInline");
    const name = input ? input.value.trim() : "";
    if (!name) { if (input) input.classList.add("input-error"); return; }
    if (input) input.classList.remove("input-error");

    try {
        const payload = { ...currentExercise, name };
        const res = await fetch(`${API_BASE}/gapminder/save-exercise`, {
            method: "POST",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (!res.ok) { alert(result.detail || "Could not save exercise."); return; }

        currentExercise.name = name;
        currentExercise.exercise_id = result.exercise_id;
        sessionStorage.setItem("current_saved_exercise", JSON.stringify(currentExercise));
        sessionStorage.setItem("current_exercise_id", String(result.exercise_id));

        if (box) box.classList.remove("visible");
        if (input) input.value = "";
        alert("Exercise saved successfully.");
    } catch (err) {
        console.error(err);
        alert("Could not save exercise.");
    }
}

function cancelSave() {
    const box = document.getElementById("saveExerciseInline");
    const input = document.getElementById("exerciseNameInput");
    if (box) box.classList.remove("visible");
    if (input) { input.value = ""; input.classList.remove("input-error"); }
}

// submit
async function saveAndSubmit() {
    if (!isLoggedIn()) { alert("Please log in to submit."); window.location.href = "login.html"; return; }
    if (!currentExercise) { alert("No dataset loaded."); return; }

    const nameInput = document.getElementById("exerciseNameInput");
    const selectedLabel = document.getElementById("relationshipSelect")?.value;
    const explanation = document.getElementById("verbalExplanation")?.value.trim();
    const exerciseName = nameInput ? nameInput.value.trim() : "";

    if (!exerciseName) { if (nameInput) { nameInput.style.borderColor = "#ef4444"; nameInput.focus(); } alert("Give your exercise a name first."); return; }
    if (!selectedLabel) { alert("Select the type of correlation."); return; }
    if (!explanation) { alert("Write your explanation first."); return; }

    const submitBtn = document.querySelector(".submit-btn");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Saving & Submitting..."; }

    try {
        
        let exerciseId = currentExercise.exercise_id || Number(sessionStorage.getItem("current_exercise_id")) || null;

        if (!exerciseId) {
            const savePayload = { ...currentExercise, name: exerciseName };
            const saveRes = await fetch(`${API_BASE}/gapminder/save-exercise`, {
                method: "POST",
                headers: authHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify(savePayload)
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
            body: JSON.stringify({ exercise_id: exerciseId, student_selected_label: selectedLabel, student_explanation: explanation, student_pearson_r: parseFloat(document.getElementById("userCorrelationInput")?.value) || null })
        });
        const subResult = await subRes.json();
        if (!subRes.ok) { alert(subResult.detail || "Could not submit exercise."); return; }

        alert("Saved and submitted! Your teacher will leave feedback on your My Submissions page.");
        window.location.href = "Submissions.html";
    } catch (err) {
        console.error(err);
        alert("Could not save and submit. Please try again.");
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Save & Submit for Grading"; }
    }
}

// init
document.addEventListener("DOMContentLoaded", () => {
    populateStudentDropdown();
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
    prepareCalculations(currentExercise);
});