import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentUser = null;
let isSignUpMode = false;
let cachedLogs = {};
let currentStatsFilter = 'month';

function getFormattedDate(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const todayStr = getFormattedDate();

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleMode = document.getElementById('auth-toggle-mode');
const authError = document.getElementById('auth-error');

function setupGreeting() {
    const hour = new Date().getHours();
    let greet = "Good morning!";
    if (hour >= 12 && hour < 17) greet = "Good afternoon!";
    else if (hour >= 17) greet = "Good evening!";
    document.getElementById('greeting-title').textContent = greet;

    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('current-date-badge').textContent = new Date().toLocaleDateString('en-US', options);
}
setupGreeting();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        authScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        document.getElementById('profile-email-display').textContent = user.email;
        document.getElementById('backfill-date').value = todayStr;

        await loadUserLogs();
        checkTodayStatus();
        computeStats();
    } else {
        currentUser = null;
        appScreen.classList.add('hidden');
        authScreen.classList.remove('hidden');
    }
});

authToggleMode.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    authSubmitBtn.textContent = isSignUpMode ? 'Create Account' : 'Sign In';
    authToggleMode.textContent = isSignUpMode ? 'Already have an account? Sign in' : 'Need an account? Sign up';
    authError.classList.add('hidden');
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');
    const email = authEmail.value;
    const password = authPassword.value;

    try {
        if (isSignUpMode) {
            await createUserWithEmailAndPassword(auth, email, password);
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (err) {
        authError.textContent = err.message;
        authError.classList.remove('hidden');
    }
});

window.handleSignOut = async function () {
    await signOut(auth);
};

window.switchTab = function (tabName) {
    ['dashboard', 'stats', 'history', 'profile'].forEach(t => {
        document.getElementById(`tab-${t}`).classList.add('hidden');
        const navBtn = document.getElementById(`nav-${t}`);
        navBtn.className = "px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-slate-400 hover:text-slate-200 hover:bg-dark-800 flex items-center space-x-2";
    });

    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`nav-${tabName}`);
    activeBtn.className = "px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 flex items-center space-x-2";
};

async function loadUserLogs() {
    if (!currentUser) return;
    try {
        const logsRef = collection(db, "users", currentUser.uid, "commutes");
        const snapshot = await getDocs(logsRef);
        cachedLogs = {};
        snapshot.forEach(docSnap => {
            cachedLogs[docSnap.id] = docSnap.data().choice;
        });
        renderRecentLogs();
    } catch (e) {
        console.error("Error loading logs:", e);
    }
}

window.submitTodayChoice = async function (choice) {
    if (!currentUser) return;
    try {
        const docRef = doc(db, "users", currentUser.uid, "commutes", todayStr);
        await setDoc(docRef, { choice, timestamp: new Date().toISOString() });
        cachedLogs[todayStr] = choice;
        checkTodayStatus();
        computeStats();
        renderRecentLogs();
    } catch (e) {
        alert("Error saving choice: " + e.message);
    }
};

window.resetTodayChoice = function () {
    document.getElementById('choice-selection-area').classList.remove('hidden');
    document.getElementById('choice-logged-display').classList.add('hidden');
};

function checkTodayStatus() {
    const selectionArea = document.getElementById('choice-selection-area');
    const loggedDisplay = document.getElementById('choice-logged-display');

    if (cachedLogs[todayStr]) {
        const choice = cachedLogs[todayStr];
        selectionArea.classList.add('hidden');
        loggedDisplay.classList.remove('hidden');
        document.getElementById('logged-choice-title').textContent = choice;

        const iconWrap = document.getElementById('logged-icon-wrap');
        if (choice === 'Metro') {
            iconWrap.className = "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
            iconWrap.innerHTML = '<i class="fa-solid fa-train-subway"></i>';
        } else if (choice === 'Bus') {
            iconWrap.className = "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            iconWrap.innerHTML = '<i class="fa-solid fa-bus"></i>';
        } else {
            iconWrap.className = "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20";
            iconWrap.innerHTML = '<i class="fa-solid fa-mug-hot"></i>';
        }
    } else {
        selectionArea.classList.remove('hidden');
        loggedDisplay.classList.add('hidden');
    }
}

