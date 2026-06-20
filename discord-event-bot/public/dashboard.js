let users = [];

async function loadUsers() {
    try {
        const res = await fetch("/api/users");
        users = await res.json();
        renderTable();
    } catch (e) {
        alert("Failed to load users.json from server.");
        console.error(e);
    }
}

function renderTable() {
    const tbody = document.querySelector("#userTable tbody");
    tbody.innerHTML = "";

    users.forEach((u, i) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><input value="${u.id || ""}" onchange="update(${i}, 'id', this.value)"></td>
            <td><input value="${u.name || ""}" onchange="update(${i}, 'name', this.value)"></td>
            <td><input value="${u.timezone || ""}" onchange="update(${i}, 'timezone', this.value)"></td>
            <td><button onclick="removeUser(${i})">X</button></td>
        `;

        tbody.appendChild(row);
    });
}

function update(index, field, value) {
    users[index][field] = value;
}

function addUser() {
    users.push({ id: "", name: "", timezone: "" });
    renderTable();
}

function removeUser(i) {
    users.splice(i, 1);
    renderTable();
}

async function saveUsers() {
    try {
        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(users)
        });

        if (!res.ok) throw new Error("Failed to save");

        alert("Saved!");
    } catch (e) {
        alert("Failed to save users.json.");
        console.error(e);
    }
}

loadUsers();