// ========== Supabase Setup ==========
const supabaseUrl = "https://eyyoigiytzhbtcwqvooa.supabase.co";
console.log(supabaseUrl);
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5eW9pZ2l5dHpoYnRjd3F2b29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDE0OTUsImV4cCI6MjA3MDUxNzQ5NX0.2LNSR60X9QXh2oih_bmnP31iKo5pV82-0cPa06J2L8k";
const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);
console.log(client);

// ========== Sign Up ==========
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log(signupForm);
  
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById(
      "signupConfirmPassword"
    ).value;
    console.log(email, password);

    if (password !== confirmPassword) {
      return Swal.fire("Error", "Passwords do not match", "error");
    }

    try {
      const { error } = await client.auth.signUp({ email, password });

      if (error) throw error;
      Swal.fire(
        "Signed up!",
        "Check your email to confirm your account.",
        "success"
      ).then(() => (window.location.href = "index.html"));
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
      let msg = error.message.includes("confirm")
        ? "Please confirm your email first."
        : error.message;
      Swal.fire("Login Failed", msg, "error");
    } else {
      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => (window.location.href = "dashboard.html"));
    }
  });
}

// ========== google Login ==========

const googleBtn = document.getElementById("googleLoginBtn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    showLoader();
    const redirectTo =
      window.location.hostname === "127.0.0.1"
        ? window.location.origin + "/dashboard.html"
        : window.location.origin + "/diary/dashboard.html";
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard.html",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      hideLoader();
      Swal.fire("Google Login Failed", error.message, "error");
    }
  });
}

//================ github login================//
const githubLoginBtn = document.getElementById("githubLoginBtn");
if (githubLoginBtn) {
  githubLoginBtn.addEventListener("click", async () => {
    showLoader();
    const redirectTo =
      window.location.hostname === "127.0.0.1"
        ? window.location.origin + "/dashboard.html"
        : window.location.origin + "/diary/dashboard.html";
    
    const { error } = await client.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + "/dashboard.html",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      hideLoader();
      Swal.fire("GitHub Login Failed", error.message, "error");
    }
  });
}

// ========== Save Entry ==========
async function saveDiary() {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("diaryContent").value.trim();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return Swal.fire("Error", "Not logged in", "error");
  }
  if (!content) {
    return Swal.fire("Error", "Write something!", "error");
  }

  const entry = {
    title: title || "Untitled Entry",
    content,
    user_id: user.id,
    date: new Date().toLocaleString(),
  };

  const { error } = await client.from("diary_entries").insert([entry]);
  if (error) {
    return Swal.fire("Error", error.message, "error");
  }

  Swal.fire("Saved!", "Your diary has been saved.", "success").then(
    () => (window.location.href = "blogs.html")
  );
}

// ========== Logout ==========

async function logout() {
  try {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
    }).then(async (result) => {
      if (result.isConfirmed) {
        showLoader();

        // Sign out from Supabase
        await client.auth.signOut();

        // Clear any localStorage
        localStorage.removeItem('username');

        hideLoader();

        Swal.fire({
          icon: "success",
          title: "Logged out",
          timer: 1200,
          showConfirmButton: false,
        });

        // Redirect after logout
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1300);
      }
    });
  } catch (err) {
    hideLoader();
    console.error("Logout error:", err);
    Swal.fire("Error", "Logout failed", "error");
  }
}

//===========forgot password==========//
const forgotForm = document.getElementById("forgotForm");
 forgotForm && forgotForm.addEventListener("submit", (e) => {
  e.preventDefault();
   showLoader();
  const email = document.getElementById("email").value.trim();
  if (!email) return Swal.fire("Error", "Please enter your email", "error");

  // Directly redirect to update password page
  const redirectUrl =
    window.location.hostname === "127.0.0.1"
      ? window.location.origin + "/updatepass.html"
      : window.location.origin + "/diary/updatepass.html";

  window.location.href = redirectUrl + "?email=" + encodeURIComponent(email);


  if (error) {
      hideLoader();
      Swal.fire("Error", error.message, "error");
    } else {
      hideLoader();
      Swal.fire(
        "Email Sent!",
        "Check your inbox to reset password.",
        "success"
      );
      document.getElementById("email").value = "";
    }
});

