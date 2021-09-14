
const element2 = document.querySelector('#name');

element2.addEventListener('animationend', () => {
  element2.classList.remove('animate__animated', 'animate__zoomInDown')
});

const element4 = document.querySelector('#anime');

element4.addEventListener('animationend', () => {
  element4.classList.remove('animate__animated', 'animate__slideInLeft')
});

const element5 = document.querySelector('#gaming');

element5.addEventListener('animationend', () => {
  element5.classList.remove('animate__animated', 'animate__slideInDown')
});

const element6 = document.querySelector('#job');

element6.addEventListener('animationend', () => {
  element6.classList.remove('animate__animated', 'animate__slideInUp')
});

const element7 = document.querySelector('#playstation');

element7.addEventListener('animationend', () => {
  element7.classList.remove('animate__animated', 'animate__slideInDown')
});



//animate__slideInDown