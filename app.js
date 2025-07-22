// ========== Supabase Setup ==========
const supabaseUrl = "https://himadfgtvxpranhtedxf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbWFkZmd0dnhwcmFuaHRlZHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzkwOTksImV4cCI6MjA2NzAxNTA5OX0.BxdQK6QQkrlR_CgONWNZfVZRZoB2JEIQjEPuf4YZm0I";
const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);

// ========== Dark Mode ==========
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  const toggle = document.getElementById("darkToggle");
  if (toggle) toggle.checked = true;
}
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", mode);
}

function showLoader() {
  const loader = document.createElement("div");
  loader.id = "globalLoader";
  loader.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div class="w-16 h-16 border-[6px] border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  `;
  document.body.appendChild(loader);
}

function hideLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.remove();
}



// ========== Sign Up ==========
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (password !== confirmPassword) {
       
    
      return Swal.fire("Error", "Passwords do not match", "error");
    }

    try {
      const { error } = await client.auth.signUp({ email, password });
       
      
      if (error) throw error;
      Swal.fire("Signed up!", "Check your email to confirm your account.", "success")
        .then(() => window.location.href = "index.html");
    } catch (err) {
      Swal.fire("Signup Failed", err.message, "error");
    }
  });
}

// ========== Login ==========
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
     
    const email = document.getElementById("loginEmailInput").value.trim();
    const password = document.getElementById("loginPasswordInput").value;

    if (!email || !password) {
      
      return Swal.fire("Error", "Please enter email and password", "error");
    }

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
    
      let msg = error.message.includes("confirm") ? "Please confirm your email first." : error.message;
      Swal.fire("Login Failed", msg, "error");
    } else {
      Swal.fire({ icon: "success", title: "Login Successful!", timer: 1500, showConfirmButton: false })
        .then(() => window.location.href = "dashboard.html");
    }
  });
}

