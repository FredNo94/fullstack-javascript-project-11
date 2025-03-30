import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import {
  renderError, renderFeeds, renderPosts,
} from './view.js';
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
      renderFeeds(watchedState, i18n);
      renderPosts(watchedState, i18n);
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

  const activeUpdates = new Set();

  const updatePost = (url) => {
    if (activeUpdates.has(url)) return Promise.resolve();
    activeUpdates.add(url);
    return getData(url)
      .then((response) => {
        const existingLinks = new Set(watchedState.data.posts.map((post) => post.link));
        const feedData = parseRSS(response.data.contents, i18n);
        const newPosts = feedData.posts.filter((post) => !existingLinks.has(post.link));

        if (newPosts.length > 0) {
          watchedState.data.posts = [...newPosts, ...watchedState.data.posts];
          renderPosts(watchedState, i18n);
        }
      })
      .catch((error) => {
        console.error(`Ошибка обновления для ${url}:`, error.message);
      })
      .finally(() => {
        activeUpdates.delete(url);
        setTimeout(() => {
          updatePost(url);
        }, 5000);
      });
  };

  const startAutoUpdatePosts = () => {
    const feeds = watchedState.data.feedsUrls;
    feeds.forEach((item) => {
      console.log(`item ${item}`);
      updatePost(item);
    });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get('url').trim();
    watchedState.form.state = 'loading';

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
        setTimeout(() => {
          startAutoUpdatePosts();
        }, 5000);
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
