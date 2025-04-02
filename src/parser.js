export default function parseRSS(url, inputString, i18n) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(inputString, 'text/xml');

  const parseError = doc.querySelector('parsererror');

  if (parseError) {
    throw new Error(i18n.t('feedbackMessage.isNotRSS'));
  }

  const feedTitle = doc.querySelector('title').textContent;
  const feedDesc = doc.querySelector('description').textContent;
  const postItems = doc.querySelectorAll('item');

  const posts = Array.from(postItems).map((post) => ({
    title: post.querySelector('title').textContent,
    link: post.querySelector('link').textContent,
    description: post.querySelector('description').textContent,
  }));

  return {
    feed: {
      title: feedTitle, description: feedDesc, url,
    },
    posts,
  };
}
