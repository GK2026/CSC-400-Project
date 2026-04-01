document.addEventListener("DOMContentLoaded", () => {

    // ---------------- Select Elements ----------------
    const backHeader = document.getElementById("Back");
    const returnBreadcrumb = document.getElementById("Return");
    const currentBreadcrumb = document.getElementById("Current");
    const exploreDataBtn = document.getElementById("link-explore");
    const linkCorrelation = document.getElementById("link-correlation");

    /*******************************
     * STUDENT NAME + LOGOUT
     *******************************/
    const studentSelect = document.getElementById("student-select");
    const firstName = localStorage.getItem("firstName");

    if (studentSelect) {
        if (firstName) {
            studentSelect.innerHTML = `
                <option>${firstName}</option>
                <option value="logout">Logout</option>
            `;
        } else {
            studentSelect.innerHTML = `
                <option>Student Name</option>
            `;
        }

        studentSelect.addEventListener("change", (e) => {
            if (e.target.value === "logout") {
                localStorage.removeItem("firstName");
                localStorage.removeItem("username");
                window.location.href = "Home.html";
            }
        });
    }

    // ---------------- Navigation Event Listeners ----------------

    if (backHeader) {
        backHeader.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "Home.html";
        });
    }

    if (returnBreadcrumb) {
        returnBreadcrumb.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "Home.html";
        });
    }

    if (currentBreadcrumb) {
        currentBreadcrumb.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "Assignments.html";
        });
    }

    if (exploreDataBtn) {
        exploreDataBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "ExploreData1.html";
        });
    }

    if (linkCorrelation) {
        linkCorrelation.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "Assignments.html";
        });
    }

});


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
                points.push({ x: x, y: y });
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
let diffChart;

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
                        label: function (context) {
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

        cell.addEventListener("input", function () {
            updateDiffChart();
        });

    });

}
