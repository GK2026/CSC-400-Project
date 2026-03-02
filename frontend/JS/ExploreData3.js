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

document.getElementById('link-correlation')?.addEventListener('click', () => {
    window.location.href = 'Assignments.html';
});

// Student Button (example)
document.getElementById('studentBtn')?.addEventListener('click', () => {
    alert('Student profile feature coming soon!');
});


/*******************************
 * TABLE → SCATTER GRAPH LOGIC
 *******************************/

let chart;

// Read table values and convert to scatter points
function getTableData() {
    const rows = document.querySelectorAll("#dataTable tbody tr");
    let points = [];

    rows.forEach((row, index) => {
        const value = parseFloat(row.cells[1].innerText);
        if (!isNaN(value)) {
            points.push({
                x: index + 1,   // country index
                y: value
            });
        }
    });

    return points;
}

// Draw / update scatter chart
function updateChart() {
    const canvas = document.getElementById("dataChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dataPoints = getTableData();

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Country Values",
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
                        text: "Country Index"
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
                        label: (ctx) => `(${ctx.raw.x}, ${ctx.raw.y})`
                    }
                }
            }
        }
    });
}

// Auto-update chart when table is edited
document.querySelectorAll("#dataTable td").forEach(cell => {
    cell.addEventListener("input", updateChart);
});

// Initial render
window.addEventListener("DOMContentLoaded", updateChart);
