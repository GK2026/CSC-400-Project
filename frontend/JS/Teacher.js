let allSubmissions = [];
let activeFeedbackId = null;

// session
function setupTeacherSession() {
    const role = sessionStorage.getItem("role") || localStorage.getItem("role");

    if (!role || (role !== "teacher" && role !== "instructor")) {
        window.location.href = "login.html";
        return false;
    }

    populateStudentDropdown("login.html");
    return true;
}

// helpers
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString(undefined, {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit"
    });
}

function getPendingCount() {
    return allSubmissions.filter(r => !r.teacher_feedback || !r.teacher_feedback.trim()).length;
}

function updatePendingBadge() {
    const badge = document.getElementById("pendingBadge");
    if (!badge) return;
    const count = getPendingCount();
    badge.textContent = count > 0 ? `${count} pending` : "";
    badge.style.display = count > 0 ? "inline-block" : "none";
}

function renderRows(rows) {
    const tbody = document.getElementById("submissionsBody");
    const count = document.getElementById("submissionCount");
    if (!tbody) return;

    if (count) count.textContent = `${rows.length} submission${rows.length !== 1 ? "s" : ""}`;

    if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#6b7280;">No submissions found.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";

    rows.forEach((row) => {
        const hasFeedback = row.teacher_feedback && row.teacher_feedback.trim();
        const tr = document.createElement("tr");
        tr.className = hasFeedback ? "row-reviewed" : "row-pending";

        const studentR = row.student_pearson_r !== null && row.student_pearson_r !== undefined
            ? Number(row.student_pearson_r).toFixed(3)
            : "—";
        const computedR = Number(row.computed_pearson_r).toFixed(3);

        const gradeHtml = row.teacher_grade
            ? `<span class="grade-badge">${row.teacher_grade}</span>`
            : `<span style="color:#9ca3af; font-size:0.8rem;">—</span>`;

        tr.innerHTML = `
            <td>
                <div class="student-name">${row.student_name || "Unknown"}</div>
                <div class="student-email">${row.student_email || ""}</div>
            </td>
            <td class="date-cell">${formatDate(row.submitted_at)}</td>
            <td class="indicators-cell">
                <div>${row.indicator_1_name}</div>
                <div class="vs-label">vs</div>
                <div>${row.indicator_2_name}</div>
            </td>
            <td class="r-cell">
                <div style="font-size:0.75rem; color:#9ca3af; margin-bottom:2px;">Student</div>
                <span class="r-value">${studentR}</span>
                <div style="font-size:0.75rem; color:#9ca3af; margin-top:4px; margin-bottom:2px;">Computed</div>
                <span class="r-value" style="color:#059669;">${computedR}</span>
            </td>
            <td>
                <span class="type-badge type-${row.student_selected_label}">${row.student_selected_label || "—"}</span>
            </td>
            <td class="explanation-cell">
                <div class="explanation-text">${row.student_explanation || "—"}</div>
            </td>
            <td class="feedback-cell">
                ${hasFeedback
                    ? `<div class="existing-feedback">${row.teacher_feedback}</div>
                       <button class="edit-feedback-btn" onclick="openFeedbackModal(${row.id})">Edit</button>`
                    : `<button class="give-feedback-btn" onclick="openFeedbackModal(${row.id})">Give Feedback</button>`
                }
            </td>
            <td style="text-align:center;">${gradeHtml}</td>
        `;

        tbody.appendChild(tr);
    });
}

// filter
function getFilteredRows() {
    const term = document.getElementById("student-search")?.value.trim().toLowerCase() || "";
    const status = document.getElementById("filterStatus")?.value || "";

    return allSubmissions.filter((row) => {
        const matchesSearch = !term ||
            (row.student_name || "").toLowerCase().includes(term) ||
            (row.student_email || "").toLowerCase().includes(term) ||
            (row.indicator_1_name || "").toLowerCase().includes(term) ||
            (row.indicator_2_name || "").toLowerCase().includes(term);

        const hasFeedback = row.teacher_feedback && row.teacher_feedback.trim();
        const matchesStatus = !status ||
            (status === "pending" && !hasFeedback) ||
            (status === "reviewed" && hasFeedback);

        return matchesSearch && matchesStatus;
    });
}

