document.addEventListener("DOMContentLoaded", async () => {
    if (!requireLogin()) return;
    populateStudentDropdown();

    const tbody = document.querySelector("#submissionsTable tbody");
    if (!tbody) return;

    try {
        const res = await fetch(API_BASE + "/gapminder/my-submissions", { headers: authHeaders() });
        const data = await res.json();

        if (!res.ok || !data.length) {
            tbody.innerHTML = "<tr><td colspan='7'>" + (!res.ok ? "Could not load submissions." : "No submissions yet. Complete the Correlation Guide to submit one.") + "</td></tr>";
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

            const studentR = item.student_pearson_r !== null && item.student_pearson_r !== undefined
                ? Number(item.student_pearson_r).toFixed(3)
                : "—";

            const gradeHtml = item.teacher_grade
                ? `<span style="display:inline-block; padding:4px 10px; background:#ede9fe; color:#4c1d95; border-radius:8px; font-weight:700; font-size:0.85rem;">${item.teacher_grade}</span>`
                : "<em style='color:#9ca3af;'>—</em>";

            tr.innerHTML =
                "<td>" + new Date(item.submitted_at).toLocaleString() + "</td>" +
                "<td>" + item.indicator_1_name + " vs " + item.indicator_2_name + "</td>" +
                "<td><strong>" + studentR + "</strong></td>" +
                "<td>" + (item.student_selected_label || "—") + "</td>" +
                "<td style='min-width:220px; font-size:0.875rem; line-height:1.5; white-space:normal;'>" + explanation + "</td>" +
                "<td>" + feedback + "</td>" +
                "<td style='text-align:center;'>" + gradeHtml + "</td>";

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = "<tr><td colspan='7'>Could not load submissions.</td></tr>";
    }
});
