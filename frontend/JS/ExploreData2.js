let diffChart;

// Edited By Amir
const API_BASE = "http://127.0.0.1:8000/gapminder";

// Edited By Amir
let indicatorFileMap = {};
let countryNameMap = {};

// --------------------- Init ---------------------
document.addEventListener("DOMContentLoaded", async () => {
    attachBreadcrumbListeners();
    attachFilterListeners();
    attachTableListeners();

    try {
        await loadCountryNames();
        await populateIndicatorDropdowns();
        setStatus("Choose one or two indicators to begin.");
    } catch (error) {
        console.error("Initialization error:", error);
        setStatus("Failed to initialize page.");
    }

    updateDiffChart();
});

// --------------------- Helpers ---------------------
// Edited By Amir
function setStatus(message) {
    const status = document.getElementById("statusMessage");
    if (status) status.textContent = message;
}

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

    try {
        const response = await fetch(`${API_BASE}/import?filename=${encodeURIComponent(filename)}`, {
            method: "POST"
        });

        const result = await response.json();
        console.log("Import result:", result);

        if (result.error) return false;
        return true;
    } catch (err) {
        console.error("Failed to import indicator dataset:", err);
        return false;
    }
}

// Edited By Amir
async function populateIndicatorDropdowns() {
    const indicator1Select = document.getElementById("indicator1Select");
    const indicator2Select = document.getElementById("indicator2Select");

    if (!indicator1Select || !indicator2Select) return;

    const datasetResponse = await loadDatasets();
    const datasets = datasetResponse.datasets || [];

    indicatorFileMap = {};

    indicator1Select.innerHTML = '<option value="">Indicator</option>';
    indicator2Select.innerHTML = '<option value="">Indicator</option>';

    datasets.forEach((fileName) => {
        const prefix = "ddf--datapoints--";
        const suffix = "--by--geo--time.csv";

        if (!fileName.startsWith(prefix) || !fileName.endsWith(suffix)) return;

        const indicatorCode = fileName.slice(prefix.length, fileName.length - suffix.length);
        indicatorFileMap[indicatorCode] = fileName;

        const option1 = document.createElement("option");
        option1.value = indicatorCode;
        option1.textContent = formatIndicatorName(indicatorCode);

        const option2 = document.createElement("option");
        option2.value = indicatorCode;
        option2.textContent = formatIndicatorName(indicatorCode);

        indicator1Select.appendChild(option1);
        indicator2Select.appendChild(option2);
    });
}

// Edited By Amir
async function populateCountryDropdown(indicatorCode) {
    const countrySelect = document.getElementById("countrySelect");
    if (!countrySelect) return;

    const res = await fetch(`${API_BASE}/countries?indicator_code=${encodeURIComponent(indicatorCode)}`);
    const countries = await res.json();

    countrySelect.innerHTML = '<option value="">Country Name</option>';

    countries.forEach((code) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = formatCountryName(code);
        countrySelect.appendChild(option);
    });
}

// Edited By Amir
async function populateYearDropdowns(indicatorCode) {
    const startYearSelect = document.getElementById("startYearSelect");
    const endYearSelect = document.getElementById("endYearSelect");

    if (!startYearSelect || !endYearSelect) return;

    const res = await fetch(`${API_BASE}/years?indicator_code=${encodeURIComponent(indicatorCode)}`);
    const years = await res.json();

    startYearSelect.innerHTML = '<option value="">Start Year</option>';
    endYearSelect.innerHTML = '<option value="">End Year</option>';

    years.forEach((year) => {
        const startOption = document.createElement("option");
        startOption.value = year;
        startOption.textContent = year;

        const endOption = document.createElement("option");
        endOption.value = year;
        endOption.textContent = year;

        startYearSelect.appendChild(startOption);
        endYearSelect.appendChild(endOption);
    });

    if (years.length > 0) {
        startYearSelect.value = years[0];
        endYearSelect.value = years[years.length - 1];
    }
}

// Edited By Amir
async function fetchSeries(indicatorCode, countryCode) {
    const res = await fetch(
        `${API_BASE}/data?indicator_code=${encodeURIComponent(indicatorCode)}&country_code=${encodeURIComponent(countryCode)}&limit=500`
    );
    return await res.json();
}

// Edited By Amir
function filterSeriesByYearRange(data, startYear, endYear) {
    return data.filter(row => {
        const year = Number(row.year);
        if (!startYear || !endYear) return true;
        return year >= Number(startYear) && year <= Number(endYear);
    });
}

// Edited By Amir
function populateTable(tableId, data) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2">No data available</td></tr>`;
        return;
    }

    data.forEach((row) => {
        const tr = document.createElement("tr");

        const xCell = document.createElement("td");
        xCell.contentEditable = "true";
        xCell.innerText = row.year;

        const yCell = document.createElement("td");
        yCell.contentEditable = "true";
        yCell.innerText = row.value;

        tr.appendChild(xCell);
        tr.appendChild(yCell);
        tbody.appendChild(tr);
    });
}

