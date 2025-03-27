import onChange from 'on-change';
import * as yup from 'yup';
import renderError from './view.js';

export default function app() {
  const initialState = {
    form: {
      state: 'filling', // 'filling', 'success', 'error'
      error: null,
    },
    data: {
      feeds: [],
      posts: [],
      readPosts: [],
    },
  };

  const input = document.querySelector('input[id=url-input]');
  const form = document.querySelector('.rss-form');

  function handleFormStateChanges(state) {
    if (state.form.error) {
      renderError(state.form.error);
    } else if (state.form.state === 'success') {
      renderError(false);
      input.value = '';
      input.focus();
    }
  }

  const watchedState = onChange(initialState, (path) => {
    if (path.startsWith('form')) {
      handleFormStateChanges(watchedState);
    }
  });

  const schema = yup.object().shape({
    url: yup
      .string()
      .required('Это поле обязательно')
      .url('Ссылка должна быть валидным URL')
      .test(
        'unique-feed',
        'RSS уже существует',
        (url) => !watchedState.data.feeds.includes(url),
      ),
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get('url').trim();

    schema.validate({ url })
      .then(() => {
        console.log(url);
        watchedState.form.state = 'success';
        watchedState.form.error = null;
        watchedState.data.feeds.push(url);
        console.log(Object.entries(watchedState.data.feeds));
      })
      .catch((error) => {
        watchedState.form.state = 'error';
        watchedState.form.error = error.message;
      });
  });

  handleFormStateChanges(watchedState);
}
