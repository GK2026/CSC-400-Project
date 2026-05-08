const API_BASE = window.location.origin.includes("gapminder.scsu.southernct.edu")
    ? "/api"
    : "http://127.0.0.1:8000";


// 401 handler
(function() {
    const _fetch = window.fetch;
    window.fetch = async function(...args) {
        const res = await _fetch(...args);
        if (res.status === 401) {
            
            const url = (typeof args[0] === "string" ? args[0] : args[0]?.url) || "";
            if (url.includes("/auth/login") || url.includes("/auth/register")) return res;

            const clone = res.clone();
            try {
                const data = await clone.json();
                const msg = (data.detail || "").toLowerCase();
                const isAuthError = msg.includes("expired") || msg.includes("invalid token") ||
                    msg.includes("not authenticated") || msg.includes("user not found");
                if (isAuthError) {
                    sessionStorage.clear();
                    localStorage.clear();
                    alert(msg.includes("expired")
                        ? "Your session has expired. Please log in again."
                        : "Authentication error. Please log in again.");
                    window.location.href = "login.html";
                }
            } catch {}
        }
        return res;
    };
})();

// auth helpers
function getToken() {
    return sessionStorage.getItem("access_token") || localStorage.getItem("access_token") || null;
}

function isLoggedIn() {
    const token = getToken();
    return !!(token && token !== "null" && token !== "undefined");
}

function authHeaders(extra = {}) {
    const token = getToken();
    if (!token || token === "null" || token === "undefined") return { ...extra };
    return { ...extra, Authorization: `Bearer ${token}` };
}

function requireLogin() {
    if (!isLoggedIn()) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

const requireLoginForAction = requireLogin;

// user menu
function populateStudentDropdown(logoutDest = "login.html") {
    const firstName = sessionStorage.getItem("first_name") || localStorage.getItem("first_name") || "Student";

    
    const menuBtn = document.getElementById("user-menu-btn");
    const dropdown = document.getElementById("user-menu-dropdown");
    const nameDisplay = document.getElementById("user-name-display");
    const logoutBtn = document.getElementById("logout-btn");

    if (menuBtn) {
        
        if (nameDisplay) nameDisplay.textContent = firstName;

        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (dropdown) dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
        });

        document.addEventListener("click", () => {
            if (dropdown) dropdown.style.display = "none";
        });

        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                sessionStorage.clear(); localStorage.clear();
                window.location.href = logoutDest;
            });
        }
        return;
    }

    
    const container = document.getElementById("student-select") || document.getElementById("user-menu");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position:relative; display:inline-block;";
    wrapper.innerHTML = `
        <button id="user-menu-btn" style="padding:8px 16px; background:#925dec; color:white; border:none; border-radius:6px; font-weight:600; font-size:0.9rem; cursor:pointer; display:flex; align-items:center; gap:8px;">${firstName} <span style="font-size:0.7rem;">&#9660;</span></button>
        <div id="user-menu-dropdown" style="display:none; position:absolute; right:0; top:calc(100% + 6px); background:white; border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.15); min-width:160px; z-index:9999; overflow:hidden;">
            <button id="logout-menu-btn" style="display:block; width:100%; padding:10px 16px; color:#dc2626; background:none; border:none; font-size:0.875rem; font-weight:600; cursor:pointer; text-align:left;">Logout</button>
        </div>
    `;

    container.parentNode.replaceChild(wrapper, container);

    const btn = document.getElementById("user-menu-btn");
    const drop = document.getElementById("user-menu-dropdown");

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        drop.style.display = drop.style.display === "none" ? "block" : "none";
    });

    document.addEventListener("click", () => { drop.style.display = "none"; });

    document.getElementById("logout-menu-btn").addEventListener("click", () => {
        sessionStorage.clear(); localStorage.clear();
        window.location.href = logoutDest;
    });
}

const setupStudentDropdown = populateStudentDropdown;

// announcement badge - polls every 10 seconds
function startAnnouncementPolling() {
    loadAnnouncementBadge();
    setInterval(loadAnnouncementBadge, 10000);
}

async function loadAnnouncementBadge() {
    if (!isLoggedIn()) return;
    const role = sessionStorage.getItem("role") || localStorage.getItem("role") || "";
    if (role === "teacher" || role === "instructor") return;
    try {
        const res = await fetch(`${API_BASE}/gapminder/announcements`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();

        const link = document.getElementById("link-announcements");
        if (!link) return;

        const lastSeenId = parseInt(localStorage.getItem("announcements_last_seen") || "0");
        const unread = data.filter(a => a.id > lastSeenId).length;

        if (unread > 0) {
            link.innerHTML = `🔔<span style="position:absolute; top:-6px; right:-4px; background:#dc2626; color:white; border-radius:50%; min-width:16px; height:16px; font-size:0.65rem; font-weight:700; display:inline-flex; align-items:center; justify-content:center; padding:0 3px;">${unread}</span>`;
        } else {
            link.innerHTML = "🔔";
        }
    } catch(e) { console.error("Badge error:", e); }
}

// status
function setStatus(message) {
    const status = document.getElementById("statusMessage");
    if (status) status.textContent = message;
}

// api fetchers
async function fetchIndicators(search = "") {
    const res = await fetch(
        `${API_BASE}/gapminder/indicators?search=${encodeURIComponent(search)}&limit=500`
    );
    if (!res.ok) throw new Error("Could not load indicators.");
    return res.json();
}

async function fetchYears(indicatorCode) {
    const res = await fetch(
        `${API_BASE}/gapminder/years?indicator_code=${encodeURIComponent(indicatorCode)}`
    );
    if (!res.ok) throw new Error("Could not load years.");
    return res.json();
}

async function fetchCountries(indicatorCode) {
    const res = await fetch(
        `${API_BASE}/gapminder/countries?indicator_code=${encodeURIComponent(indicatorCode)}`
    );
    if (!res.ok) throw new Error("Could not load countries.");
    return res.json();
}

// dropdown helpers
function fillIndicatorSelect(selectId, indicators, placeholderText) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = `<option value="">${placeholderText || "Select Indicator"}</option>`;

    indicators.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.indicator_code;
        option.textContent = item.indicator_name || item.indicator_code;
        select.appendChild(option);
    });

    if ([...select.options].some((opt) => opt.value === currentValue)) {
        select.value = currentValue;
    }
}

