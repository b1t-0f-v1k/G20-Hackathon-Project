console.log("Javascript is linked succesffully");

const OuterDiv = document.querySelector('.OuterDiv');
const SignUpBtnP = document.querySelector('.SignUpPromptBtn');
const LoginBtnP = document.querySelector('.LoginPromptBtn');


LoginBtnP.addEventListener('click', () => {
   OuterDiv.classList.add('active');
})

SignUpBtnP.addEventListener('click', () => {
   OuterDiv.classList.remove('active');
})

document.addEventListener('DOMContentLoaded', () => {
  // Login password toggle
  const loginPasswordInput = document.getElementById('password-input');
  const showLoginPasswordCheckbox = document.getElementById('show-login-password');

  showLoginPasswordCheckbox.addEventListener('change', () => {
    loginPasswordInput.type = showLoginPasswordCheckbox.checked ? 'text' : 'password';
  });

  // Signup password toggle
  const signupPasswordInput = document.getElementById('signup-password-input');
  const showSignupPasswordCheckbox = document.getElementById('show-signup-password');

  showSignupPasswordCheckbox.addEventListener('change', () => {
    signupPasswordInput.type = showSignupPasswordCheckbox.checked ? 'text' : 'password';
  });
});
