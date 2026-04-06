// state
let diffChart = null;
let latestGenerated = null;
let latestSavedExerciseId = null;
let hiddenCorrelationAnswer = null;
let allIndicatorOptions = [];
let allCountryOptions = [];
let whatIfActive = false;
let whatIfRows = [];

// load indicators
async function loadIndicators(search = "") {
    try {
        setStatus("Loading indicators...");

        
        const statusRes = await fetch(`${API_BASE}/gapminder/data-status`);
        if (statusRes.ok) {
            const status = await statusRes.json();
            if (!status.has_data) {
                setStatus("⚠️ No indicator data found in the database. An administrator needs to import Gapminder datasets via the /gapminder/import endpoint first.");
                return;
            }
        }

        const indicators = await fetchIndicators(search);
        allIndicatorOptions = indicators;
        fillIndicatorSelect("indicator1Select", indicators, "Indicator 1");
        fillIndicatorSelect("indicator2Select", indicators, "Indicator 2");
        setStatus("Choose both indicators, a year range, and one country.");
    } catch (err) {
        console.error(err);
        setStatus("Could not load indicators. Make sure the backend is running at " + API_BASE);
    }
}

// suggestions
function filterIndicatorSuggestions(text, boxId, type) {
    const query = text.trim().toLowerCase();
    const filtered = allIndicatorOptions.filter((item) => {
        const code = (item.indicator_code || "").toLowerCase();
        const name = (item.indicator_name || "").toLowerCase();
        return code.includes(query) || name.includes(query);
    });
    renderSuggestions(boxId, filtered, type, {
        onIndicatorSelect: async (t, code, name) => {
            if (t === "indicator1") {
                document.getElementById("indicator1Select").value = code;
                document.getElementById("indicator-search").value = `${name} (${code})`;
                await refreshFilters();
            } else {
                document.getElementById("indicator2Select").value = code;
                document.getElementById("indicator2Search").value = `${name} (${code})`;
            }
        }
    });
}

// country suggestions
function filterCountrySuggestions(text) {
    const query = text.trim().toLowerCase();
    const filtered = allCountryOptions.filter((item) => {
        const code = (item.country_code || "").toLowerCase();
        const name = (item.country || "").toLowerCase();
        return code.includes(query) || name.includes(query);
    });
    renderSuggestions("countrySuggestions", filtered, "country", {
        onCountrySelect: (code, name) => {
            const countrySelect = document.getElementById("countrySelect");
            const countrySearch = document.getElementById("countrySearch");
            if (countrySelect) countrySelect.value = code;
            if (countrySearch) countrySearch.value = `${name} (${code})`;
        }
    });
}

// filters
async function refreshFilters() {
    const indicator1 = document.getElementById("indicator1Select")?.value;
    if (!indicator1) {
        fillSelect("startYearSelect", [], "Start Year");
        fillSelect("endYearSelect", [], "End Year");
        fillSelect("countrySelect", [], "Country Name");
        allCountryOptions = [];
        renderSuggestions("countrySuggestions", [], "country");
        return;
    }

    try {
        const [years, countries] = await Promise.all([
            fetchYears(indicator1),
            fetchCountries(indicator1)
        ]);
        allCountryOptions = countries;
        fillSelect("startYearSelect", years, "Start Year");
        fillSelect("endYearSelect", years, "End Year");
        fillSelect("countrySelect", countries, "Country Name");
    } catch (err) {
        console.error(err);
        setStatus("Could not load year/country filters.");
    }
}

function pearsonR(rows) {
    const n = rows.length;
    if (n < 2) return null;
    const xs = rows.map(r => r.indicator_1_value);
    const ys = rows.map(r => r.indicator_2_value);
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    const num = xs.reduce((sum, x, i) => sum + (x - meanX) * (ys[i] - meanY), 0);
    const denX = Math.sqrt(xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0));
    const denY = Math.sqrt(ys.reduce((sum, y) => sum + (y - meanY) ** 2, 0));
    if (denX === 0 || denY === 0) return null;
    return num / (denX * denY);
}

