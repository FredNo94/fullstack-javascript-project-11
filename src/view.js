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
            <h3 class="h6 m-0"></h3>
            <p class="m-0 small text-black-50"></p>
            `;
    const h3 = li.querySelector('h3');
    const p = li.querySelector('p');
    h3.textContent = feed.title;
    p.textContent = feed.description;

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
  const readPosts = new Set(state.data.readPosts);

  feedPosts.map((post) => {
    const classTitle = readPosts.has(post.id) ? 'fw-normal' : 'fw-bold';
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.classList.add('d-flex');
    li.classList.add('justify-content-between');
    li.classList.add('align-items-start');
    li.classList.add('border-0');
    li.classList.add('border-end-0');
    li.innerHTML = `
              <a target="_blank" rel="noopener noreferrer"></a>
              <button type="button"
                  class="btn btn-outline-primary btn-sm" data-bs-toggle="modal"
                  data-bs-target="#modal">Просмотр
              </button>
          `;
    const a = li.querySelector('a');
    const button = li.querySelector('button');
    a.setAttribute('href', post.link);
    a.setAttribute('class', classTitle);
    a.setAttribute('data-id', post.id);
    a.textContent = post.title;
    button.setAttribute('data-id', post.id);

    return postList.append(li);
  });
}

export function renderModal(post) {
  const modal = document.querySelector('div[class=modal-dialog]');
  const modalTitle = modal.querySelector('.modal-title');
  const modalDescription = modal.querySelector('.modal-body');
  const modalLinkBtn = modal.querySelector('.btn');

  modalTitle.textContent = post.title;
  modalDescription.textContent = post.description;
  modalLinkBtn.setAttribute('href', post.link);
}

export function renderSubmit(state = false) {
  const btnSubmit = document.querySelector('button[type=submit]');
  if (state) {
    btnSubmit.removeAttribute('disabled');
  } else {
    btnSubmit.setAttribute('disabled', '');
  }
}
