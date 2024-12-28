// DOM Elements
const taskInput = document.getElementById("task-input");
const taskCategory = document.getElementById("task-category");
const dueDateInput = document.getElementById("due-date");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const progressBar = document.getElementById("progress-bar");
const searchBar = document.getElementById("search-bar");
const toggleThemeBtn = document.getElementById("toggle-theme");

// Task Array and Local Storage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Analyze task input for category and priority
function analyzeTaskInput(taskText) {
  const nlp = window.nlp;

  const workKeywords = ["report", "meeting", "deadline", "email"];
  const personalKeywords = ["call", "buy", "clean", "plan"];
  const urgentKeywords = ["urgent", "immediately", "asap"];
  const highPriorityKeywords = ["important", "critical", "priority"];

  let category = "Personal"; // Default
  let priority = "Medium"; // Default

  if (workKeywords.some((kw) => taskText.includes(kw))) {
    category = "Work";
  }
  if (urgentKeywords.some((kw) => taskText.includes(kw))) {
    category = "Urgent";
    priority = "High";
  } else if (highPriorityKeywords.some((kw) => taskText.includes(kw))) {
    priority = "High";
  }

  return { category, priority };
}

// Render Tasks
function renderTasks(filter = "") {
  taskList.innerHTML = "";
  const filteredTasks = tasks.filter(task =>
    task.text.toLowerCase().includes(filter.toLowerCase())
  );

  filteredTasks.forEach((task, index) => {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";
    taskCard.setAttribute("draggable", "true");
    taskCard.addEventListener("dragstart", () => taskCard.classList.add("dragging"));
    taskCard.addEventListener("dragend", () => taskCard.classList.remove("dragging"));

    taskCard.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5>${task.text}</h5>
          <p class="task-category">${task.category}</p>
          <p class="text-muted">${task.dueDate ? `Due: ${task.dueDate}` : ""}</p>
        </div>
        <span class="task-priority ${
          task.priority === "High"
            ? "priority-high"
            : task.priority === "Medium"
            ? "priority-medium"
            : "priority-low"
        }">${task.priority}</span>
      </div>
      <div class="d-flex justify-content-end mt-2">
        <button class="btn btn-success btn-sm me-2" onclick="toggleTask(${index})">
          ${task.completed ? "Undo" : "Complete"}
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteTask(${index})">Delete</button>
      </div>
    `;
    taskList.appendChild(taskCard);
  });

  updateProgress();
}

// Add Task
addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (!text) {
    alert("Please enter a task.");
    return;
  }

  const analysis = analyzeTaskInput(text);

  tasks.push({
    text,
    category: analysis.category,
    dueDate: dueDateInput.value || null,
    completed: false,
    priority: analysis.priority,
  });

  taskInput.value = "";
  dueDateInput.value = "";
  saveTasks();
  renderTasks();
});

// Toggle Task Completion
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Delete Task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Update Progress
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const progress = total ? (completed / total) * 100 : 0;

  progressBar.style.width = `${progress}%`;
  progressBar.textContent = `${Math.round(progress)}%`;

  progressBar.style.backgroundColor =
    progress === 100 ? "#2ecc71" : progress > 50 ? "#f39c12" : "#e74c3c";
}

// Search Tasks
searchBar.addEventListener("input", () => {
  renderTasks(searchBar.value);
});

// Theme Toggle
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  saveThemePreference();
});

function saveThemePreference() {
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
}

function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
}

// Save Tasks
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load Theme on Start
loadTheme();
renderTasks();

// Initialize Particles.js
particlesJS("particles-js", {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#ffffff" },
      shape: { type: "circle", stroke: { width: 0, color: "#000000" } },
      opacity: { value: 0.5, anim: { enable: false } },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4 },
      move: { enable: true, speed: 3, direction: "none", out_mode: "out" },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
      },
      modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } },
    },
    retina_detect: true,
  });
  
  // Voice Command Implementation
const micButton = document.getElementById("voice-command");
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US"; // Set language for voice recognition

// Start Listening on Button Click
micButton.addEventListener("click", () => {
  recognition.start();
  micButton.textContent = "🎙 Listening...";
});

// Process Voice Command
recognition.onresult = (event) => {
  const command = event.results[0][0].transcript.toLowerCase();
  console.log("Voice Command:", command);
  micButton.textContent = "🎤 Voice Command";

  // Handle Commands
  if (command.startsWith("add task")) {
    const taskName = command.replace("add task", "").trim();
    if (taskName) {
      tasks.push({
        text: taskName,
        category: "Personal",
        dueDate: null,
        completed: false,
        priority: "Medium",
      });
      saveTasks();
      renderTasks();
      alert(`Task "${taskName}" added!`);
    }
  } else if (command.startsWith("complete task")) {
    const taskIndex = parseInt(command.replace("complete task", "").trim()) - 1;
    if (tasks[taskIndex]) {
      tasks[taskIndex].completed = true;
      saveTasks();
      renderTasks();
      alert(`Task "${tasks[taskIndex].text}" marked as complete!`);
    }
  } else if (command.startsWith("search tasks")) {
    const searchKeyword = command.replace("search tasks", "").trim();
    searchBar.value = searchKeyword;
    renderTasks(searchKeyword);
  } else {
    alert("Sorry, I didn't understand that command.");
  }
};

// Handle Errors
recognition.onerror = (event) => {
  console.error("Voice Command Error:", event.error);
  micButton.textContent = "🎤 Voice Command";
};
