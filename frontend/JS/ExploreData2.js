let diffChart;

document.addEventListener("DOMContentLoaded", () => {
    attachBreadcrumbListeners();
    attachTableListeners();
    updateDiffChart(); // Call the fixed function name
});

// ---------------- Breadcrumb Navigation ----------------
function attachBreadcrumbListeners() {
    const goTo = (id, page) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("click", function(e){
                e.preventDefault();
                window.location.href = page;
            });
        }
    };

    goTo("Return", "Home.html");
    goTo("Back", "ExploreData1.html");
    goTo("Current", "ExploreData2.html");
    goTo("link-explore", "ExploreData1.html");
    goTo("link-correlation", "Assignments.html");
    goTo("link-home", "Home.html")
}

// ---------------- Table Data ----------------
function getAllTableData() {
    const rows = document.querySelectorAll("#table1 tbody tr");

    const dataset1 = [];
    const dataset2 = [];

    rows.forEach(row => {
        const x = parseFloat(row.cells[0].textContent); // Year
        const y1 = parseFloat(row.cells[1].textContent); // Indicator 1
        const y2 = parseFloat(row.cells[2].textContent); // Indicator 2

        if (!isNaN(x) && !isNaN(y1)) {
            dataset1.push({ x: x, y: y1 });
        }

        if (!isNaN(x) && !isNaN(y2)) {
            dataset2.push({ x: x, y: y2 });
        }
    });

    return [
        {
            label: "Indicator 1",
            data: dataset1,
            backgroundColor: "#7c3aed", // purple
            borderColor: "#7c3aed",
            pointRadius: 6,
            showLine: false   
        },
        {
            label: "Indicator 2",
            data: dataset2,
            backgroundColor: "#FFA500", // green
            borderColor: "#FFA500",
            pointRadius: 6,
            showLine: false  
        }
    ];
}

// ---------------- Create / Update Chart ----------------
// Fixed function name to match the call at the top
function updateDiffChart() {
    // Match the ID in your HTML (case sensitive)
    const canvas = document.getElementById("diffChart"); 
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const datasets = getAllTableData();

    if (diffChart) {
        diffChart.destroy();
    }

    diffChart = new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: "linear",
                    position: "bottom",
                    beginAtZero: true,
                    title: { display: true, text: "Year" }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "Value" }
                }
            }
        }
    });
}

// ---------------- Update Chart on Edit ----------------
function attachTableListeners() {
    // Added the missing closing quote mark here
    document.querySelectorAll("#table1 td").forEach(cell => {
        cell.addEventListener("input", function(){
            updateDiffChart();
        });
    });
}
