document.addEventListener("DOMContentLoaded", () => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return (window.location.href = "index.html");

    document.getElementById("welcomeUser").textContent = `Welcome, ${currentUser}!`;
    loadWorkspaces();
    loadTasks();
    updatePendingTaskCount();
});

function getWorkspaces() {
    return JSON.parse(localStorage.getItem(`workspaces_${localStorage.getItem("currentUser")}`)) || [];
}

function saveWorkspaces(workspaces) {
    localStorage.setItem(`workspaces_${localStorage.getItem("currentUser")}`, JSON.stringify(workspaces));
}

function getWorkspace() {
    const index = localStorage.getItem("currentWorkspaceIndex");
    return index !== null ? getWorkspaces()[index] : null;
}

function saveWorkspace(workspace) {
    let workspaces = getWorkspaces();
    workspaces[localStorage.getItem("currentWorkspaceIndex")] = workspace;
    saveWorkspaces(workspaces);
}

function addTask() {
    const taskInput = document.getElementById("taskInput").value.trim();
    const taskDate = document.getElementById("taskDate").value;
    if (!taskInput || !taskDate) return alert("Enter task and date!");

    let workspace = getWorkspace();
    if (!workspace) return alert("Select a workspace first!");

    workspace.tasks.push({ task: taskInput, date: taskDate, completed: false, owner: localStorage.getItem("currentUser") });
    saveWorkspace(workspace);

    document.getElementById("taskInput").value = "";
    loadTasks();
    updatePendingTaskCount();
}

function loadTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    const workspace = getWorkspace();
    if (!workspace) return;

    workspace.tasks.forEach((task, index) => {
        if (task.owner !== localStorage.getItem("currentUser")) return;

        const li = document.createElement("li");
        li.innerHTML = `
            <span class="${task.completed ? 'completed' : ''}">${task.task}</span>
            <span class="${new Date(task.date) < new Date() ? 'overdue' : ''}">${task.date}</span>
            <button onclick="completeTask(${index})">✔️</button>
            <button onclick="deleteTask(${index})">🗑️</button>
        `;
        taskList.appendChild(li);
    });
}

function completeTask(index) {
    let workspace = getWorkspace();
    if (!workspace || workspace.tasks[index].owner !== localStorage.getItem("currentUser")) return;

    workspace.tasks[index].completed = true;
    saveWorkspace(workspace);
    loadTasks();
    updatePendingTaskCount();
}

function deleteTask(index) {
    let workspace = getWorkspace();
    if (!workspace || workspace.tasks[index].owner !== localStorage.getItem("currentUser")) return;

    workspace.tasks.splice(index, 1);
    saveWorkspace(workspace);
    loadTasks();
    updatePendingTaskCount();
}

function updatePendingTaskCount() {
    const workspace = getWorkspace();
    if (!workspace) return;

    let pending = workspace.tasks.filter(task => !task.completed && task.owner === localStorage.getItem("currentUser")).length;
    document.getElementById("welcomeUser").textContent = `Welcome, ${localStorage.getItem("currentUser")}! 📝 (${pending} Pending)`;
    if (!pending) alert("🎉 All tasks completed! Great job!");
}

function loadWorkspaces() {
    const workspaceList = document.getElementById("workspaceList");
    workspaceList.innerHTML = "";

    getWorkspaces().forEach((ws, i) => {
        let li = document.createElement("li");
        li.innerHTML = `
            <span onclick="selectWorkspace(${i})">${ws.name}</span>
            <button onclick="deleteWorkspace(${i})">🗑️</button>
        `;
        workspaceList.appendChild(li);
    });
}

function addWorkspace() {
    const workspaces = getWorkspaces();
    const newWorkspace = { name: `Workspace ${workspaces.length + 1}`, tasks: [] };
    workspaces.push(newWorkspace);
    saveWorkspaces(workspaces);
    loadWorkspaces();
}

function selectWorkspace(index) {
    localStorage.setItem("currentWorkspaceIndex", index);
    document.getElementById("workspaceTitle").textContent = `Tasks - ${getWorkspaces()[index].name}`;
    loadTasks();
    updatePendingTaskCount();
}

function deleteWorkspace(index) {
    let workspaces = getWorkspaces();
    if (!confirm(`Are you sure you want to delete "${workspaces[index].name}"?`)) return;

    workspaces.splice(index, 1);
    saveWorkspaces(workspaces);

    if (localStorage.getItem("currentWorkspaceIndex") == index) localStorage.removeItem("currentWorkspaceIndex");

    loadWorkspaces();
    loadTasks();
    updatePendingTaskCount();
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

function signOut() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}