// render table
function renderTable(rows) {
    const tbody = document.querySelector("#table1 tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!rows || rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3">No dataset generated yet.</td></tr>`;
        return;
    }

    rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.year ?? ""}</td>
            <td>${row.indicator_1_value ?? ""}</td>
            <td>${row.indicator_2_value ?? ""}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderWhatIfTable(rows) {
    const tbody = document.querySelector("#table1 tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    rows.forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.year ?? ""}</td>
            <td><input type="number" class="whatif-input" data-row="${i}" data-col="1" value="${row.indicator_1_value ?? ""}"></td>
            <td><input type="number" class="whatif-input" data-row="${i}" data-col="2" value="${row.indicator_2_value ?? ""}"></td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".whatif-input").forEach(input => {
        input.addEventListener("input", onWhatIfInput);
    });
}

function onWhatIfInput(e) {
    const i = Number(e.target.dataset.row);
    const col = Number(e.target.dataset.col);
    const val = parseFloat(e.target.value);

    if (isNaN(val)) return;

    if (col === 1) whatIfRows[i].indicator_1_value = val;
    else whatIfRows[i].indicator_2_value = val;

    const r = pearsonR(whatIfRows);
    const display = document.getElementById("whatIfR");
    if (display) {
        display.textContent = r !== null ? `r = ${r.toFixed(4)}` : "r = —";
        display.className = "whatif-r-display" + (r !== null && Math.abs(r - hiddenCorrelationAnswer) > 0.05 ? " whatif-r-changed" : "");
    }

    renderChart(whatIfRows, latestGenerated.indicator_1_name, latestGenerated.indicator_2_name);
}

function enterWhatIfMode() {
    if (!latestGenerated) { alert("Generate a dataset first."); return; }

    whatIfActive = true;
    whatIfRows = latestGenerated.rows.map(r => ({ ...r }));

    const banner = document.getElementById("whatIfBanner");
    if (banner) banner.style.display = "flex";

    const btn = document.getElementById("whatIfBtn");
    if (btn) btn.style.display = "none";

    renderWhatIfTable(whatIfRows);

    const display = document.getElementById("whatIfR");
    if (display) display.textContent = "Edit values above to see r update.";
}

function exitWhatIfMode() {
    whatIfActive = false;
    whatIfRows = [];

    const banner = document.getElementById("whatIfBanner");
    if (banner) banner.style.display = "none";

    const btn = document.getElementById("whatIfBtn");
    if (btn) btn.style.display = "block";

    const display = document.getElementById("whatIfR");
    if (display) display.textContent = "";

    if (latestGenerated) {
        renderTable(latestGenerated.rows);
        renderChart(latestGenerated.rows, latestGenerated.indicator_1_name, latestGenerated.indicator_2_name);
    }
}

// render chart
function renderChart(rows, indicator1Name, indicator2Name) {
    const canvas = document.getElementById("diffChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const labels = rows.map((row) => row.year);
    const data1 = rows.map((row) => row.indicator_1_value);
    const data2 = rows.map((row) => row.indicator_2_value);

    if (diffChart) diffChart.destroy();

    diffChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                { label: indicator1Name, data: data1, borderWidth: 2, tension: 0.15 },
                { label: indicator2Name, data: data2, borderWidth: 2, tension: 0.15 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ui state
function setPostGenerateState() {
    
    const guideBtn = document.getElementById("goToGuideBtn");
    const saveBtn = document.getElementById("saveExerciseBtn");
    const exportBtn = document.getElementById("exportCsvBtn");
    const whatIfBtn = document.getElementById("whatIfBtn");

    if (guideBtn) {
        guideBtn.style.background = "#7c3aed";
        guideBtn.style.color = "#fff";
        guideBtn.style.fontWeight = "700";
        guideBtn.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.3)";
    }
    if (saveBtn) saveBtn.style.opacity = "1";
    if (exportBtn) exportBtn.style.opacity = "1";
    if (whatIfBtn) { whatIfBtn.style.display = "block"; whatIfBtn.style.opacity = "1"; }
}

function resetButtonState() {
    const guideBtn = document.getElementById("goToGuideBtn");
    if (guideBtn) {
        guideBtn.style.background = "";
        guideBtn.style.color = "";
        guideBtn.style.fontWeight = "";
        guideBtn.style.boxShadow = "";
    }
}

// form helpers
function getCurrentSelections() {
    return {
        indicator1Code: document.getElementById("indicator1Select")?.value || "",
        indicator2Code: document.getElementById("indicator2Select")?.value || "",
        startYear: document.getElementById("startYearSelect")?.value || "",
        endYear: document.getElementById("endYearSelect")?.value || "",
        country: document.getElementById("countrySelect")?.value || ""
    };
}

function validateSelections() {
    const { indicator1Code, indicator2Code, startYear, endYear, country } = getCurrentSelections();
    if (!indicator1Code || !indicator2Code || !startYear || !endYear || !country) {
        alert("Choose both indicators, a start year, an end year, and a country.");
        return false;
    }
    if (indicator1Code === indicator2Code) { alert("Choose two different indicators."); return false; }
    if (Number(startYear) > Number(endYear)) { alert("Start year must be before or equal to end year."); return false; }
    return true;
}

// generate dataset
async function handleGenerateDataset() {
    if (!validateSelections()) return;

    const { indicator1Code, indicator2Code, startYear, endYear, country } = getCurrentSelections();
    const btn = document.getElementById("generateDatasetBtn");

    try {
        if (btn) { btn.disabled = true; btn.textContent = "Generating..."; }
        setStatus("Generating dataset...");

        if (whatIfActive) exitWhatIfMode();

        const generateRes = await fetch(`${API_BASE}/gapminder/generate-dataset`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                indicator_1: indicator1Code,
                indicator_2: indicator2Code,
                countries: [country],
                start_year: Number(startYear),
                end_year: Number(endYear)
            })
        });

        const generated = await generateRes.json();
        if (!generateRes.ok) { alert(generated.detail || "Could not generate dataset."); return; }

        const correlationRes = await fetch(`${API_BASE}/gapminder/correlation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows: generated.rows })
        });

        const correlation = await correlationRes.json();
        if (!correlationRes.ok) { alert(correlation.detail || "Could not calculate correlation."); return; }

        hiddenCorrelationAnswer = Number(correlation.pearson_r);

        latestGenerated = {
            indicator_1_code: generated.indicator_1.code,
            indicator_1_name: generated.indicator_1.name,
            indicator_2_code: generated.indicator_2.code,
            indicator_2_name: generated.indicator_2.name,
            countries: generated.countries_requested,
            start_year: generated.start_year,
            end_year: generated.end_year,
            rows: generated.rows,
            pearson_r: hiddenCorrelationAnswer,
            relationship_label: correlation.relationship_label,
            points_used: generated.points_used,
            points_skipped: generated.points_skipped
        };

        latestSavedExerciseId = null;
        saveGeneratedExercise(latestGenerated);

        renderTable(generated.rows);
        renderChart(generated.rows, generated.indicator_1.name, generated.indicator_2.name);
        setStatus(`Dataset ready. Points used: ${generated.points_used}. Next: open the Correlation Guide page to solve Pearson's r.`);

        setPostGenerateState();
    } catch (err) {
        console.error(err);
        alert("Could not generate dataset.");
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "Generate Dataset"; }
    }
}