// ========== google Login ==========
const googleBtn = document.getElementById("googleLoginBtn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    showLoader();
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + '/dashboard.html',
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
    if (error){
        hideLoader();
       Swal.fire("Google Login Failed", error.message, "error");}
  });
}
//================ github login
const githubLoginBtn = document.getElementById("githubLoginBtn");
if (githubLoginBtn) {
  githubLoginBtn.addEventListener("click", async () => {
     showLoader();
    const { error } = await client.auth.signInWithOAuth({
      provider: "github",
      options: {
       redirectTo: window.location.origin + '/dashboard.html',
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
    if (error){
       hideLoader();
      Swal.fire("GitHub Login Failed", error.message, "error");}
  });
}

// ========== Save Entry ==========
async function saveDiary() {

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("diaryContent").value.trim();
  const { data: { user } } = await client.auth.getUser();

  if (!user){
  
     return Swal.fire("Error", "Not logged in", "error");
    }
  if (!content){ 
    
    return Swal.fire("Error", "Write something!", "error");}

  const entry = {
    title: title || "Untitled Entry",
    content,
    user_id: user.id,
    date: new Date().toLocaleString()
  };

  const { error } = await client.from("diary_entries").insert([entry]);
  if (error){
    
     return Swal.fire("Error", error.message, "error");}

  Swal.fire("Saved!", "Your diary has been saved.", "success")
    .then(() => window.location.href = "entries.html");
}

// ========== Load Entries ==========
async function loadAllEntries() {
   showLoader();
  const container = document.getElementById("entriesList");
  if (!container) return;

  const { data: { user } } = await client.auth.getUser();
  if (!user) return (window.location.href = "index.html");

  const { data, error } = await client
    .from("diary_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });
      hideLoader();

  if (!data || data.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:gray;">No entries found yet.</p>`;
    return;
  }

  container.innerHTML = "";
  data.forEach(entry => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <h3>${entry.title}</h3>
      <small>${entry.date}</small>
      <p>${entry.content.slice(0, 100)}...</p>
      <div class="entry-actions">
        <button onclick="editEntry(${entry.id})">✏️ Edit</button>
        <button onclick="deleteEntry(${entry.id})">🗑 Delete</button>
      </div>`;
    container.appendChild(card);
  });
}



// ========== Logout ==========
async function logout() {
     showLoader();
  const { data: { user } } = await client.auth.getUser();

  Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Logout"
  }).then(async (result) => {
    if (result.isConfirmed) {
   
       hideLoader();
      await client.auth.signOut();
      Swal.fire({ icon: "success", title: "Logged out", timer: 1200, showConfirmButton: false });
      const provider = user?.app_metadata?.provider;
      setTimeout(() => {
        if (provider === "google") {
          window.location.href = "https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://127.0.0.1:5501/index.html";
        } else {
          window.location.href = "index.html";
        }
      }, 1300);
    }
  });
}

// ========== Forgot Password ==========
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
     showLoader();
    const email = document.getElementById("email").value.trim();
    if (!email) return Swal.fire("Error", "Please enter your email", "error");

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: "http://127.0.0.1:5501/updatepass.html"
    });

    if (error) {
       hideLoader();
      Swal.fire("Error", error.message, "error");
    } else {
      Swal.fire("Email Sent!", "Check your inbox to reset password.", "success");
      document.getElementById("email").value = "";
    }
  });
}


  // ✅ NEW: Fixes reload loop after Google/GitHub login
client.auth.onAuthStateChange(async (event, session) => {
  if (session && session.user) {
    const user = session.user;

    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email;
    const email = user.email;
    const image = user.user_metadata?.avatar_url || user.user_metadata?.picture || "https://via.placeholder.com/150";

    const userName = document.getElementById("userName");
    const userDP = document.getElementById("userDP");

    if (userName) userName.textContent = name;

    if (userDP) {
      userDP.innerHTML = image
        ? `<img src="${image}" alt="DP" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" />`
        : name.charAt(0).toUpperCase();
    }

    const profileNameElem = document.getElementById("profileName");
    const profileEmailElem = document.getElementById("profileEmail");
    const profileImageElem = document.getElementById("profileImage");

    if (profileNameElem) profileNameElem.textContent = name;
    if (profileEmailElem) profileEmailElem.textContent = email;
    if (profileImageElem) profileImageElem.src = image;
  } else {
    // Not logged in, redirect
    if (!window.location.href.includes("index.html") && !window.location.href.includes("login.html")) {
      window.location.href = "index.html";
    }
  }
});


// ========== Profile Popup Toggle ==========
const profileTrigger = document.getElementById("userDP");
const profileCard = document.getElementById("profilePopup");

if (profileTrigger && profileCard) {
  profileTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    profileCard.classList.toggle("hidden");
  });

  window.addEventListener("click", (e) => {
    if (!profileCard.contains(e.target) && !profileTrigger.contains(e.target)) {
      profileCard.classList.add("hidden");
    }
  });
}

//====================save post=====================//
document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveButton");

  if (!saveBtn) {
    console.error("Save button not found in DOM!");
    return;
  }

  saveBtn.addEventListener("click", async () => {
    showLoader();
    saveBtn.disabled = true;

    try {
      const title = document.getElementById("title").value.trim();
      const content = document.getElementById("diaryContent").value.trim();
      const image = document.getElementById("imageUpload").files[0];

      if (!title || !content) {
        throw new Error("Please enter both title and content.");
      }

      const {
        data: { user },
        error: userError
      } = await client.auth.getUser();

      if (userError || !user) {
        throw new Error("User not logged in.");
      }

      let imageUrl = null;

      if (image) {
        const { data, error } = await client.storage
          .from("images")
          .upload(`diary/${Date.now()}_${image.name}`, image);

        if (error) {
          throw new Error("Image upload failed.");
        }

        imageUrl = client.storage
          .from("images")
          .getPublicUrl(data.path).data.publicUrl;
      }

      const { error: insertError } = await client
        .from("my_diary")
        .insert([
          {
            title,
            content,
            user_id: user.id,
            image_url: imageUrl,
            date: new Date().toISOString()
          }
        ]);

      if (insertError) {
        throw new Error("Could not save diary.");
      }

      Swal.fire("✅ Saved!", "Your diary has been saved.", "success").then(() => {
        window.location.href = "blogs.html";
      });

    } catch (err) {
      console.error("Error:", err.message);
      Swal.fire("❌ Error", err.message, "error");
    } finally {
      // ✅ Always hide loader & enable button
      hideLoader();
      saveBtn.disabled = false;
    }
  });
});

