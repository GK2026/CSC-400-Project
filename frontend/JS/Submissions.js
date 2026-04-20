document.addEventListener("DOMContentLoaded", async () => {
    if (!requireLogin()) return;
    populateStudentDropdown();
    startAnnouncementPolling();

    const tbody = document.querySelector("#submissionsTable tbody");
    if (!tbody) return;

    try {
        const res = await fetch(API_BASE + "/gapminder/my-submissions", { headers: authHeaders() });
        const data = await res.json();

        if (!res.ok || !data.length) {
            tbody.innerHTML = "<tr><td colspan='6'>" + (!res.ok ? "Could not load submissions." : "No submissions yet. Complete the Correlation Guide to submit one.") + "</td></tr>";
            return;
        }

        tbody.innerHTML = "";
        data.forEach((item) => {
            const tr = document.createElement("tr");

            const feedback = item.teacher_feedback
                ? `<span style="color:#16a34a; font-weight:600;">✓</span> ${item.teacher_feedback}`
                : "<em style='color:#9ca3af;'>Pending teacher review</em>";

            const explanation = item.student_explanation
                ? item.student_explanation
                : "<em style='color:#9ca3af;'>No explanation submitted</em>";

            const studentR = (item.student_pearson_r !== null && item.student_pearson_r !== undefined)
                ? "<strong>" + Number(item.student_pearson_r).toFixed(3) + "</strong>"
                : "—";

            tr.innerHTML =
                "<td>" + new Date(item.submitted_at).toLocaleString() + "</td>" +
                "<td>" + item.indicator_1_name + " vs " + item.indicator_2_name + "</td>" +
                "<td>" + studentR + "</td>" +
                "<td>" + (item.student_selected_label || "—") + "</td>" +
                "<td style='min-width:220px; font-size:0.875rem; line-height:1.5; white-space:normal;'>" + explanation + "</td>" +
                "<td>" + feedback + "</td>";

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = "<tr><td colspan='6'>Could not load submissions.</td></tr>";
    }
});