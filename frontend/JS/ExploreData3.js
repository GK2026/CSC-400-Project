
/*******************************
 * MAIN SCRIPT
 *******************************/
document.addEventListener("DOMContentLoaded", () => {

    /*******************************
     * NAVIGATION LOGIC
     *******************************/

    document.getElementById('Return')?.addEventListener('click', () => {
        window.location.href = 'Home.html';
    });

    document.getElementById('Back')?.addEventListener('click', () => {
        window.location.href = 'ExploreData1.html';
    });

    document.getElementById('Current')?.addEventListener('click', () => {
        window.location.href = 'ExploreData3.html';
    });

    document.getElementById('link-explore')?.addEventListener('click', () => {
        window.location.href = 'ExploreData1.html';
    });

    document.getElementById('link-correlation')?.addEventListener('click', () => {
        window.location.href = 'Assignments.html';
    });

    document.getElementById('link-home')?.addEventListener('click', () => {
        window.location.href = 'Home.html';
    });

    /*******************************
     * STUDENT NAME + LOGOUT
     *******************************/

    const studentSelect = document.getElementById("student-select");
    const firstName = localStorage.getItem("firstName");

    if (studentSelect) {
        if (firstName) {
            // Set dynamic name
            studentSelect.innerHTML = `
                <option>${firstName}</option>
                <option value="logout">Logout</option>
            `;
        } else {
            // Default state (not logged in)
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

    /*******************************
     * TABLE → SCATTER GRAPH LOGIC
     *******************************/

    let chart;

    function getTableData() {
        const rows = document.querySelectorAll("#dataTable tbody tr");
        const indicator1Points = [];
        const indicator2Points = [];

        rows.forEach((row, index) => {
            const x = index + 1;
            const y1 = parseFloat(row.cells[1].innerText);
            const y2 = parseFloat(row.cells[2].innerText);

            if (!isNaN(y1)) indicator1Points.push({ x, y: y1 });
            if (!isNaN(y2)) indicator2Points.push({ x, y: y2 });
        });

        return { indicator1Points, indicator2Points };
    }

    function updateChart() {
        const canvas = document.getElementById("dataChart");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const { indicator1Points, indicator2Points } = getTableData();

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: "scatter",
            data: {
                datasets: [
                    {
                        label: "Indicator 1",
                        data: indicator1Points,
                        backgroundColor: "#7c3aed",
                        borderColor: "#7c3aed",
                        pointRadius: 6,
                    },
                    {
                        label: "Indicator 2",
                        data: indicator2Points,
                        backgroundColor: "#f59e0b",
                        borderColor: "#f59e0b",
                        pointRadius: 6,
                    },
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: { display: true, text: "Country Index" },
                    },
                    y: {
                        title: { display: true, text: "Value" },
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `(${ctx.raw.x}, ${ctx.raw.y})`
                        }
                    },
                    legend: {
                        display: true,
                        position: "top",
                    }
                }
            }
        });
    }

    // Update chart when table cells change
    document.querySelectorAll("#dataTable td").forEach(cell => {
        cell.addEventListener("input", updateChart);
    });

    // Initial render
    updateChart();

});
