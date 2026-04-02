const API_URL = "http://localhost:8000";
let token = localStorage.getItem("token");

// Auth Elements
const authContainer = document.getElementById("auth-container");
const dashboardContainer = document.getElementById("dashboard-container");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authBtn = document.getElementById("auth-btn");
const toggleAuth = document.getElementById("toggle-auth");

// Transaction Elements
const transactionForm = document.getElementById("transaction-form");
const transactionsList = document.getElementById("transactions-list");
const pricesList = document.getElementById("prices-list");

let isLogin = true;

// Initialize
if (token) {
    showDashboard();
}

// Auth Toggle
toggleAuth.addEventListener("click", () => {
    isLogin = !isLogin;
    authTitle.textContent = isLogin ? "Login" : "Sign Up";
    authBtn.textContent = isLogin ? "Login" : "Sign Up";
    toggleAuth.querySelector("span").textContent = isLogin ? "Sign Up" : "Login";
});

// Auth Submit
authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const endpoint = isLogin ? "/token" : "/signup";
    const body = isLogin 
        ? new URLSearchParams({ username, password }) 
        : JSON.stringify({ username, password });

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: isLogin ? { "Content-Type": "application/x-www-form-urlencoded" } : { "Content-Type": "application/json" },
            body: body
        });

        const data = await res.json();
        if (res.ok) {
            if (isLogin) {
                token = data.access_token;
                localStorage.setItem("token", token);
                showDashboard();
            } else {
                alert("Account created! Please login.");
                isLogin = true;
                authTitle.textContent = "Login";
                authBtn.textContent = "Login";
            }
        } else {
            alert(data.detail || "Error occurred");
        }
    } catch (err) {
        alert("Failed to connect to server");
    }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    token = null;
    authContainer.classList.remove("hidden");
    dashboardContainer.classList.add("hidden");
});

function showDashboard() {
    authContainer.classList.add("hidden");
    dashboardContainer.classList.remove("hidden");
    loadTransactions();
    loadPrices();
    setInterval(loadPrices, 30000); // Update every 30s
}

// Load Prices
async function loadPrices() {
    try {
        const res = await fetch(`${API_URL}/live-prices`);
        const data = await res.json();
        
        let html = "";
        data.crypto.forEach(c => {
            html += `<div class="price-item"><strong>${c.symbol}:</strong> $${parseFloat(c.price).toLocaleString()}</div>`;
        });
        html += `<div class="price-item"><strong>Gold (PAXG):</strong> $${parseFloat(data.gold.price).toLocaleString()}</div>`;
        pricesList.innerHTML = html;
    } catch (err) {
        pricesList.innerHTML = "Failed to load prices";
    }
}

// Load Transactions
async function loadTransactions() {
    try {
        const res = await fetch(`${API_URL}/transactions/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        transactionsList.innerHTML = data.map(t => `
            <tr>
                <td>${t.asset_type.toUpperCase()}</td>
                <td>${t.asset_name}</td>
                <td>${t.amount}</td>
                <td>$${t.purchase_price}</td>
                <td>${t.notes || "-"}</td>
                <td>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
                </td>
            </tr>
        `).join("");
    } catch (err) {
        console.error(err);
    }
}

// Add Transaction
transactionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        asset_type: document.getElementById("asset_type").value,
        asset_name: document.getElementById("asset_name").value,
        amount: parseFloat(document.getElementById("amount").value),
        purchase_price: parseFloat(document.getElementById("purchase_price").value),
        notes: document.getElementById("notes").value
    };

    try {
        const res = await fetch(`${API_URL}/transactions/`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            transactionForm.reset();
            loadTransactions();
        } else {
            const err = await res.json();
            alert(err.detail);
        }
    } catch (err) {
        alert("Failed to add transaction");
    }
});

// Delete Transaction
async function deleteTransaction(id) {
    if (!confirm("Are you sure?")) return;
    
    try {
        const res = await fetch(`${API_URL}/transactions/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            loadTransactions();
        }
    } catch (err) {
        alert("Failed to delete");
    }
}
