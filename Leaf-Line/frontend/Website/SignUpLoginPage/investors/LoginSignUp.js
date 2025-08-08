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