//===================update password==================//
// const updateForm = document.getElementById('updateForm');
   
// updateForm.addEventListener('submit', async (e) => {
//   e.preventDefault();

//   const currentPassword = document.getElementById('currentPassword').value.trim();
//   const newPassword = document.getElementById('newPassword').value.trim();
//   const confirmPassword = document.getElementById('confirmPassword').value.trim();

//   if (!newPassword || !confirmPassword) {
//     return Swal.fire('Error', 'Please fill in all fields', 'error');
//   }
//   if (newPassword !== confirmPassword) {
//     return Swal.fire('Error', 'New password and confirm password do not match', 'error');
//   }

//   try {
//     const { data: user } = await client.auth.getUser();

//     // Only signInWithPassword if email/password user
//     if (user && user.user_metadata?.provider === 'email' && currentPassword) {
//       const { error: signInError } = await client.auth.signInWithPassword({
//         email: user.email,
//         password: currentPassword
//       });
//       if (signInError) return Swal.fire('Error', signInError.message, 'error');
//     }

//     // Update password
//     const { error: updateError } = await client.auth.updateUser({
//       password: newPassword
//     });
//     if (updateError) return Swal.fire('Error', updateError.message, 'error');

//     Swal.fire('Success', 'Password updated!', 'success').then(() => {
//       window.location.href = 'dashboard.html';
//     });

//   } catch (err) {
//     console.error(err);
//     Swal.fire('Error', 'Something went wrong!', 'error');
//   }
// });


const updateForm = document.getElementById('updateForm');

if (updateForm) {
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    

    const currentPassword = document.getElementById('currentPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!newPassword || !confirmPassword) {
      return Swal.fire('Error', 'Please fill in all fields', 'error');
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire('Error', 'New password and confirm password do not match', 'error');
    }

    try {
      const { data: user, error: getUserError } = await client.auth.getUser();
      if (getUserError || !user) {
        return Swal.fire('Error', 'User not found', 'error');
      }

      const provider = user.app_metadata?.provider || 'email';

      // Only email/password users need current password
      if (provider === 'email' && currentPassword) {
        const { error: signInError } = await client.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        });
        if (signInError) return Swal.fire('Error', signInError.message, 'error');
      }

      // Update password
      const { error: updateError } = await client.auth.updateUser({
        password: newPassword
      });
      if (updateError) return Swal.fire('Error', updateError.message, 'error');

      Swal.fire('Success', 'Password updated!', 'success');

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong!', 'error');
    }
  });
}