// save exercise
function handleSaveExercise() {
    if (!requireLoginForAction()) return;
    if (!latestGenerated) { alert("Generate a dataset first."); return; }

    const inlineBox = document.getElementById("saveExerciseInline");
    const input = document.getElementById("exerciseNameInput");
    if (inlineBox) { inlineBox.style.display = "block"; }
    if (input) input.focus();
}

async function confirmSave() {
    const input = document.getElementById("exerciseNameInput");
    const inlineBox = document.getElementById("saveExerciseInline");
    const exerciseName = input ? input.value.trim() : "";

    if (!exerciseName) {
        if (input) { input.classList.add("input-error"); input.placeholder = "Name is required"; }
        return;
    }

    if (input) input.classList.remove("input-error");

    try {
        const result = await saveExerciseToServer(latestGenerated, exerciseName);
        latestSavedExerciseId = result.exercise_id;
        latestGenerated.name = exerciseName;
        latestGenerated.exercise_id = result.exercise_id;
        saveGeneratedExercise(latestGenerated);
        saveCurrentExercise(latestGenerated);
        setStatus(`Exercise saved as "${exerciseName}".`);
        if (inlineBox) inlineBox.style.display = "none";
        if (input) input.value = "";
    } catch (err) {
        console.error(err);
        alert(err.message || "Could not save exercise.");
    }
}

