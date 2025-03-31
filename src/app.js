import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import {
  renderError, renderFeeds, renderPosts, renderModal, renderSubmit,
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
      feeds: [],
      posts: [],
      readPosts: [],
    },
  };

  const input = document.querySelector('input[id=url-input]');
  const form = document.querySelector('.rss-form');
  const modal = document.querySelector('div[id=modal]');

  function handleFormStateChanges(state) {
    if (state.form.error) {
      renderError(state.form.error, i18n);
      renderSubmit(true);
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
      renderSubmit(true);
      input.value = '';
      input.focus();
    }

    if (watchedState.form.state === 'loading') {
      renderSubmit();
    }
  });

  const schema = yup.object().shape({
    url: yup
      .string()
      .url()
      .required('feedbackMessage.isNotRSS')
      .test(
        'unique-feed',
        i18n.t('feedbackMessage.isDublicate'),
        (url) => {
          const urls = watchedState.data.feeds.map((feed) => feed.url);
          return !urls.includes(url);
        },
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
        const feedData = parseRSS(url, response.data.contents, i18n, watchedState);
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
    const feeds = watchedState.data.feeds.map((feed) => feed.url);
    feeds.forEach((item) => updatePost(item));
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get('url').trim();
    watchedState.form.state = 'loading';

    schema.validate({ url })
      .then(() => getData(url))
      .then((response) => parseRSS(url, response.data.contents, i18n, watchedState))
      .then((feedData) => {
        watchedState.form.error = null;
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
        watchedState.form.error = error.message === 'Network Error' ? i18n.t('feedbackMessage.isNetworkError') : watchedState.form.error = error.message;
      });
  });

  modal.addEventListener('show.bs.modal', (eventModal) => {
    const button = eventModal.relatedTarget;
    const postId = button.getAttribute('data-id');
    const { posts } = watchedState.data;
    const post = posts.filter((el) => el.id === postId);

    if (!watchedState.data.readPosts.includes(postId)) {
      watchedState.data.readPosts.push(postId);
      renderPosts(watchedState, i18n);
    }

    renderModal(post[0]);
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