// ✅ NEW: Fixes reload loop after Google/GitHub login
client.auth.onAuthStateChange(async (event, session) => {
  if (session && session.user) {
    const user = session.user;

    const name =
      user.user_metadata?.full_name || user.user_metadata?.name || user.email;
    const email = user.email;
    const image =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      "https://via.placeholder.com/150";

    const userName = document.getElementById("userName");
    const userDP = document.getElementById("userDP");

    if (userName) userName.textContent = name;

    if (userDP) {
      // Check if image is a placeholder or missing
      const isPlaceholder =
        !image || image.trim() === "" || image.includes("placeholder.com");

      if (isPlaceholder) {
        const firstLetter = name.charAt(0).toUpperCase();
        userDP.innerHTML = firstLetter;
      } else {
        userDP.innerHTML = `<img src="${image}" alt="DP" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" />`;
      }
    }

    const profileNameElem = document.getElementById("profileName");
    const profileEmailElem = document.getElementById("profileEmail");
    const profileImageElem = document.getElementById("profileImage");

    if (profileNameElem) profileNameElem.textContent = name;
    if (profileEmailElem) profileEmailElem.textContent = email;
    if (profileImageElem) profileImageElem.src = image;
  } else {
    // Redirect if not logged in
    if (
      !window.location.href.includes("index.html") &&
      !window.location.href.includes("login.html")
    ) {
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
//=======================update profile======================//
document.addEventListener("DOMContentLoaded", () => {
  const profileImage = document.getElementById("profileImage");

  if (!profileImage) {
    console.warn("profileImage element not found");
    return;
  }

  profileImage.addEventListener("click", async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (!file) return;

      const fileName = `${Date.now()}_${file.name}`;
      const folder = "avatars";

      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) {
        return Swal.fire("Error", "User not found", "error");
      }

      const userId = userData.user.id;

      Swal.fire({
        title: "Uploading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const { error: uploadError } = await client.storage
        .from("user") 
        .upload(`${folder}/${fileName}`, file, {
          upsert: true,
        });

      if (uploadError) {
        return Swal.fire("Failed", uploadError.message, "error");
      }

      // ✅ Get public URL
      const {
        data: { publicUrl },
      } = client.storage.from("user").getPublicUrl(`${folder}/${fileName}`);

      // ✅ Save in DB
      const { error: updateError } = await client
        .from("profiles")
        .update({ imageurl: publicUrl })
        .eq("id", userId);

      if (updateError) {
        return Swal.fire("Error", "Failed to update profile", "error");
      }

      profileImage.src = publicUrl;

      Swal.fire("Uploaded!", "Profile image updated successfully", "success");
    };

    fileInput.click();
  });
});

//====================save post=====================//

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");

  if (!saveBtn) {
    return;
  }

  saveBtn.addEventListener("click", async () => {
    showLoader();
    saveBtn.disabled = true;

    try {
      const title = document.getElementById("title").value.trim();
      const content = document.getElementById("diaryContent").value.trim();
      const imageFile = document.getElementById("imageUpload").files[0];

      if (!title || !content) {
        throw new Error("Please enter both title and content.");
      }
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !user) {
        throw new Error("User not logged in.");
      }

      let imageUrl = null;

      // ===== Upload image to Supabase Storage if file selected =====
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const imagePath = `avatars/user-${user.id}.${ext}`;

        const { error: uploadError } = await client.storage
          .from("user")
          .upload(imagePath, imageFile, {
            upsert: true,
          });

        if (uploadError) {
          console.error("Upload Error:", uploadError.message);
          throw new Error("Image upload failed.");
        }

        // Get public URL after upload
        const { data: publicUrlData } = client.storage
          .from("user")
          .getPublicUrl(imagePath);

        imageUrl = publicUrlData.publicUrl;
        console.log("Image URL:", imageUrl);
      }

       // ===== Ensure user profile exists =====
      const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        const { error: profileInsertError } = await client.from("profiles").insert([
          {
            user_id: user.id,
            name: "Default Name", // ya user input se
            imageurl: imageUrl || null,
          },
        ]);

        if (profileInsertError) {
          throw new Error("Could not create user profile.");
        }
      }

      // ===== Save diary entry =====
      const { error: insertError } = await client.from("my_diary").insert([
        {
          title,
          content,
          user_id: user.id,

          date: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error("Insert Error:", insertError.message);
        throw new Error("Could not save diary.");
      }

      Swal.fire("✅ Saved!", "Your diary has been saved.", "success").then(
        () => {
          window.location.href = "blogs.html";
        }
      );
    } catch (err) {
      // console.error("Error:", err.message);
      Swal.fire("❌ Error", err.message, "error");
    } finally {
      hideLoader();
      saveBtn.disabled = false;
    }
  });
});

// //==========Delete======================//
async function deleteBlog(blogId) {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "This blog will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonText: "Cancel",
    confirmButtonText: "Delete",
  });

  if (confirm.isConfirmed) {
    showLoader();
    const { error } = await client.from("my_diary").delete().eq("id", blogId);

    if (error) {
      hideLoader();
      console.error("Delete error:", error);
      Swal.fire("Error", "Could not delete the blog.", "error");
    } else {
      hideLoader();
      Swal.fire("Deleted!", "Blog has been removed.", "success").then(
        loadBlogs
      );
    }
  }
}

