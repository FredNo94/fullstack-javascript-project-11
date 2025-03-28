import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { renderError, renderFeedAndPosts } from './view.js';
import ru from './locales/ru.js';
import parseRSS from './parser.js';

function app(i18n) {
  const initialState = {
    form: {
      state: 'filling', // 'filling', 'success', 'error'
      error: null,
    },
    data: {
      feedsUrls: [],
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
    }
  }

  const watchedState = onChange(initialState, (path) => {
    if (path.startsWith('form')) {
      handleFormStateChanges(watchedState);
    }

    if (watchedState.form.state === 'success') {
      renderError(false, i18n);
      renderFeedAndPosts(watchedState, i18n);
      input.value = '';
      input.focus();
    }
  });

  const schema = yup.object().shape({
    url: yup
      .string()
      .url()
      .test(
        'unique-feed',
        i18n.t('feedbackMessage.isDublicate'),
        (url) => !watchedState.data.feedsUrls.includes(url),
      ),
  });

  const getData = (url) => axios.get('https://allorigins.hexlet.app/get', {
    params: {
      url,
      disableCache: true,
    },
  })
    .then((response) => response)
    .catch((e) => {
      console.error('Request failed:', e);
      throw e;
    });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get('url').trim();

    schema.validate({ url })
      .then(() => getData(url))
      .then((response) => parseRSS(response.data.contents, i18n))
      .then((feedData) => {
        watchedState.form.error = null;
        watchedState.data.feedsUrls.push(url);
        watchedState.data.feeds.push(feedData.feed);
        watchedState.data.posts = [
          ...new Set([
            ...watchedState.data.posts,
            ...feedData.posts,
          ]),
        ];
        watchedState.form.state = 'success';
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
