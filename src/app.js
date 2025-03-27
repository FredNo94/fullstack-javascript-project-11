import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import renderError from './view.js';
import ru from './locales/ru.js';

function app(i18n) {
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
      renderError(state.form.error, i18n);
    } else if (state.form.state === 'success') {
      renderError(false, i18n);
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
      .url()
      .test(
        'unique-feed',
        i18n.t('feedbackMessage.isDublicate'),
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

const runApp = () => {
  const i18Inst = i18next.createInstance();

  i18Inst.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  }).then(() => {
    yup.setLocale({
      string: {
        url: i18Inst.t('feedbackMessage.isUrl'),
      },
    });
    app(i18Inst);
  });
};

export default runApp;
