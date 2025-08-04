// ==== Local Registration/Login ====

function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please enter username and password.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "[]");

  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    alert("User already exists.");
    return;
  }

  users.push({ username, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registration successful! You can now login.");
}

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please enter username and password.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "[]");

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

  if (user) {
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", user.username);
    window.location.href = "index.html";
  } else {
    alert("Invalid credentials.");
  }
}

// ==== Google Login ====
function handleGoogleCredentialResponse(response) {
  const userObject = parseJwt(response.credential);
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("currentUser", userObject.email || userObject.name);
  window.location.href = "index.html";
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload);
}

// ==== Facebook Login ====
window.fbAsyncInit = function() {
  FB.init({
    appId      : 'YOUR_FACEBOOK_APP_ID',
    cookie     : true,
    xfbml      : true,
    version    : 'v17.0'
  });
};

function fbLogin() {
  FB.login(function(response) {
    if (response.authResponse) {
      FB.api('/me', { fields: 'name,email' }, function(userInfo) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("currentUser", userInfo.email || userInfo.name);
        window.location.href = "index.html";
      });
    } else {
      alert("Facebook login cancelled.");
    }
  }, { scope: 'email' });
}