// Edited By Amir
async function loadTablesFromBackend() {
    const countryCode = document.getElementById("countrySelect")?.value;
    const indicator1 = document.getElementById("indicator1Select")?.value;
    const indicator2 = document.getElementById("indicator2Select")?.value;
    const startYear = document.getElementById("startYearSelect")?.value;
    const endYear = document.getElementById("endYearSelect")?.value;

    if (!countryCode || !indicator1) {
        setStatus("Choose a country and at least one indicator.");
        return;
    }

    setStatus("Loading data...");

    try {
        const data1Raw = await fetchSeries(indicator1, countryCode);
        const data1 = filterSeriesByYearRange(data1Raw, startYear, endYear);
        populateTable("table1", data1);

        if (indicator2) {
            const data2Raw = await fetchSeries(indicator2, countryCode);
            const data2 = filterSeriesByYearRange(data2Raw, startYear, endYear);
            populateTable("table2", data2);
        } else {
            populateTable("table2", []);
        }

        attachTableListeners();
        updateDiffChart();

        setStatus(
            `Showing ${formatCountryName(countryCode)} from ${startYear || "start"} to ${endYear || "end"}.`
        );
    } catch (error) {
        console.error("Failed to load table data:", error);
        setStatus("Failed to load data.");
    }
}

// --------------------- Breadcrumbs ---------------------
function attachBreadcrumbListeners() {
    const returnBtn = document.getElementById('Return');
    const backBtn = document.getElementById('Back');
    const currentBtn = document.getElementById('Current');
    const linkExplore = document.getElementById('link-explore');
    const linkCorrelation = document.getElementById('link-correlation');

    if (returnBtn) returnBtn.addEventListener('click', e => { e.preventDefault(); window.location.href = 'Home.html'; });
    if (backBtn) backBtn.addEventListener('click', e => { e.preventDefault(); window.location.href = 'ExploreData1.html'; });
    if (currentBtn) currentBtn.addEventListener('click', e => { e.preventDefault(); window.location.href = 'ExploreData2.html'; });
    if (linkExplore) linkExplore.addEventListener('click', e => { e.preventDefault(); window.location.href = 'ExploreData1.html'; });
    if (linkCorrelation) linkCorrelation.addEventListener('click', e => { e.preventDefault(); window.location.href = 'correlation.html'; });
}

// --------------------- Filters ---------------------
// Edited By Amir
function attachFilterListeners() {
    const indicator1Select = document.getElementById("indicator1Select");
    const indicator2Select = document.getElementById("indicator2Select");
    const countrySelect = document.getElementById("countrySelect");
    const startYearSelect = document.getElementById("startYearSelect");
    const endYearSelect = document.getElementById("endYearSelect");
    const indicatorSearch = document.getElementById("indicator-search");

    indicator1Select?.addEventListener("change", async () => {
        const indicator1 = indicator1Select.value;
        if (!indicator1) {
            setStatus("Choose an indicator to begin.");
            return;
        }

        const imported = await importIndicatorIfNeeded(indicator1);
        if (!imported) {
            setStatus("Could not load that indicator.");
            return;
        }

        await populateCountryDropdown(indicator1);
        await populateYearDropdowns(indicator1);
        setStatus("Indicator loaded. Now choose a country and optional second indicator.");
    });

    indicator2Select?.addEventListener("change", async () => {
        const indicator2 = indicator2Select.value;
        if (!indicator2) {
            loadTablesFromBackend();
            return;
        }

        const imported = await importIndicatorIfNeeded(indicator2);
        if (!imported) {
            setStatus("Could not load the second indicator.");
            return;
        }

        loadTablesFromBackend();
    });

    countrySelect?.addEventListener("change", loadTablesFromBackend);
    startYearSelect?.addEventListener("change", loadTablesFromBackend);
    endYearSelect?.addEventListener("change", loadTablesFromBackend);

    indicatorSearch?.addEventListener("input", (e) => {
        const searchValue = e.target.value.toLowerCase();

        [indicator1Select, indicator2Select].forEach(select => {
            Array.from(select.options).forEach((option) => {
                if (option.value === "") {
                    option.hidden = false;
                    return;
                }

                option.hidden = !option.textContent.toLowerCase().includes(searchValue);
            });
        });
    });
}

// --------------------- Table → Scatter Chart ---------------------
function getAllTableData() {
    const tableIds = ["table1", "table2"];
    const colors = ["#7c3aed", "#f97316"];
    const datasets = [];

    tableIds.forEach((id, idx) => {
        const rows = document.querySelectorAll(`#${id} tbody tr`);
        const points = [];

        rows.forEach(row => {
            if (!row.cells[0] || !row.cells[1]) return;

            const x = parseFloat(row.cells[0].innerText.trim());
            const y = parseFloat(row.cells[1].innerText.trim());

            if (!isNaN(x) && !isNaN(y)) {
                points.push({ x, y });
            }
        });

        datasets.push({
            label: `Table ${idx + 1}`,
            data: points,
            backgroundColor: colors[idx],
            pointRadius: 6
        });
    });

    return datasets;
}

function updateDiffChart() {
    const canvas = document.getElementById("diffChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const datasets = getAllTableData();

    if (diffChart) diffChart.destroy();

    diffChart = new Chart(ctx, {
        type: "scatter",
        data: { datasets },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: "Year" },
                    beginAtZero: false
                },
                y: {
                    title: { display: true, text: "Value" },
                    beginAtZero: false
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => `(${ctx.raw.x}, ${ctx.raw.y})`
                    }
                },
                legend: { position: "top" }
            }
        }
    });
}

// --------------------- Update chart when table edits ---------------------
function attachTableListeners() {
    document.querySelectorAll("#table1 td, #table2 td").forEach(cell => {
        cell.addEventListener("blur", updateDiffChart);
        cell.addEventListener("keyup", updateDiffChart);
    });
}