//================My Post=============================//
const blogGrid = document.getElementById("blogGrid");
console.log(blogGrid);

async function loadBlogs() {
  try {
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
      throw authError || new Error("User not found.");
    }
    let name = "Unknown User";
    if (user.user_metadata) {
      name =
        user.user_metadata.full_name ||
        user.user_metadata.name ||
        user.email ||
        "No Name";
    }

    // ✅ Safely get profile URL (avatar)
    let profileUrl = "https://i.ibb.co/YZ1JqJg/default-avatar.png";
    if (user.user_metadata) {
      profileUrl =
        user.user_metadata.avatar_url ||
        user.user_metadata.picture ||
        "https://i.ibb.co/YZ1JqJg/default-avatar.png";
    }

    const { error: upsertError } = await client.from("profiles").upsert(
      [
        {
          user_id: user.id,
          name: name,
          imageurl: profileUrl,
        },
      ],
      {
        onConflict: "user_id",
      }
    );

    if (upsertError) {
      console.error("Profile Upsert Error:", upsertError.message);
    } else {
      console.log("Profile inserted/updated successfully");
    }

    const { data: blogs, error } = await client
      .from("my_diary")
      .select(
        `
  id, title, content, date,user_id,
  profiles(name,imageurl,user_id)
`
      )

      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error loading blogs:", error);
      blogGrid.innerHTML = `<p class="text-red-500 text-center">Error loading blogs.</p>`;
      return;
    }

    if (!blogs || blogs.length === 0) {
      console.log(blogs);

      blogGrid.innerHTML = `<p class="text-gray-600 text-center w-full">No blogs found.</p>`;
      return;
    }
    //=============map array===================//
    blogGrid.innerHTML = blogs
      .map((blog) => {
        const userName = blog.profiles?.name || "Unknown";
        const userAvatar = blog.profiles?.imageurl;
        const userInitial = userName.charAt(0).toUpperCase();

        const avatarHTML = userAvatar
          ? `<img src="${userAvatar}" class="w-8 h-8 rounded-full object-cover" alt="Avatar">`
          : `<div class="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">${userInitial}</div>`;

        return `
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition duration-300">
      ${
        blog.image_url
          ? `<img src="${blog.image_url}" class="w-full h-48 object-cover" alt="Blog Image">`
          : ""
      }
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div class="flex items-center gap-3 mb-3">
          ${avatarHTML}
          <span class="text-sm font-medium text-gray-700">${userName}</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900 mb-1">${blog.title}</h2>
          <p class="text-gray-600 text-sm">${
            blog.content?.slice(0, 150) || ""
          }...</p>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button onclick="editBlog('${
            blog.id
          }')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-sm rounded-lg">Edit</button>
          <button onclick="deleteBlog('${
            blog.id
          }')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded-lg">Delete</button>
        </div>
        <p class="text-xs text-gray-400 mt-3 text-right">${new Date(
          blog.date
        ).toDateString()}</p>
      </div>
    </div>
  `;
      })
      .join("");
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
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user) throw new Error("User not logged in");

    const { data: blog, error: fetchError } = await client
      .from("my_diary")
      .select("title, content")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) throw fetchError;

    // 📌 Loader hide before showing form
    hideLoader();

    const { value: formValues } = await Swal.fire({
      title: "✏️ Edit Blog",
      html: `
        <div style="text-align: left;">
          <label for="swal-title" style="font-weight: bold;">Title</label>
          <input id="swal-title" class="swal2-input" value="${blog.title}">
        </div>
        <div style="text-align: left; margin-top: 2px;">
          <label for="swal-content" style="font-weight: bold;">Description</label>
          <textarea id="swal-content" class="swal2-textarea">${blog.content}</textarea>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: "Update Blog",
      showCancelButton: true,
      preConfirm: () => {
        const title = document.getElementById("swal-title").value.trim();
        const content = document.getElementById("swal-content").value.trim();

        if (!title || !content) {
          Swal.showValidationMessage(
            "Please fill in both Title and Description"
          );
          return false;
        }
        return { title, content };
      },
    });

    if (!formValues) return; // cancelled

    // 📌 Show loader only while saving
    showLoader();

    const { error: updateError } = await client
      .from("my_diary")
      .update({
        title: formValues.title,
        content: formValues.content,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    hideLoader();

    if (updateError) throw updateError;

    Swal.fire("✅ Updated!", "Your blog post has been updated.", "success");
    loadBlogs();
  } catch (error) {
    hideLoader();
    console.error("Error updating blog:", error.message);
    Swal.fire("❌ Error", error.message, "error");
  }
}

//=========All Blogs ================//
// document.addEventListener("DOMContentLoaded", () => {
//    allblogGrid = document.getElementById("allBlogGrid");

//   async function loadAllBlogs() {
//     const {
//     data: { user },
//     error: authError,
//   } = await client.auth.getUser();
//   if (authError || !user) {
//     console.error("User not found:", authError);
//     return;
//   }

//     const { data: blogs, error } = await client
//       .from("my_diary")
//       .select(
//         `
//         id,
//         title,
//         content,
//         date,
//         profiles (
//           name,
//           imageurl
//         )
//       `
//       )
//        .eq("user_id", user.id) 
//       .order("date", { ascending: true });

//     if (error) {
//       allblogGrid.innerHTML = `<p class="text-red-500">Error loading blogs.</p>`;
//       return console.error("Blog Load Error:", error);
//     }

//     if (!blogs.length) {
//       allblogGrid.innerHTML = `<p class="text-gray-600">No public blogs yet.</p>`;
//       return;
//     }

//     allblogGrid.innerHTML = blogs
//       .map((blog) => {
//         const name = blog.profiles?.name || "Anonymous";
//         const firstLetter = name.charAt(0).toUpperCase();
//         const profileUrl = blog.profiles?.imageurl;

//         return `
//           <div class=" max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg  shadow p-4 flex flex-col transition-transform hover:scale-[1.02] duration-300 ">
//             ${
//               blog.imageurl
//                 ? `<img src="${blog.imageurl}" class="w-full h-40 object-cover rounded mb-3">`
//                 : ""
//             }
//             <h2 class="text-lg font-bold mb-2">${blog.title}</h2>
//             <p class="text-sm mb-3">${blog.content.slice(0, 10)}...</p>
            
//             <div class="mt-auto flex items-center gap-2">
//               ${
//                 profileUrl
//                   ? `<img src="${profileUrl}" alt="${name}" class="w-6 h-6 rounded-full object-cover">`
//                   : `<div class="w-6 h-6 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center">${firstLetter}</div>`
//               }
//               <p class="text-xs text-gray-500 font-medium">${name}</p>
//             </div>

//             <p class="text-xs text-gray-400">${new Date(
//               blog.date
//             ).toLocaleDateString()}</p>
//           </div>
//         `;
//       })
//       .join("");
//   }

//   loadAllBlogs();
// });


document.addEventListener("DOMContentLoaded", () => {
  const allblogGrid = document.getElementById("allBlogGrid");

  async function loadAllBlogs() {
    const { data: blogs, error } = await client
      .from("my_diary")
      .select(`
        id,
        title,
        content,
        date,
        profiles (
          name,
          imageurl
        )
      `)
      .order("date", { ascending: false }); 

    if (error) {
      allblogGrid.innerHTML = `<p class="text-red-500">Error loading blogs.</p>`;
      return console.error("Blog Load Error:", error);
    }

    if (!blogs.length) {
      allblogGrid.innerHTML = `<p class="text-gray-600">No blogs yet.</p>`;
      return;
    }

    allblogGrid.innerHTML = blogs
      .map((blog) => {
        const name = blog.profiles?.name || "Anonymous";
        const firstLetter = name.charAt(0).toUpperCase();
        const profileUrl = blog.profiles?.imageurl;

        return `
          <div class="max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col transition-transform hover:scale-[1.02] duration-300">
            ${
              blog.imageurl
                ? `<img src="${blog.imageurl}" class="w-full h-40 object-cover rounded mb-3">`
                : ""
            }
            <h2 class="text-lg font-bold mb-2">${blog.title}</h2>
            <p class="text-sm mb-3">${blog.content.slice(0, 100)}...</p>
            
            <div class="mt-auto flex items-center gap-2">
              ${
                profileUrl
                  ? `<img src="${profileUrl}" alt="${name}" class="w-6 h-6 rounded-full object-cover">`
                  : `<div class="w-6 h-6 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center">${firstLetter}</div>`
              }
              <p class="text-xs text-gray-500 font-medium">${name}</p>
            </div>

            <p class="text-xs text-gray-400 mt-1">${new Date(blog.date).toLocaleDateString()}</p>
          </div>
        `;
      })
      .join("");
  }

  loadAllBlogs();
});


//====================setting====================//
const darkModeToggle = document.getElementById("darkModeToggle");
const notificationsToggle = document.getElementById("notificationsToggle");
const autosaveToggle = document.getElementById("autosaveToggle");
const backupToggle = document.getElementById("backupToggle");
const saveBtn = document.querySelector(".save-btn");

// ===== Loader Setup =====
const loader = document.createElement("div");
loader.innerHTML = `
  <div style="
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  ">
    <div style="
      border: 6px solid #f3f3f3;
      border-top: 6px solid #4285F4;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    "></div>
  </div>
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
`;
loader.id = "globalLoader";
loader.style.display = "none";
document.body.appendChild(loader);

function showLoader() {
  loader.style.display = "flex";
}
function hideLoader() {
  loader.style.display = "none";
}

// ===== User Handling (with fallback) =====
let currentUserId = null;

async function getUser() {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    console.warn("⚠️ No logged-in user. Using guest mode.");
    return "guest";
  }

  return user.id;
}

// ===== Load Settings from Supabase =====
async function loadSettings() {
  showLoader();
  currentUserId = await getUser();
  console.log(currentUserId);

  const { data, error } = await client
    .from("setting")
    .select("*")
    .eq("user_id", currentUserId)
    .single();

  if (error) {
    console.log("No settings found or load error", error);
  }

  if (data) {
    darkModeToggle.checked = data.dark_mode;
    notificationsToggle.checked = data.notifications;
    autosaveToggle.checked = data.autosave;
    backupToggle.checked = data.backup;
  }

  hideLoader();
}

// ===== Save Settings Function =====
async function saveSettings() {
  if (!currentUserId) {
    Swal.fire("⚠️ Not Logged In", "Please login to save settings.", "warning");
    return;
  }

  const newSettings = {
    user_id: currentUserId,
    dark_mode: darkModeToggle.checked,
    notifications: notificationsToggle.checked,
    autosave: autosaveToggle.checked,
    backup: backupToggle.checked,
  };

  // 🔁 Apply dark mode live
  if (darkModeToggle.checked) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }

  showLoader();

  const { error } = await client
    .from("setting")
    .upsert(newSettings, { onConflict: ["user_id"] });

  hideLoader();

  if (error) {
    Swal.fire("❌ Error", "Failed to save settings!", "error");
    console.error(error);
  } else {
    Swal.fire("✅ Settings Saved", "Your preferences were saved.", "success");
  }
}

// ===== Live Toggle (optional: applies without save button too) =====
darkModeToggle.addEventListener("change", () => {
  if (darkModeToggle.checked) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
});

// ===== Save Button Event =====
saveBtn.addEventListener("click", saveSettings);

// ===== Load Settings Function =====
async function loadSettings() {
  showLoader();
  currentUserId = await getUser();

  const { data, error } = await client
    .from("setting")
    .select("*")
    .eq("user_id", currentUserId)
    .single();

  if (data) {
    darkModeToggle.checked = data.dark_mode;
    notificationsToggle.checked = data.notifications;
    autosaveToggle.checked = data.autosave;
    backupToggle.checked = data.backup;

    // 🌙 Apply dark mode on load
    if (data.dark_mode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }

  hideLoader();
}

// ===== On Page Load =====
document.addEventListener("DOMContentLoaded", loadSettings);
