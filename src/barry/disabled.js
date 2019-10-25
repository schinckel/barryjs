export default function preventDisabled(event) {
  if (event.target.disabled) {
    event.preventDefault();
    event.stopPropagation();
  }
}

document.addEventListener('click', preventDisabled);
