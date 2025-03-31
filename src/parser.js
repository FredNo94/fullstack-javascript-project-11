import _ from 'lodash';

export default function parseRSS(url, inputString, i18n, state) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(inputString, 'text/xml');
  const urls = state.data.feeds.map((feed) => feed.url);
  let feedId;

  const parseError = doc.querySelector('parsererror');

  if (parseError) {
    throw new Error(i18n.t('feedbackMessage.isNotRSS'));
  }

  const feedTitle = doc.querySelector('title').textContent;
  const feedDiscr = doc.querySelector('description').textContent;

  if (urls.includes(url)) {
    const oldFeed = state.data.feeds.filter((feed) => feed.url === url);
    feedId = oldFeed.id;
  } else {
    feedId = _.uniqueId();
  }

  const postItems = doc.querySelectorAll('item');
  const posts = Array.from(postItems).map((post) => ({
    id: _.uniqueId(),
    idFeed: feedId,
    title: post.querySelector('title').textContent,
    link: post.querySelector('link').textContent,
    discr: post.querySelector('description').textContent,
  }));

  return {
    feed: {
      id: feedId, title: feedTitle, description: feedDiscr, url,
    },
    posts,
  };
}
