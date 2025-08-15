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

// Toggle Password Visibility

document.querySelectorAll('.eyeicon').forEach(function(icon) {
   icon.addEventListener('click', function() {
      let input = this.previousElementSibling;
         if (input.type === "password") {
            input.type = "text";
            this.src = "../assets/eye.png";
         } else {
            input.type = "password";
            this.src = "../assets/hidden.png";
         }
   });
});
