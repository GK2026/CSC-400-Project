/*******************************
 * ORIGINAL NAVIGATION LOGIC
 *******************************/

// Breadcrumb Navigation
document.getElementById('Return')?.addEventListener('click', () => {
    window.location.href = 'Home.html';
});

document.getElementById('Back')?.addEventListener('click', () => {
    window.location.href = 'ExploreData1.html';
});

document.getElementById('Current')?.addEventListener('click', () => {
    window.location.href = 'ExploreData3.html';
});

// Navbar Links (only if present)
document.getElementById('link-explore')?.addEventListener('click', () => {
    window.location.href = 'ExploreData1.html';
});

// Edited By Amir
document.getElementById('link-correlation')?.addEventListener('click', () => {
    window.location.href = 'correlation.html';
});

// Student Button (example)
document.getElementById('studentBtn')?.addEventListener('click', () => {
    alert('Student profile feature coming soon!');
});


/*******************************
 * TABLE → SCATTER GRAPH LOGIC
 *******************************/

let chart;

// Edited By Amir
const API_BASE = "http://127.0.0.1:8000/gapminder";

// Edited By Amir
let indicatorFileMap = {};
let countryNameMap = {};
let selectedCountries = [];

// Edited By Amir
async function loadCountryNames() {
    try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=cca3,name");
        const data = await res.json();

        countryNameMap = {};

        data.forEach(country => {
            if (country.cca3 && country.name?.common) {
                countryNameMap[country.cca3.toLowerCase()] = country.name.common;
            }
        });
    } catch (err) {
        console.error("Failed to load country names:", err);
    }
}

// Edited By Amir
function setStatus(message) {
    const status = document.getElementById("statusMessage");
    if (status) status.textContent = message;
}

// Edited By Amir
function formatCountryName(code) {
    return countryNameMap[code?.toLowerCase()] || code?.toUpperCase() || code;
}

// Edited By Amir
function formatIndicatorName(indicatorCode) {
    return indicatorCode.replaceAll("_", " ");
}

// Edited By Amir
async function loadDatasets() {
    const res = await fetch(`${API_BASE}/datasets?limit=500`);
    return await res.json();
}