function cancelSave() {
    const inlineBox = document.getElementById("saveExerciseInline");
    const input = document.getElementById("exerciseNameInput");
    if (inlineBox) inlineBox.style.display = "none";
    if (input) { input.value = ""; input.classList.remove("input-error"); }
}

async function handleExportCsv() {
    if (!requireLoginForAction()) return;
    if (!latestGenerated) { alert("Generate a dataset first."); return; }
    try {
        await exportExerciseCsv(latestGenerated);
    } catch (err) {
        console.error(err);
        alert(err.message || "Could not export CSV.");
    }
}

// navigation
function goToCalculationGuide() {
    if (!latestGenerated) { alert("Generate a dataset first."); return; }
    if (whatIfActive) exitWhatIfMode();
    saveGeneratedExercise(latestGenerated);
    window.location.href = "CalculationGuide.html";
}

function clearFormInputs() {
    ["indicator-search", "indicator2Search", "indicator1Select", "indicator2Select",
     "startYearSelect", "endYearSelect", "countrySearch", "countrySelect"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.tagName === "SELECT" ? (el.selectedIndex = 0) : (el.value = "");
    });
    hideSuggestionBoxes("indicator1Suggestions", "indicator2Suggestions", "countrySuggestions");
}

function clearUnsavedExerciseState() {
    latestGenerated = null;
    latestSavedExerciseId = null;
    hiddenCorrelationAnswer = null;
    sessionStorage.removeItem("loaded_saved_exercise");
    sessionStorage.removeItem("current_generated_exercise");
}

// new exercise
function handleNewExercise() {
    if (whatIfActive) exitWhatIfMode();
    clearUnsavedExerciseState();
    clearFormInputs();
    renderTable([]);
    if (diffChart) { diffChart.destroy(); diffChart = null; }
    const whatIfBtn = document.getElementById("whatIfBtn");
    if (whatIfBtn) whatIfBtn.style.display = "none";
    setStatus("Start a new exercise by choosing indicators, years, and a country.");
}

function startTutorial() {
    alert(
        "Tutorial:\n\n" +
        "1. Search and click indicator 1.\n" +
        "2. Search and click indicator 2.\n" +
        "3. Choose start and end year.\n" +
        "4. Search and click a country.\n" +
        "5. Click Generate Dataset.\n" +
        "6. Click Continue to Correlation Guide.\n"
    );
}

