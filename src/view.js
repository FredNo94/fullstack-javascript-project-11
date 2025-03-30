const baseHTMLFeeds = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4"></h2>
      </div>
        <ul class="list-group border-0 rounded-0">
        </ul>
    </div>
`;

const baseHTMLPosts = `
    <div class="card border-0">
        <div class="card-body">
            <h2 class="card-title h4"></h2>
        </div>
        <ul class="list-group border-0 rounded-0">
        </ul>
    </div>
`;

export function renderError(error, i18n) {
  const input = document.querySelector('input[id=url-input]');
  const feedback = document.querySelector('.feedback');

  if (error.length > 0) {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = error;
  } else {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t('feedbackMessage.isLoadOk');
  }
}

export function renderFeeds(state, i18n) {
  const feedForm = document.querySelector('.feeds');
  feedForm.innerHTML = baseHTMLFeeds;

  const feedTitel = feedForm.querySelector('h2');
  feedTitel.textContent = i18n.t('uiTexts.feeds');

  const feedList = feedForm.querySelector('ul');

  const feedsData = state.data.feeds;

  feedsData.map((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.classList.add('border-0');
    li.classList.add('border-end-0');
    li.innerHTML = `
            <h3 class="h6 m-0">${feed.title}</h3>
            <p class="m-0 small text-black-50">${feed.description}</p>
        `;
    return feedList.append(li);
  });
}

export function renderPosts(state, i18n) {
  const postForm = document.querySelector('.posts');
  postForm.innerHTML = baseHTMLPosts;

  const postTitel = postForm.querySelector('h2');
  postTitel.textContent = i18n.t('uiTexts.posts');

  const postList = postForm.querySelector('ul');

  const feedPosts = state.data.posts;

  feedPosts.map((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.classList.add('d-flex');
    li.classList.add('justify-content-between');
    li.classList.add('align-items-start');
    li.classList.add('border-0');
    li.classList.add('border-end-0');
    li.innerHTML = `
              <a  href="${post.link}" class="fw-bold" data-id="${post.id}" target="_blank" rel="noopener noreferrer">
              ${post.title}
              </a>
              <button type="button"
                  class="btn btn-outline-primary btn-sm" data-id="${post.id}" data-bs-toggle="modal"
                  data-bs-target="#modal">Просмотр
              </button>
          `;
    return postList.append(li);
  });
}
