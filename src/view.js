export default function renderError(error = '') {
  const input = document.querySelector('input[id=url-input]');
  const feedback = document.querySelector('.feedback');

  if (error.length > 0) {
    input.classList.add('is-invalid');
    feedback.textContent = error;
  } else {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
  }
}