function fillSelect(selectId, values, firstText) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = `<option value="">${firstText}</option>`;

    values.forEach((value) => {
        const option = document.createElement("option");

        if (selectId === "countrySelect" && typeof value === "object" && value !== null) {
            const code = value.country_code ?? value.code ?? value.value ?? "";
            const name = value.country ?? value.country_name ?? value.name ?? "";
            let displayName;
            if (name && name.toLowerCase() !== code.toLowerCase()) {
                displayName = name;
            } else {
                displayName = code.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
            }
            option.value = code;
            option.textContent = displayName;
        } else {
            option.value = value;
            option.textContent = value;
        }

        select.appendChild(option);
    });

    if ([...select.options].some((opt) => String(opt.value) === String(currentValue))) {
        select.value = currentValue;
    }
}

// suggestions
function renderSuggestions(boxId, items, type, callbacks = {}) {
    const box = document.getElementById(boxId);
    if (!box) return;

    box.innerHTML = "";

    if (!items || items.length === 0) {
        box.style.display = "none";
        return;
    }

    items.slice(0, 12).forEach((item) => {
        const div = document.createElement("div");
        div.className = "suggestion-item";

        if (type === "country") {
            const code = item.country_code ?? "";
            const name = item.country ?? "";
            const displayName = (name && name.toLowerCase() !== code.toLowerCase())
                ? name
                : code.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
            div.textContent = displayName;
            div.addEventListener("click", () => {
                if (callbacks.onCountrySelect) callbacks.onCountrySelect(code, name);
                box.innerHTML = "";
                box.style.display = "none";
            });
        } else {
            const code = item.indicator_code ?? "";
            const name = item.indicator_name ?? code;
            div.textContent = `${name} (${code})`;
            div.addEventListener("click", async () => {
                if (callbacks.onIndicatorSelect) await callbacks.onIndicatorSelect(type, code, name);
                box.innerHTML = "";
                box.style.display = "none";
            });
        }

        box.appendChild(div);
    });

    box.style.display = "block";
}

function hideSuggestionBoxes(...boxIds) {
    boxIds.forEach((id) => {
        const box = document.getElementById(id);
        if (box) box.style.display = "none";
    });
}

// session storage
function saveGeneratedExercise(exercise) {
    sessionStorage.setItem("current_generated_exercise", JSON.stringify(exercise));
}

function saveCurrentExercise(exercise) {
    sessionStorage.setItem("current_saved_exercise", JSON.stringify(exercise));
    if (exercise?.exercise_id || exercise?.id) {
        sessionStorage.setItem("current_exercise_id", String(exercise.exercise_id || exercise.id));
    }
}

function loadCurrentExerciseFromSession() {
    try {
        const raw = sessionStorage.getItem("current_saved_exercise");
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function loadExerciseFromAnySession() {
    const keys = ["loaded_saved_exercise", "current_generated_exercise", "current_saved_exercise"];
    for (const key of keys) {
        try {
            const raw = sessionStorage.getItem(key);
            if (raw) return JSON.parse(raw);
        } catch { }
    }
    return null;
}

function clearExerciseSessionState() {
    sessionStorage.removeItem("current_saved_exercise");
    sessionStorage.removeItem("current_exercise_id");
    sessionStorage.removeItem("loaded_saved_exercise");
    sessionStorage.removeItem("current_generated_exercise");
}

// server actions
async function saveExerciseToServer(exercise, exerciseName) {
    const payload = { ...exercise, name: exerciseName };

    const res = await fetch(`${API_BASE}/gapminder/save-exercise`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || "Could not save exercise.");
    return result;
}

async function exportExerciseCsv(exercise) {
    const res = await fetch(`${API_BASE}/gapminder/export-csv`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(exercise)
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Could not export CSV.");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gapminders_export.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

// navigation
function wireCommonNavigation(config = {}) {
    document.getElementById("link-home")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (config.clearStateOnHome) clearExerciseSessionState();
        window.location.href = "Home.html";
    });

    document.getElementById("Return")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (config.clearStateOnHome) clearExerciseSessionState();
        window.location.href = "Home.html";
    });

    document.getElementById("Back")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (config.backHref) {
            if (config.clearStateOnBack) clearExerciseSessionState();
            window.location.href = config.backHref;
        } else {
            window.location.href = "Home.html";
        }
    });

    document.getElementById("link-explore")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (config.clearStateOnNav) clearExerciseSessionState();
        window.location.href = "ExploreData1.html";
    });

    document.getElementById("link-saved")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "SavedExercises.html";
    });

    document.getElementById("link-correlation")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "Submissions.html";
    });
}