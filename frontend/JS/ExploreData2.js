let diffChart;

document.addEventListener("DOMContentLoaded", () => {
    attachBreadcrumbListeners();
    attachTableListeners();
    updateDiffChart();
});


// ---------------- Breadcrumb Navigation ----------------
function attachBreadcrumbListeners() {

    document.getElementById('Return')?.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = 'Home.html';
    });

    document.getElementById('Back')?.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = 'ExploreData1.html';
    });

    document.getElementById('Current')?.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = 'ExploreData2.html';
    });

    document.getElementById('link-explore')?.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = 'ExploreData1.html';
    });

    document.getElementById('link-correlation')?.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = 'Assignments.html';
    });
}


// ---------------- Table Data ----------------
function getAllTableData() {

    const tableIds = ["table1", "table2"];
    const colors = ["#7c3aed", "#f97316"];
    const datasets = [];

    tableIds.forEach((id, idx) => {

        const rows = document.querySelectorAll(`#${id} tbody tr`);
        const points = [];

        rows.forEach(row => {
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


// ---------------- Create / Update Chart ----------------
function updateDiffChart() {

    const canvas = document.getElementById("DiffChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const datasets = getAllTableData();

    if (diffChart) {
        diffChart.destroy();
    }

    diffChart = new Chart(ctx, {
        type: "scatter",
        data: { datasets },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: "X" },
                    beginAtZero: true
                },
                y: {
                    title: { display: true, text: "Y" },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: { position: "top" },
                tooltip: {
                    callbacks: {
                        label: ctx => `(${ctx.raw.x}, ${ctx.raw.y})`
                    }
                }
            }
        }
    });
}


// ---------------- Update Chart on Edit ----------------
function attachTableListeners() {
    document.querySelectorAll("#table1 td, #table2 td").forEach(cell => {
        cell.addEventListener("input", updateDiffChart);
    });
}
