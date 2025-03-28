import _ from 'lodash';

export default function parseRSS(inputString, i18n) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(inputString, 'text/xml');

  const parseError = doc.querySelector('parsererror');

  if (parseError) {
    throw new Error(i18n.t('feedbackMessage.isNotRSS'));
  }

  const feedTitle = doc.querySelector('title').textContent;
  const feedDiscr = doc.querySelector('description').textContent;
  const feedId = _.uniqueId();

  const postItems = doc.querySelectorAll('item');
  const posts = Array.from(postItems).map((post) => ({
    id: _.uniqueId(),
    idFeed: feedId,
    title: post.querySelector('title').textContent,
    link: post.querySelector('link').textContent,
    discr: post.querySelector('description').description,
  }));

  return { feed: { id: feedId, title: feedTitle, description: feedDiscr }, posts };
}
