let diffChart; // only one global chart variable

document.addEventListener("DOMContentLoaded", () => {
    // --------------------- Load Header ---------------------
    loadHeader().then(() => {
        attachBreadcrumbListeners(); // attach listeners after header is loaded
        attachTableListeners();
        updateDiffChart(); // initial render
    });
});


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
    if (linkCorrelation) linkCorrelation.addEventListener('click', e => { e.preventDefault(); window.location.href = 'Assignments.html'; });
}

// --------------------- Table → Scatter Chart ---------------------
function getAllTableData() {
    const tableIds = ["table1", "table2"];
    const colors = ["#7c3aed", "#f97316"]; // Table1 purple, Table2 orange
    const datasets = [];

    tableIds.forEach((id, idx) => {
        const rows = document.querySelectorAll(`#${id} tbody tr`);
        const points = [];

        rows.forEach(row => {
            const x = parseFloat(row.cells[0].innerText.trim());
            const y = parseFloat(row.cells[1].innerText.trim());
            if (!isNaN(x) && !isNaN(y)) points.push({ x, y });
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
                x: { title: { display: true, text: "X" }, beginAtZero: true },
                y: { title: { display: true, text: "Y" }, beginAtZero: true }
            },
            plugins: {
                tooltip: { callbacks: { label: ctx => `(${ctx.raw.x}, ${ctx.raw.y})` } },
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
