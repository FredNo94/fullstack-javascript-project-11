export function getFeed(feedId, feed, url) {
  return {
    feedId: feedId,
    title: feed.title,
    description: feed.description,
    url: url
  }
};

export function getPosts(posts,feedId) {
  const newPosts = posts.map((post) => {
    return {
      id: _.uniqueId(),
      idFeed: feedId,
      title: post.title,
      link: post.link,
      description: post.description,
    }
  })

  return newPosts
};
