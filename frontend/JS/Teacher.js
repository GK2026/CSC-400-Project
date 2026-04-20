let allSubmissions = [];
let allStudents = [];
let allAnnouncements = [];
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

// tabs
function switchTab(name) {
    document.querySelectorAll(".tab-panel").forEach(p => p.style.display = "none");
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("tab-" + name).style.display = "block";
    document.querySelectorAll(".tab-btn")[["submissions","students","announcements"].indexOf(name)].classList.add("active");
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

// ── SUBMISSIONS ───────────────────────────────────────────────────────────────

function renderRows(rows) {
    const tbody = document.getElementById("submissionsBody");
    const count = document.getElementById("submissionCount");
    if (!tbody) return;

    if (count) count.textContent = `${rows.length} submission${rows.length !== 1 ? "s" : ""}`;

    if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#6b7280;">No submissions found.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    rows.forEach((row) => {
        const hasFeedback = row.teacher_feedback && row.teacher_feedback.trim();
        const tr = document.createElement("tr");
        tr.className = hasFeedback ? "row-reviewed" : "row-pending";

        const studentR = (row.student_pearson_r !== null && row.student_pearson_r !== undefined)
            ? Number(row.student_pearson_r).toFixed(3) : "—";
        const computedR = Number(row.computed_pearson_r).toFixed(3);

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
            <td><span class="type-badge type-${row.student_selected_label}">${row.student_selected_label || "—"}</span></td>
            <td class="explanation-cell"><div class="explanation-text">${row.student_explanation || "—"}</div></td>
            <td class="feedback-cell">
                ${hasFeedback
                    ? `<div class="existing-feedback">${row.teacher_feedback}</div>
                       <button class="edit-feedback-btn" onclick="openFeedbackModal(${row.id})">Edit</button>`
                    : `<button class="give-feedback-btn" onclick="openFeedbackModal(${row.id})">Give Feedback</button>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });
}

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

async function loadTeacherSubmissions() {
    const tbody = document.getElementById("submissionsBody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>`;
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

// ── FEEDBACK MODAL ────────────────────────────────────────────────────────────

function openFeedbackModal(submissionId) {
    const row = allSubmissions.find(r => r.id === submissionId);
    if (!row) return;
    activeFeedbackId = submissionId;

    const studentR = (row.student_pearson_r !== null && row.student_pearson_r !== undefined)
        ? Number(row.student_pearson_r).toFixed(3) : "—";
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
    document.getElementById("feedbackOverlay").classList.add("visible");
    textarea?.focus();
}

function closeFeedbackModal() {
    document.getElementById("feedbackOverlay").classList.remove("visible");
    activeFeedbackId = null;
}

async function saveFeedback() {
    if (!activeFeedbackId) return;
    const note = document.getElementById("feedbackTextarea")?.value.trim();
    if (!note) { alert("Write your feedback before saving."); return; }

    const saveBtn = document.querySelector(".feedback-save-btn");
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "Saving..."; }

    try {
        const res = await fetch(`${API_BASE}/gapminder/submissions/${activeFeedbackId}/feedback`, {
            method: "PATCH",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ teacher_feedback: note, teacher_grade: null })
        });
        const result = await res.json();
        if (!res.ok) { alert(result.detail || "Could not save feedback."); return; }

        const idx = allSubmissions.findIndex(r => r.id === activeFeedbackId);
        if (idx !== -1) allSubmissions[idx].teacher_feedback = note;

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

// ── STUDENTS ──────────────────────────────────────────────────────────────────

function renderStudents() {
    const container = document.getElementById("studentsContainer");
    if (!container) return;

    const term = document.getElementById("student-search-2")?.value.trim().toLowerCase() || "";
    const sectionFilter = document.getElementById("filterSection")?.value || "";

    let filtered = allStudents;
    if (term) {
        filtered = filtered.filter(s =>
            s.first_name.toLowerCase().includes(term) ||
            s.email.toLowerCase().includes(term)
        );
    }
    if (sectionFilter) {
        filtered = filtered.filter(s => s.section === sectionFilter);
    }

    document.getElementById("studentCount").textContent =
        `${filtered.length} student${filtered.length !== 1 ? "s" : ""}`;

    // Group by section
    const sections = {};
    filtered.forEach(s => {
        const sec = s.section || "Unassigned";
        if (!sections[sec]) sections[sec] = [];
        sections[sec].push(s);
    });

    if (!filtered.length) {
        container.innerHTML = `<p style="color:#6b7280; text-align:center; padding:32px;">No students found.</p>`;
        return;
    }

    container.innerHTML = "";
    ["1","2","3","Unassigned"].forEach(sec => {
        if (!sections[sec]) return;
        const group = document.createElement("div");
        group.className = "section-group";
        group.innerHTML = `<h3 class="section-title">Section ${sec === "Unassigned" ? "— Unassigned" : sec}</h3>`;

        const table = document.createElement("table");
        table.className = "dashboard-table";
        table.innerHTML = `
            <thead><tr>
                <th>Name</th><th>Email</th><th>Exercises</th><th>Submissions</th><th>Action</th>
            </tr></thead>
        `;
        const tbody = document.createElement("tbody");
        sections[sec].forEach(s => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${s.first_name}</strong></td>
                <td style="color:#6b7280; font-size:0.85rem;">${s.email}</td>
                <td style="text-align:center;">${s.exercise_count}</td>
                <td style="text-align:center;">${s.submission_count}</td>
                <td><button class="delete-student-btn" onclick="confirmDeleteStudent(${s.id}, '${s.first_name}')">🗑 Remove</button></td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        group.appendChild(table);
        container.appendChild(group);
    });
}

async function confirmDeleteStudent(userId, name) {
    const ok = confirm(`Are you sure you want to permanently delete ${name} and ALL their exercises and submissions? This cannot be undone.`);
    if (!ok) return;

    const ok2 = confirm(`Final confirmation: Delete ${name} completely?`);
    if (!ok2) return;

    try {
        const res = await fetch(`${API_BASE}/gapminder/students/${userId}`, {
            method: "DELETE",
            headers: authHeaders()
        });
        const result = await res.json();
        if (!res.ok) { alert(result.detail || "Could not delete student."); return; }
        alert(`${name} has been removed.`);
        allStudents = allStudents.filter(s => s.id !== userId);
        renderStudents();
    } catch (err) {
        console.error(err);
        alert("Could not delete student.");
    }
}

async function loadStudents() {
    try {
        const res = await fetch(`${API_BASE}/gapminder/students`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) return;
        allStudents = data;
        renderStudents();
    } catch (err) {
        console.error(err);
    }
}

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────

function renderAnnouncements() {
    const container = document.getElementById("announcementsList");
    if (!container) return;

    if (!allAnnouncements.length) {
        container.innerHTML = `<p style="color:#6b7280;">No announcements posted yet.</p>`;
        return;
    }

    container.innerHTML = "";
    allAnnouncements.forEach(a => {
        const div = document.createElement("div");
        div.className = "announcement-card";
        div.innerHTML = `
            <div class="announcement-header">
                <span class="announcement-meta">
                    ${formatDate(a.created_at)} · 
                    <strong>${a.target_section ? "Section " + a.target_section : "All Sections"}</strong>
                </span>
                <button class="delete-ann-btn" onclick="deleteAnnouncement(${a.id})">✕ Delete</button>
            </div>
            <p class="announcement-message">${a.message}</p>
        `;
        container.appendChild(div);
    });
}

async function postAnnouncement() {
    const message = document.getElementById("announcementMessage")?.value.trim();
    const section = document.getElementById("announcementSection")?.value || null;

    if (!message) { alert("Write a message first."); return; }

    try {
        const res = await fetch(`${API_BASE}/gapminder/announcements`, {
            method: "POST",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ message, target_section: section || null })
        });
        const result = await res.json();
        if (!res.ok) { alert(result.detail || "Could not post."); return; }
        allAnnouncements.unshift(result);
        renderAnnouncements();
        document.getElementById("announcementMessage").value = "";
    } catch (err) {
        console.error(err);
        alert("Could not post announcement.");
    }
}

async function deleteAnnouncement(id) {
    if (!confirm("Delete this announcement?")) return;
    try {
        const res = await fetch(`${API_BASE}/gapminder/announcements/${id}`, {
            method: "DELETE",
            headers: authHeaders()
        });
        if (!res.ok) { alert("Could not delete."); return; }
        allAnnouncements = allAnnouncements.filter(a => a.id !== id);
        renderAnnouncements();
    } catch (err) {
        console.error(err);
    }
}

async function loadAnnouncements() {
    try {
        const res = await fetch(`${API_BASE}/gapminder/announcements`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) return;
        allAnnouncements = data;
        renderAnnouncements();
    } catch (err) {
        console.error(err);
    }
}

// ── INIT ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
    if (!setupTeacherSession()) return;

    document.getElementById("student-search")?.addEventListener("input", () => renderRows(getFilteredRows()));
    document.getElementById("filterStatus")?.addEventListener("change", () => renderRows(getFilteredRows()));
    document.getElementById("student-search-2")?.addEventListener("input", renderStudents);
    document.getElementById("filterSection")?.addEventListener("change", renderStudents);

    document.getElementById("feedbackOverlay")?.addEventListener("click", (e) => {
        if (e.target === document.getElementById("feedbackOverlay")) closeFeedbackModal();
    });

    await Promise.all([loadTeacherSubmissions(), loadStudents(), loadAnnouncements()]);
});