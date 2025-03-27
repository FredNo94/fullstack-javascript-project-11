export default function renderError(error, i18n) {
  const input = document.querySelector('input[id=url-input]');
  const feedback = document.querySelector('.feedback');

  if (error.length > 0) {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = error;
  } else {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t('feedbackMessage.isLoadOk');
  }
}