window.saveBackfillEntry = async function () {
    if (!currentUser) return;
    const dateVal = document.getElementById('backfill-date').value;
    const choiceVal = document.getElementById('backfill-choice').value;
    if (!dateVal) {
        alert("Please select a date.");
        return;
    }

    try {
        const docRef = doc(db, "users", currentUser.uid, "commutes", dateVal);
        await setDoc(docRef, { choice: choiceVal, timestamp: new Date().toISOString() });
        cachedLogs[dateVal] = choiceVal;
        if (dateVal === todayStr) checkTodayStatus();
        computeStats();
        renderRecentLogs();
        alert("Successfully saved entry for " + dateVal);
    } catch (e) {
        alert("Error saving entry: " + e.message);
    }
};

function renderRecentLogs() {
    const listEl = document.getElementById('recent-logs-list');
    const dates = Object.keys(cachedLogs).sort().reverse();

    if (dates.length === 0) {
        listEl.innerHTML = '<div class="py-3 text-center text-xs text-slate-500">No records found yet.</div>';
        return;
    }

    listEl.innerHTML = dates.slice(0, 10).map(date => {
        const choice = cachedLogs[date];
        let badgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
        if (choice === 'Bus') badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (choice === 'Holiday') badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";

        return `
            <div class="py-3 flex items-center justify-between text-xs">
                <span class="text-slate-300 font-medium">${date}</span>
                <span class="px-2.5 py-1 rounded-full border ${badgeColor} font-semibold">${choice}</span>
            </div>
        `;
    }).join('');
}

window.setStatsFilter = function (filter) {
    currentStatsFilter = filter;
    ['month', 'all', 'custom'].forEach(f => {
        const btn = document.getElementById(`stat-btn-${f}`);
        if (f === filter) {
            btn.className = "px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-indigo-600 text-white";
        } else {
            btn.className = "px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-slate-400 hover:text-white";
        }
    });

    const customContainer = document.getElementById('custom-date-container');
    if (filter === 'custom') {
        customContainer.classList.remove('hidden');
    } else {
        customContainer.classList.add('hidden');
        computeStats();
    }
};

window.calculateCustomStats = function () {
    computeStats();
};

function computeStats() {
    let metro = 0, bus = 0, holiday = 0;
    const currentMonthPrefix = todayStr.substring(0, 7);

    let startDate = null, endDate = null;
    if (currentStatsFilter === 'custom') {
        startDate = document.getElementById('stat-start-date').value;
        endDate = document.getElementById('stat-end-date').value;
    }

    for (const [dateStr, choice] of Object.entries(cachedLogs)) {
        if (currentStatsFilter === 'month') {
            if (!dateStr.startsWith(currentMonthPrefix)) continue;
        } else if (currentStatsFilter === 'custom') {
            if (startDate && dateStr < startDate) continue;
            if (endDate && dateStr > endDate) continue;
        }

        if (choice === 'Metro') metro++;
        else if (choice === 'Bus') bus++;
        else if (choice === 'Holiday') holiday++;
    }

    const total = metro + bus + holiday;
    document.getElementById('stat-metro-count').textContent = metro;
    document.getElementById('stat-bus-count').textContent = bus;
    document.getElementById('stat-holiday-count').textContent = holiday;

    const metroPct = total > 0 ? Math.round((metro / total) * 100) : 0;
    const busPct = total > 0 ? Math.round((bus / total) * 100) : 0;
    const holidayPct = total > 0 ? Math.round((holiday / total) * 100) : 0;

    document.getElementById('stat-metro-pct').textContent = `${metroPct}% of total`;
    document.getElementById('stat-bus-pct').textContent = `${busPct}% of total`;
    document.getElementById('stat-holiday-pct').textContent = `${holidayPct}% of total`;

    document.getElementById('bar-metro').style.width = `${metroPct}%`;
    document.getElementById('bar-bus').style.width = `${busPct}%`;
    document.getElementById('bar-holiday').style.width = `${holidayPct}%`;
}