//==================blogs=================//

//   const blogGrid = document.getElementById("blogGrid");
//   console.log(blogGrid);
  
// async function loadBlogs() {
  

//   const { data: blogs, error } = await client

  
//     .from("my_diary")
//     .select(`id, title, content, date, image_url `)
//     .order("date", { ascending: true });

//   if (error) {
//     console.error("Error loading blogs:", error);
//     blogGrid.innerHTML = `<p class="text-red-500 text-center">Error loading blogs.</p>`;
//     return;
//   }

//   if (!blogs || blogs.length === 0) {
//     blogGrid.innerHTML = `<p class="text-gray-600 text-center w-full">No blogs found.</p>`;
//     return;
//   }

//   blogGrid.innerHTML = blogs.map(blog => `
//     <div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition relative">
//       ${blog.image_url ? `
//         <img src="${blog.image_url}" class="w-full h-48 object-cover" alt="Blog Image">
//       ` : ""}
//       <div class="p-5 flex-1 flex flex-col justify-between">
//         <div>
//           <h2 class="text-xl font-bold text-gray-800">${blog.title}</h2>
//           <p class="mt-2 text-gray-600 text-sm">${blog.content?.slice(0, 150) || ''}...</p>
//         </div>
//         <div class="mt-4 flex justify-end gap-2">
//           <button onclick="editBlog('${blog.id}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-sm rounded">Edit</button>
//           <button onclick="deleteBlog('${blog.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded">Delete</button>
//         </div>
//         <p class="text-xs text-gray-400 mt-2">${new Date(blog.date).toDateString()}</p>
//       </div>
//     </div>
//   `).join('');
// }

// window.addEventListener("DOMContentLoaded",blogGrid && loadBlogs);


// //==========Delete======================//
// async function deleteBlog(blogId) {
//   const confirm = await Swal.fire({
//     title: "Are you sure?",
//     text: "This blog will be permanently deleted!",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#d33",
//     cancelButtonText: "Cancel",
//     confirmButtonText: "Delete"
//   });

//   if (confirm.isConfirmed) {
//      showLoader();
//     const { error } = await client
//       .from("my_diary")
//       .delete()
//       .eq("id", blogId);

//     if (error) {
//       hideLoader();
//       console.error("Delete error:", error);
//       Swal.fire("Error", "Could not delete the blog.", "error");
//     } else {
//       hideLoader();
//       Swal.fire("Deleted!", "Blog has been removed.", "success").then(loadBlogs);
//     }
//   }
// }


  const blogGrid = document.getElementById("blogGrid");
console.log(blogGrid);

