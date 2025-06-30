// ========== Theme Check ========== 
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  const toggle = document.getElementById("darkToggle");
  if (toggle) toggle.checked = true;
}

// ========== Login Page ========== 
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    if (username && password) {
      localStorage.setItem("currentUser", username);
      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        window.location.href = "dashboard.html";
      });
    } else {
      Swal.fire("Error", "Please enter username and password", "error");
    }
  });
}
function togglePassword() {
  const passInput = document.getElementById("password");
  if (passInput.type === "password") {
    passInput.type = "text";
  } else {
    passInput.type = "password";
  }
}


// ========== Dashboard Page ========== 
const userNameSpan = document.getElementById("userName");
if (userNameSpan) {
  const user = localStorage.getItem("currentUser");
  if (!user) {
    window.location.href = "index.html";
  } else {
    userNameSpan.textContent = user;
  }
}

// ========== Dark Mode Toggle ========== 
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", mode);
}

// ========== SETTINGS PAGE ========== 
document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const notificationsToggle = document.getElementById("notificationsToggle");
  const autosaveToggle = document.getElementById("autosaveToggle");
  const backupToggle = document.getElementById("backupToggle");

  if (darkModeToggle) {
    const isDark = localStorage.getItem("theme") === "dark";
    darkModeToggle.checked = isDark;
    if (isDark) document.body.classList.add("dark-mode");

    darkModeToggle.addEventListener("change", function () {
      toggleDarkMode();
      localStorage.setItem("theme", this.checked ? "dark" : "light");
    });
  }

  if (notificationsToggle) {
    notificationsToggle.checked = localStorage.getItem("notifications") === "true";
    notificationsToggle.addEventListener("change", function () {
      localStorage.setItem("notifications", this.checked);
    });
  }

  if (autosaveToggle) {
    autosaveToggle.checked = localStorage.getItem("autosave") === "true";
    autosaveToggle.addEventListener("change", function () {
      localStorage.setItem("autosave", this.checked);
    });
  }

  if (backupToggle) {
    backupToggle.checked = localStorage.getItem("backup") === "true";
    backupToggle.addEventListener("change", function () {
      localStorage.setItem("backup", this.checked);
    });
  }

  const saveBtn = document.querySelector(".save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      Swal.fire({
        icon: "success",
        title: "Settings Saved!",
        text: "Your preferences are now updated.",
        confirmButtonColor: "#4CAF50"
      });
    });
  }
});

// ========== Logout ========== 
function logout() {
  Swal.fire({
    title: "Are you sure?",
    text: "You will be logged out.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, Logout"
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("currentUser");
      Swal.fire({
        title: "Logged Out!",
        icon: "success",
        timer: 1200,
        showConfirmButton: false
      }).then(() => {
        window.location.href = "index.html";
      });
    }
  });
}

// ========== Back Button ========== 
function goBack() {
  window.history.back();
}

// ========== Load Entries ========== 
function loadAllEntries() {
  const container = document.getElementById("entriesList");
  if (!container) return;

  const user = localStorage.getItem("currentUser");
  const entries = JSON.parse(localStorage.getItem("allEntries")) || [];

  const userEntries = entries
    .map((entry, index) => ({ ...entry, index }))
    .filter(entry => entry.user === user);

  if (userEntries.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:gray;">No entries found yet. Write something first!</p>`;
    return;
  }

  container.innerHTML = "";

  userEntries.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "entry-card";

    card.innerHTML = `
      <h3>${entry.title || "Untitled Entry"}</h3>
      <small>${entry.date || new Date().toLocaleString()}</small>
      <p>${(entry.content || "").slice(0, 100)}...</p>
      <div class="entry-actions">
        <button onclick="editEntry(${entry.index})">✏️ Edit</button>
        <button onclick="deleteEntry(${entry.index})">🗑 Delete</button>
      </div>
    `;

    container.appendChild(card);
  });
}

