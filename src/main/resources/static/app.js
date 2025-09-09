document.addEventListener("DOMContentLoaded", () => {
    // Page-specific initializations
    if (document.getElementById("bmiForm")) {
        document.getElementById("bmiForm").addEventListener("submit", handleBmiSubmit);
    }
    if (document.getElementById("caloriesForm")) {
        document.getElementById("caloriesForm").addEventListener("submit", handleCaloriesSubmit);
    }
    if (document.getElementById("macrosForm")) {
        document.getElementById("macrosForm").addEventListener("submit", handleMacrosSubmit);
    }
    // Check for the new gauge container instead of the old chart
    if (document.getElementById("bmi-gauge-container")) {
        loadDashboardData();
    }
});


// --- Universal Request Helpers ---
async function postData(url, data) {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const errorBody = await res.text();
            throw new Error(errorBody || `HTTP error! Status: ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        console.error("Error in postData:", err);
        throw err;
    }
}

async function getData(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("Error in getData:", err);
        throw err;
    }
}

// --- UI Helper Functions ---
function showLoading(form) {
    const button = form.querySelector("button[type='submit']");
    const spinner = button.querySelector(".spinner-border");
    if (button && spinner) {
        button.disabled = true;
        spinner.classList.remove("d-none");
    }
}

function hideLoading(form) {
    const button = form.querySelector("button[type='submit']");
    const spinner = button.querySelector(".spinner-border");
    if (button && spinner) {
        button.disabled = false;
        spinner.classList.add("d-none");
    }
}

function displayError(form, message) {
    const errorAlert = form.parentElement.querySelector("#error-alert");
    if (errorAlert) {
        errorAlert.textContent = `Error: ${message}`;
        errorAlert.classList.remove("d-none");
    }
}

function hideError(form) {
    const errorAlert = form.parentElement.querySelector("#error-alert");
    if (errorAlert) {
        errorAlert.classList.add("d-none");
    }
}

// --- Form Handlers ---
async function handleBmiSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const resultDiv = document.getElementById("bmiResult");
    showLoading(form);
    hideError(form);
    resultDiv.classList.add("d-none");
    try {
        const data = {
            weightKg: parseFloat(document.getElementById("weight").value),
            heightCm: parseFloat(document.getElementById("height").value)
        };
        const result = await postData("/api/bmi", data);
        resultDiv.innerHTML = `<h4>BMI Result</h4><p><span class="value">${result.bmi}</span></p><p>Category: <span class="value">${result.category}</span></p>`;
        resultDiv.classList.remove("d-none");
    } catch (error) {
        displayError(form, "Could not calculate BMI. Please check your inputs.");
    } finally {
        hideLoading(form);
    }
}

async function handleCaloriesSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const resultDiv = document.getElementById("caloriesResult");
    showLoading(form);
    hideError(form);
    resultDiv.classList.add("d-none");
    try {
        const data = {
            sex: document.getElementById("sex").value.toUpperCase(),
            age: parseInt(document.getElementById("age").value),
            weightKg: parseFloat(document.getElementById("weight").value),
            heightCm: parseFloat(document.getElementById("height").value),
            activityLevel: document.getElementById("activity").value.toUpperCase(),
            goal: document.getElementById("goal").value.toUpperCase()
        };
        const result = await postData("/api/calories", data);
        resultDiv.innerHTML = `<h4>Your Calorie Needs</h4><p>Maintenance (TDEE): <span class="value">${result.tdee} kcal</span></p><p><b>Your Goal: <span class="value">${result.goalCalories} kcal</span></b></p><hr><p class="small text-muted mb-0">Basal Metabolic Rate (BMR): ${result.bmr} kcal</p>`;
        resultDiv.classList.remove("d-none");
    } catch (error) {
        displayError(form, "Could not calculate calories. Please check your inputs.");
    } finally {
        hideLoading(form);
    }
}

async function handleMacrosSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const resultDiv = document.getElementById("macrosResult");
    showLoading(form);
    hideError(form);
    resultDiv.classList.add("d-none");
    try {
        const data = {
            calories: parseInt(document.getElementById("calories").value),
            proteinPercent: parseFloat(document.getElementById("protein").value),
            fatPercent: parseFloat(document.getElementById("fat").value),
            carbPercent: parseFloat(document.getElementById("carbs").value)
        };
        const result = await postData("/api/macros", data);
        resultDiv.innerHTML = `<h4>Your Daily Macros</h4><p>Protein: <span class="value">${result.proteinGrams}g</span></p><p>Fat: <span class="value">${result.fatGrams}g</span></p><p>Carbs: <span class="value">${result.carbGrams}g</span></p>`;
        resultDiv.classList.remove("d-none");
    } catch (error) {
        const errorMessage = error.message.includes("100") ? "Percentages must add up to 100." : "Could not calculate macros. Please check your inputs.";
        displayError(form, errorMessage);
    } finally {
        hideLoading(form);
    }
}

// --- Dashboard Logic ---
async function loadDashboardData() {
    try {
        const [bmiHistory, caloriesHistory, macrosHistory] = await Promise.all([
            getData("/api/bmi/history"),
            getData("/api/calories/history"),
            getData("/api/macros/history")
        ]);
        renderBmiGauge(bmiHistory);
        displayLatestCalories(caloriesHistory);
        displayLatestMacros(macrosHistory);
    } catch (error) {
        console.error("Failed to load dashboard data:", error);
    }
}

function renderBmiGauge(data) {
    const gaugeContainer = document.getElementById('bmi-gauge-container');
    const noDataEl = document.getElementById('bmi-no-data');

    if (!data || data.length === 0) {
        noDataEl.classList.remove('d-none');
        if (gaugeContainer) gaugeContainer.style.display = 'none';
        return;
    }

    noDataEl.classList.add('d-none');
    if (gaugeContainer) gaugeContainer.style.display = 'block';

    const latest = data[data.length - 1];
    const bmi = latest.bmi;

    const indicator = document.getElementById('bmiIndicator');
    const resultText = document.getElementById('bmiResultText');

    const minScale = 15.0;
    const maxScale = 35.0;
    
    let percent = ((bmi - minScale) / (maxScale - minScale)) * 100;
    percent = Math.max(0, Math.min(100, percent));

    indicator.style.left = percent + '%';

    resultText.innerHTML = `
        Your BMI is <strong style="font-size: 1.2rem;">${bmi}</strong>,
        which is in the <strong style="font-size: 1.2rem;">${latest.category}</strong> range.
    `;
}

function displayLatestCalories(data) {
    const container = document.getElementById('calories-latest');
    if (!data || data.length === 0) return;
    const latest = data[data.length - 1];
    container.innerHTML = `<div class="text-center"><h3 class="value">${latest.goalCalories} kcal</h3><p class="text-muted">Your daily goal</p></div><hr><p class="small"><strong>Goal:</strong> ${latest.goal}</p><p class="small mb-0"><strong>TDEE:</strong> ${latest.tdee} kcal</p>`;
}

function displayLatestMacros(data) {
    const container = document.getElementById('macros-latest');
    if (!data || data.length === 0) return;
    const latest = data[data.length - 1];
    container.innerHTML = `<div class="row text-center"><div class="col-4"><h5 class="value">${latest.proteinGrams}g</h5><p class="text-muted small">Protein</p></div><div class="col-4"><h5 class="value">${latest.fatGrams}g</h5><p class="text-muted small">Fat</p></div><div class="col-4"><h5 class="value">${latest.carbGrams}g</h5><p class="text-muted small">Carbs</p></div></div><p class="text-center small text-muted mt-2">Based on ${latest.calories} kcal</p>`;
}