const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");
const githubButton = document.getElementById("Github");

loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    if (username === "user" && password === "launch") {
        location.assign("../HTML/Notebooks.html");
    } else {
        loginErrorMsg.style.opacity = 1;
    }
});

githubButton.addEventListener("click", (e) =>{
    e.preventDefault();
    location.assign("https://github.com/ThomasTanwz");
})