// ========== Delete Entry ========== 
function deleteEntry(index) {
  Swal.fire({
    title: "Are you sure?",
    text: "This entry will be deleted permanently.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it"
  }).then((result) => {
    if (result.isConfirmed) {
      const allEntries = JSON.parse(localStorage.getItem("allEntries") || "[]");
      allEntries.splice(index, 1);
      localStorage.setItem("allEntries", JSON.stringify(allEntries));
      loadAllEntries();
      Swal.fire("Deleted!", "The entry has been removed.", "success");
    }
  });
}

// ========== Edit Entry ========== 
function editEntry(index) {
  const allEntries = JSON.parse(localStorage.getItem("allEntries") || "[]");
  const entry = allEntries[index];
  localStorage.setItem("editIndex", index);
  localStorage.setItem("editEntry", JSON.stringify(entry));
  window.location.href = "write.html";
}

// ========== Save Entry ========== 
function saveDiary() {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("diaryContent").value.trim();
  const user = localStorage.getItem("currentUser");

  if (!user) {
    Swal.fire("Error", "You are not logged in.", "error");
    return;
  }

  if (!content) {
    Swal.fire("Error", "Please write something in your diary!", "error");
    return;
  }

  const entry = {
    user,
    title: title || "Untitled Entry",
    content,
    date: new Date().toLocaleString()
  };

  let allEntries = JSON.parse(localStorage.getItem("allEntries")) || [];
  const editIndex = localStorage.getItem("editIndex");

  if (editIndex !== null) {
    allEntries[parseInt(editIndex)] = entry;
    localStorage.removeItem("editIndex");
    localStorage.removeItem("editEntry");
  } else {
    allEntries.push(entry);
  }

  localStorage.setItem("allEntries", JSON.stringify(allEntries));
  localStorage.setItem("lastDiary", JSON.stringify(entry));

  Swal.fire({
    icon: "success",
    title: "Saved!",
    text: "Your diary has been saved.",
    timer: 1500,
    showConfirmButton: false
  }).then(() => {
    window.location.href = "entries.html";
  });
}

// ========== Load Last Diary ========== 
function loadDiary() {
  const lastEntry = localStorage.getItem("lastDiary");
  if (!lastEntry) {
    Swal.fire("No Entry", "No previous diary found!", "info");
    return;
  }

  const entry = JSON.parse(lastEntry);
  document.getElementById("title").value = entry.title || "";
  document.getElementById("diaryContent").value = entry.content || "";
  Swal.fire("Loaded", "Your last saved diary has been loaded.", "success");
}

// ========== Preview Image ========== 
function previewImage() {
  const file = document.getElementById("imageUpload").files[0];
  const preview = document.getElementById("preview");
  preview.innerHTML = "";

  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxWidth = "100%";
      img.style.marginTop = "10px";
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  } else {
    Swal.fire("Invalid", "Please upload a valid image file.", "error");
  }
}

// ========== Clear All Entries ========== 
function clearEntries() {
  Swal.fire({
    title: "Are you sure?",
    text: "This will delete all your diary entries.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete all"
  }).then((result) => {
    if (result.isConfirmed) {
      const currentUser = localStorage.getItem("currentUser");
      const allEntries = JSON.parse(localStorage.getItem("allEntries") || "[]");
      const filtered = allEntries.filter((e) => e.user !== currentUser);
      localStorage.setItem("allEntries", JSON.stringify(filtered));
      Swal.fire("Cleared!", "All your entries were deleted.", "success");
      if (document.getElementById("entriesList")) loadAllEntries();
    }
  });
}

// ========== Change Name ========== 
function changeName() {
  const newName = prompt("Enter new name:");
  if (newName && newName.trim()) {
    localStorage.setItem("currentUser", newName.trim());
    Swal.fire("Updated!", "Your name has been changed.", "success");
  }
}

// ========== On Page Load ========== 
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("entriesList")) loadAllEntries();
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("diaryContent");
  const editEntryData = localStorage.getItem("editEntry");

  if (titleInput && contentInput && editEntryData) {
    const entryData = JSON.parse(editEntryData);
    titleInput.value = entryData.title || "";
    contentInput.value = entryData.content || "";
  }

  const dateTimeSpan = document.getElementById("dateTime");
  if (dateTimeSpan) {
    setInterval(() => {
      dateTimeSpan.textContent = new Date().toLocaleString();
    }, 1000);
  }
});
