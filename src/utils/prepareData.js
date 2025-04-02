import _ from 'lodash';

export function getFeed(feedId, feed, url) {
  return {
    feedId,
    title: feed.title,
    description: feed.description,
    url,
  };
}

export function getPosts(posts, feedId) {
  const newPosts = posts.map((post) => ({
    id: _.uniqueId(),
    idFeed: feedId,
    title: post.title,
    link: post.link,
    description: post.description,
  }));

  return newPosts;
}