// restore saved
function restoreSavedExerciseOnly() {
    const saved = sessionStorage.getItem("loaded_saved_exercise");
    if (!saved) return;

    try {
        const loaded = JSON.parse(saved);
        latestGenerated = loaded;
        latestSavedExerciseId = loaded.exercise_id || null;
        hiddenCorrelationAnswer = typeof loaded.pearson_r === "number"
            ? loaded.pearson_r
            : Number(loaded.pearson_r);

        renderTable(loaded.rows || []);
        renderChart(loaded.rows || [], loaded.indicator_1_name || "Indicator 1", loaded.indicator_2_name || "Indicator 2");
        setStatus(`Saved exercise loaded${loaded.name ? `: ${loaded.name}` : ""}.`);

        setPostGenerateState();
    } catch (err) {
        console.error(err);
    } finally {
        sessionStorage.removeItem("loaded_saved_exercise");
    }
}

// wire nav
function wireNavigation() {
    wireCommonNavigation({
        clearStateOnHome: true,
        clearStateOnNav: true,
        backHref: "ExploreData1.html",
        clearStateOnBack: true
    });
}

// wire buttons
function wirePageButtons() {
    document.getElementById("generateDatasetBtn")?.addEventListener("click", handleGenerateDataset);
    document.getElementById("goToGuideBtn")?.addEventListener("click", goToCalculationGuide);
    document.getElementById("saveExerciseBtn")?.addEventListener("click", handleSaveExercise);
    document.getElementById("confirmSaveBtn")?.addEventListener("click", confirmSave);
    document.getElementById("cancelSaveBtn")?.addEventListener("click", cancelSave);
    document.getElementById("exportCsvBtn")?.addEventListener("click", handleExportCsv);
    document.getElementById("newExerciseBtn")?.addEventListener("click", handleNewExercise);
    document.getElementById("tutorialBtn")?.addEventListener("click", startTutorial);
    document.getElementById("whatIfBtn")?.addEventListener("click", enterWhatIfMode);
    document.getElementById("whatIfResetBtn")?.addEventListener("click", exitWhatIfMode);
}

function wireSearchInputs() {
    document.getElementById("indicator-search")?.addEventListener("input", (e) => {
        filterIndicatorSuggestions(e.target.value, "indicator1Suggestions", "indicator1");
    });
    document.getElementById("indicator2Search")?.addEventListener("input", (e) => {
        filterIndicatorSuggestions(e.target.value, "indicator2Suggestions", "indicator2");
    });
    document.getElementById("countrySearch")?.addEventListener("input", (e) => {
        filterCountrySuggestions(e.target.value);
    });
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-filter-container")) {
            hideSuggestionBoxes("indicator1Suggestions", "indicator2Suggestions", "countrySuggestions");
        }
    });
}

// init
document.addEventListener("DOMContentLoaded", async () => {
    populateStudentDropdown();
    wireNavigation();
    wirePageButtons();
    wireSearchInputs();

    await loadIndicators();
    document.getElementById("indicator1Select")?.addEventListener("change", refreshFilters);
    await refreshFilters();

    
    const shouldRestore = sessionStorage.getItem("restore_from_guide") === "1";
    const savedExercise = sessionStorage.getItem("current_generated_exercise");

    if (shouldRestore && savedExercise) {
        sessionStorage.removeItem("restore_from_guide");
        try {
            const ex = JSON.parse(savedExercise);
            
            const isOverTime = ex.start_year !== ex.end_year;
            const isMultiCountry = (ex.countries || []).length > 1;
            if (isOverTime || !isMultiCountry) {
                latestGenerated = ex;
                latestSavedExerciseId = ex.exercise_id || null;
                hiddenCorrelationAnswer = typeof ex.pearson_r === "number" ? ex.pearson_r : Number(ex.pearson_r);
                renderTable(ex.rows || []);
                renderChart(ex.rows || [], ex.indicator_1_name || "Indicator 1", ex.indicator_2_name || "Indicator 2");
                setStatus(`Dataset restored: ${ex.name || ex.indicator_1_name + " vs " + ex.indicator_2_name}`);
                setPostGenerateState();
            }
        } catch(e) { console.error("Could not restore exercise:", e); }
    } else {
        restoreSavedExerciseOnly();
    }
});