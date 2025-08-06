
console.log("Javascript is linked succesffully");

const NavPnl = document.querySelector("nav");
const Navbtn = document.querySelector(".NavBtn");



Navbtn.addEventListener('click', () => {
    NavPnl.classList.toggle('expanded');//Toggles the nav class between active and not active
})