// Edited By Amir
async function importIndicatorIfNeeded(indicatorCode) {
    const filename = indicatorFileMap[indicatorCode];
    if (!filename) return false;

    setStatus(`Loading dataset for ${formatIndicatorName(indicatorCode)}...`);

    try {
        const response = await fetch(`${API_BASE}/import?filename=${encodeURIComponent(filename)}`, {
            method: "POST"
        });

        const result = await response.json();
        console.log("Import result:", result);

        if (result.error) {
            setStatus(`Could not load dataset for ${formatIndicatorName(indicatorCode)}.`);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Failed to import indicator dataset:", err);
        setStatus(`Failed to load dataset for ${formatIndicatorName(indicatorCode)}.`);
        return false;
    }
}

// Edited By Amir
async function populateIndicatorDropdown() {
    const indicatorSelect = document.getElementById("indicatorSelect");
    if (!indicatorSelect) return;

    const datasetResponse = await loadDatasets();
    const datasets = datasetResponse.datasets || [];

    indicatorFileMap = {};
    indicatorSelect.innerHTML = '<option value="">Select 1 Indicator</option>';

    datasets.forEach((fileName) => {
        const prefix = "ddf--datapoints--";
        const suffix = "--by--geo--time.csv";

        if (!fileName.startsWith(prefix) || !fileName.endsWith(suffix)) return;

        const indicatorCode = fileName.slice(prefix.length, fileName.length - suffix.length);
        indicatorFileMap[indicatorCode] = fileName;

        const option = document.createElement("option");
        option.value = indicatorCode;
        option.textContent = formatIndicatorName(indicatorCode);
        indicatorSelect.appendChild(option);
    });
}

// Edited By Amir
async function populateYearDropdown(indicatorCode) {
    const yearSelect = document.getElementById("yearSelect");
    if (!yearSelect) return;

    const res = await fetch(`${API_BASE}/years?indicator_code=${encodeURIComponent(indicatorCode)}`);
    const years = await res.json();

    yearSelect.innerHTML = '<option value="">Select 1 Year</option>';

    years.forEach((year) => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

// Edited By Amir
async function populateCountryDropdown(indicatorCode, year = null) {
    const countrySelect = document.getElementById("countrySelect");
    if (!countrySelect) return;

    let url = `${API_BASE}/countries?indicator_code=${encodeURIComponent(indicatorCode)}`;
    if (year) {
        url += `&year=${encodeURIComponent(year)}`;
    }

    const res = await fetch(url);
    const countries = await res.json();

    const oldSelected = [...selectedCountries];

    countrySelect.innerHTML = '<option value="">Select 1 Country</option>';

    countries.forEach((code) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = formatCountryName(code);
        countrySelect.appendChild(option);
    });

    // Edited By Amir
    selectedCountries = selectedCountries.filter(code => countries.includes(code));

    if (oldSelected.length !== selectedCountries.length) {
        renderSelectedCountriesTable();
    }
}

// Edited By Amir
function renderSelectedCountriesTable() {
    const tbody = document.querySelector("#selectedCountriesTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (selectedCountries.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="2">No countries selected yet</td>`;
        tbody.appendChild(tr);
        return;
    }

    selectedCountries.forEach((code) => {
        const tr = document.createElement("tr");

        const countryCell = document.createElement("td");
        countryCell.textContent = formatCountryName(code);

        const removeCell = document.createElement("td");
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "Remove";

        removeBtn.addEventListener("click", () => {
            selectedCountries = selectedCountries.filter(c => c !== code);
            renderSelectedCountriesTable();
            loadBackendData();
        });

        removeCell.appendChild(removeBtn);
        tr.appendChild(countryCell);
        tr.appendChild(removeCell);
        tbody.appendChild(tr);
    });
}

// Edited By Amir
function addSelectedCountry() {
    const countrySelect = document.getElementById("countrySelect");
    const selectedCode = countrySelect?.value;

    if (!selectedCode) {
        alert("Please choose a country first.");
        return;
    }

    if (selectedCountries.includes(selectedCode)) {
        alert("That country is already added.");
        return;
    }

    if (selectedCountries.length >= 10) {
        alert("You can only add up to 10 countries.");
        return;
    }

    const confirmed = confirm(`Add ${formatCountryName(selectedCode)} to the table and graph?`);
    if (!confirmed) return;

    selectedCountries.push(selectedCode);
    renderSelectedCountriesTable();
    loadBackendData();
}

// Edited By Amir
function clearSelectedCountries() {
    selectedCountries = [];
    renderSelectedCountriesTable();
    loadBackendData();
}

// Edited By Amir
async function loadBackendData() {
    try {
        const indicatorCode = document.getElementById("indicatorSelect")?.value;
        const year = document.getElementById("yearSelect")?.value;

        if (!indicatorCode || !year || selectedCountries.length === 0) {
            setStatus("Choose an indicator, a year, and add at least one country.");
            const tbody = document.querySelector("#dataTable tbody");
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="2">No data selected yet</td></tr>`;
            }
            if (chart) {
                chart.destroy();
                chart = null;
            }
            return;
        }

        setStatus("Loading table and graph...");

        const res = await fetch(
            `${API_BASE}/compare?indicator_code=${encodeURIComponent(indicatorCode)}&year=${encodeURIComponent(year)}&country_codes=${encodeURIComponent(selectedCountries.join(","))}`
        );

        const data = await res.json();

        const tbody = document.querySelector("#dataTable tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2">No data available for that indicator / year / country combination.</td></tr>`;
            setStatus("No data available for that selection.");
            if (chart) {
                chart.destroy();
                chart = null;
            }
            return;
        }

        data.forEach((row) => {
            const tr = document.createElement("tr");

            const countryCell = document.createElement("td");
            countryCell.contentEditable = "true";
            countryCell.innerText = formatCountryName(row.country);

            const valueCell = document.createElement("td");
            valueCell.contentEditable = "true";
            valueCell.innerText = row.value;

            tr.appendChild(countryCell);
            tr.appendChild(valueCell);
            tbody.appendChild(tr);
        });

        attachTableListeners();
        updateChart(indicatorCode, year);
        setStatus(`Showing ${data.length} countries for ${formatIndicatorName(indicatorCode)} in ${year}.`);
    } catch (err) {
        console.error("Failed to load backend data:", err);
        setStatus("Failed to load backend data.");
    }
}

// Read table values and convert to scatter points
function getTableData() {
    const rows = document.querySelectorAll("#dataTable tbody tr");
    let points = [];

    rows.forEach((row, index) => {
        if (!row.cells[1]) return;

        const value = parseFloat(row.cells[1].innerText);
        if (!isNaN(value)) {
            points.push({
                x: index + 1,
                y: value
            });
        }
    });

    return points;
}

// Edited By Amir
function getXAxisLabels() {
    const rows = document.querySelectorAll("#dataTable tbody tr");
    let labels = [];

    rows.forEach((row) => {
        if (!row.cells[0] || !row.cells[1]) return;
        const value = parseFloat(row.cells[1].innerText);
        if (!isNaN(value)) {
            labels.push(row.cells[0].innerText);
        }
    });

    return labels;
}

// Draw / update scatter chart
// Edited By Amir
function updateChart(indicatorCode = "", year = "") {
    const canvas = document.getElementById("dataChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dataPoints = getTableData();
    const xLabels = getXAxisLabels();

    if (chart) chart.destroy();

    if (dataPoints.length === 0) return;

    chart = new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: `${formatIndicatorName(indicatorCode)} (${year})`,
                data: dataPoints,
                backgroundColor: "#7c3aed",
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Country"
                    },
                    ticks: {
                        callback: function(value) {
                            return xLabels[value - 1] || value;
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Value"
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw.y}`
                    }
                }
            }
        }
    });
}

// Edited By Amir
function attachTableListeners() {
    document.querySelectorAll("#dataTable td").forEach(cell => {
        cell.addEventListener("input", () => {
            const indicatorCode = document.getElementById("indicatorSelect")?.value || "";
            const year = document.getElementById("yearSelect")?.value || "";
            updateChart(indicatorCode, year);
        });
    });
}

// Edited By Amir
document.getElementById("indicatorSelect")?.addEventListener("change", async () => {
    const indicatorCode = document.getElementById("indicatorSelect")?.value;
    if (!indicatorCode) {
        setStatus("Choose an indicator to begin.");
        return;
    }

    selectedCountries = [];
    renderSelectedCountriesTable();

    const imported = await importIndicatorIfNeeded(indicatorCode);
    if (!imported) return;

    await populateYearDropdown(indicatorCode);
    await populateCountryDropdown(indicatorCode);

    setStatus("Indicator loaded. Choose a year, then add countries.");
});

// Edited By Amir
document.getElementById("yearSelect")?.addEventListener("change", async () => {
    const indicatorCode = document.getElementById("indicatorSelect")?.value;
    const year = document.getElementById("yearSelect")?.value;

    if (!indicatorCode) return;

    await populateCountryDropdown(indicatorCode, year);
    loadBackendData();
});

// Edited By Amir
document.getElementById("addCountryBtn")?.addEventListener("click", addSelectedCountry);

// Edited By Amir
document.getElementById("clearCountriesBtn")?.addEventListener("click", clearSelectedCountries);

// Edited By Amir
document.getElementById("indicatorSearch")?.addEventListener("input", (e) => {
    const searchValue = e.target.value.toLowerCase();
    const indicatorSelect = document.getElementById("indicatorSelect");

    Array.from(indicatorSelect.options).forEach((option) => {
        if (option.value === "") {
            option.hidden = false;
            return;
        }

        option.hidden = !option.textContent.toLowerCase().includes(searchValue);
    });
});

// Initial render
// Edited By Amir
window.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadCountryNames();
        await populateIndicatorDropdown();
        renderSelectedCountriesTable();
        setStatus("Choose an indicator to begin.");
    } catch (err) {
        console.error("Failed to initialize ExploreData3 page:", err);
        setStatus("Failed to initialize page.");
    }
});