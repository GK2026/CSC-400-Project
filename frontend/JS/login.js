let xmlhttp = new XMLHttpRequest();
document.getElementById('signUp').addEventListener('click', function() {
window.location.href = 'file:///Users/gracekirby/Desktop/CSC%20400/signup.html';
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const data = {
    username: document.getElementById("usernameEntry").value,
    password: document.getElementById("passwordEntry").value,
  };

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("Your information has been saved!");
      const userData = await res.json();
      sessionStorage.setItem("currentUser", userData.user);
      sessionStorage.setItem("name", userData.name);      
      sessionStorage.setItem("gender", userData.gender);
      sessionStorage.setItem("age", userData.age);
      sessionStorage.setItem("calGoal", userData.calGoal);
      sessionStorage.setItem("fatGoal", userData.fatGoal);
      sessionStorage.setItem("sodiumGoal", userData.sodiumGoal);
      sessionStorage.setItem("healthGoal", userData.healthGoal);

	    window.location.pathname = '../home.html';
    } else {
      alert("There was an error saving your information.");
    }
  } catch (err) {
    alert("Network error: could not send data.");
  }
});