// feedback modal
function openFeedbackModal(submissionId) {
    const row = allSubmissions.find(r => r.id === submissionId);
    if (!row) return;

    activeFeedbackId = submissionId;

    const studentR = row.student_pearson_r !== null && row.student_pearson_r !== undefined
        ? Number(row.student_pearson_r).toFixed(3)
        : "—";
    const computedR = Number(row.computed_pearson_r).toFixed(3);

    const info = document.getElementById("feedbackSubmissionInfo");
    if (info) {
        info.innerHTML = `
            <strong>${row.student_name || "Student"}</strong> —
            ${row.indicator_1_name} vs ${row.indicator_2_name}<br>
            <span style="color:#6b7280; font-size:0.85rem;">
                Student r: <strong>${studentR}</strong> &nbsp;·&nbsp;
                Computed r: <strong style="color:#059669;">${computedR}</strong> &nbsp;·&nbsp;
                Type: ${row.student_selected_label}
            </span><br>
            <span style="color:#374151; font-size:0.85rem; margin-top:6px; display:block;">
                "${row.student_explanation || "No explanation given."}"
            </span>
        `;
    }

    const textarea = document.getElementById("feedbackTextarea");
    if (textarea) textarea.value = row.teacher_feedback || "";

    const gradeInput = document.getElementById("gradeInput");
    if (gradeInput) gradeInput.value = row.teacher_grade || "";

    document.getElementById("feedbackOverlay").classList.add("visible");
    textarea?.focus();
}

function closeFeedbackModal() {
    document.getElementById("feedbackOverlay").classList.remove("visible");
    activeFeedbackId = null;
}

// save feedback
async function saveFeedback() {
    if (!activeFeedbackId) return;

    const note = document.getElementById("feedbackTextarea")?.value.trim();
    const grade = document.getElementById("gradeInput")?.value.trim();

    if (!note) {
        alert("Write your feedback before saving.");
        return;
    }

    const saveBtn = document.querySelector(".feedback-save-btn");
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "Saving..."; }

    try {
        const res = await fetch(`${API_BASE}/gapminder/submissions/${activeFeedbackId}/feedback`, {
            method: "PATCH",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({
                teacher_feedback: note,
                teacher_grade: grade || null
            })
        });

        const result = await res.json();

        if (!res.ok) {
            alert(result.detail || "Could not save feedback.");
            return;
        }

        const idx = allSubmissions.findIndex(r => r.id === activeFeedbackId);
        if (idx !== -1) {
            allSubmissions[idx].teacher_feedback = note;
            allSubmissions[idx].teacher_grade = grade || null;
        }

        closeFeedbackModal();
        renderRows(getFilteredRows());
        updatePendingBadge();
    } catch (err) {
        console.error(err);
        alert("Could not save feedback.");
    } finally {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Save Feedback"; }
    }
}

async function loadTeacherSubmissions() {
    const tbody = document.getElementById("submissionsBody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Loading...</td></tr>`;

    try {
        const res = await fetch(`${API_BASE}/gapminder/submissions`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) { renderRows([]); return; }
        allSubmissions = data;
        renderRows(getFilteredRows());
        updatePendingBadge();
    } catch (err) {
        console.error(err);
        renderRows([]);
    }
}

// init
document.addEventListener("DOMContentLoaded", async () => {
    if (!setupTeacherSession()) return;

    document.getElementById("student-search")?.addEventListener("input", () => renderRows(getFilteredRows()));
    document.getElementById("filterStatus")?.addEventListener("change", () => renderRows(getFilteredRows()));

    document.getElementById("feedbackOverlay")?.addEventListener("click", (e) => {
        if (e.target === document.getElementById("feedbackOverlay")) closeFeedbackModal();
    });

    await loadTeacherSubmissions();
});