async function loadBlogs() {
  try {
    const {
      data: { user },
      error: authError
    } = await client.auth.getUser();

    if (authError || !user) {
      throw authError || new Error("User not found.");
    }

   
    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    const userName = profile?.name || "Unknown";
    const userAvatar = profile?.avatar_url || "https://i.ibb.co/YZ1JqJg/default-avatar.png"; 

   
    const { data: blogs, error } = await client
      .from("my_diary")
      .select("id, title, content, date, image_url")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error loading blogs:", error);
      blogGrid.innerHTML = `<p class="text-red-500 text-center">Error loading blogs.</p>`;
      return;
    }

    if (!blogs || blogs.length === 0) {
      blogGrid.innerHTML = `<p class="text-gray-600 text-center w-full">No blogs found.</p>`;
      return;
    }
//=============map array===================//
    blogGrid.innerHTML = blogs.map(blog => `
      <div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition relative">
        ${blog.image_url ? `<img src="${blog.image_url}" class="w-full h-48 object-cover" alt="Blog Image">` : ""}
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div class="flex items-center gap-3 mb-3">
            <img src="${userAvatar}" class="w-8 h-8 rounded-full object-cover" alt="Avatar">
            <span class="text-sm font-medium text-gray-700">${userName}</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">${blog.title}</h2>
            <p class="mt-2 text-gray-600 text-sm">${blog.content?.slice(0, 150) || ''}...</p>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button onclick="editBlog('${blog.id}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-sm rounded">Edit</button>
            <button onclick="deleteBlog('${blog.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded">Delete</button>
          </div>
          <p class="text-xs text-gray-400 mt-2">${new Date(blog.date).toDateString()}</p>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Load error:", err.message);
    blogGrid.innerHTML = `<p class="text-red-500 text-center">Something went wrong.</p>`;
  }
}

window.addEventListener("DOMContentLoaded", blogGrid && loadBlogs);

//==================Update Blogs ======================//

async function editBlog(id) {
   showLoader();
  try {
    const { data: blog, error: fetchError } = await client
      .from("my_diary")
      .select("title, content")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const { value: formValues } = await Swal.fire({
      title: '✏️ Edit Blog',
      html: `
        <div style="text-align: left;">
          <label for="swal-title" style="display: inline-block; margin-bottom: 4px; font-weight: bold;">Title</label>
          <input id="swal-title" class="swal2-input" placeholder="Enter blog title" value="${blog.title}">
        </div>
        <div style="text-align: left; margin-top: 6px;">
          <label for="swal-content" style="display: inline-block; margin-bottom: 4px; font-weight: bold;">Description</label>
          <textarea id="swal-content" class="swal2-textarea" placeholder="Enter blog content...">${blog.content}</textarea>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: 'Update Blog',
      showCancelButton: true,
      preConfirm: () => {
        const title = document.getElementById('swal-title').value.trim();
        const content = document.getElementById('swal-content').value.trim();

        if (!title || !content) {
          hideLoader();
          Swal.showValidationMessage('Please fill in both Title and Description');
          return false;
        }

        return { title, content };
      }
    });

    if (!formValues){
       hideLoader();
       return};

    const { error: updateError } = await client
      .from("my_diary")
      .update({
        title: formValues.title,
        content: formValues.content,
      })
      .eq("id", id);
      hideLoader();

    if (updateError) throw updateError;{

    Swal.fire("✅ Updated!", "Your blog post has been updated.", "success");}
    loadBlogs(); 

  } catch (error) {
     hideLoader();
    console.error("Error updating blog:", error.message);
    Swal.fire(" Error", error.message, "error");
  }
}


//=========All Blogs ================//
 const allblogGrid = document.getElementById("allBlogGrid");

    async function loadAllBlogs() {
      const { data: blogs, error } = await client
        .from("my_diary")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        allblogGrid.innerHTML = `<p class="text-red-500">Error loading blogs.</p>`;
        return console.error("Blog Load Error:", error);
      }

      if (!blogs.length) {
        allblogGrid.innerHTML = `<p class="text-gray-600">No public blogs yet.</p>`;
        return;
      }

      allblogGrid.innerHTML = blogs.map(blog => `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          ${blog.image_url ? `<img src="${blog.image_url}" class="w-full h-48 object-cover rounded mb-3">` : ""}
          <h2 class="text-xl font-semibold mb-2">${blog.title}</h2>
          <p class="text-sm mb-3">${blog.content.slice(0, 150)}...</p>
          <div class="mt-auto">
            <p class="text-xs text-gray-500">By: <b>${blog.profiles?.name || "Anonymous"}</b></p>
            <p class="text-xs text-gray-400">${new Date(blog.date).toLocaleDateString()}</p>
          </div>
        </div>
      `).join("");
    }

    loadAllBlogs();
