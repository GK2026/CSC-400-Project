let diffChart;

document.addEventListener("DOMContentLoaded", () => {
    attachBreadcrumbListeners();
    attachTableListeners();
    updateDiffChart();
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
}


// ---------------- Table Data ----------------
function getAllTableData() {

    const tableIds = ["table1", "table2"];
    const colors = ["#7c3aed", "#f97316"];

    const datasets = [];

    tableIds.forEach((id, index) => {

        const rows = document.querySelectorAll(`#${id} tbody tr`);
        const points = [];

        rows.forEach(row => {

            const x = parseFloat(row.cells[0].textContent);
            const y = parseFloat(row.cells[1].textContent);

            if (!isNaN(x) && !isNaN(y)) {
                points.push({x:x,y:y});
            }

        });

        datasets.push({
            label: `Table ${index + 1}`,
            data: points,
            backgroundColor: colors[index],
            borderColor: colors[index],
            pointRadius: 7,
            showLine: false
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

        data: {
            datasets: datasets
        },

        options: {

            responsive: true,

            scales: {

                x: {
                    type: "linear",
                    position: "bottom",
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "X"
                    }
                },

                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Y"
                    }
                }

            },

            plugins: {

                legend: {
                    position: "top"
                },

                tooltip: {
                    callbacks: {
                        label: function(context){
                            return `(${context.raw.x}, ${context.raw.y})`;
                        }
                    }
                }

            }

        }

    });

}


// ---------------- Update Chart on Edit ----------------
function attachTableListeners() {

    document.querySelectorAll("#table1 td, #table2 td").forEach(cell => {

        cell.addEventListener("input", function(){
            updateDiffChart();
        });

    });

}
