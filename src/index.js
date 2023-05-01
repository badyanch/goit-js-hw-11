import throttle from 'lodash.throttle';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ImgsApiService from './js/ImgsApiService';
import RenderGallery from './js/RenderGallery';
import { showSpinner, hideSpinner } from './js/spinner';

let observer = null;

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('#gallery'),
  sentinel: document.querySelector('.sentinel'),
};

const imgsApiService = new ImgsApiService();
const renderGallery = new RenderGallery(refs.gallery);

refs.searchForm.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(evt) {
  evt.preventDefault();

  const currentSearchQuery = evt.currentTarget.elements.searchQuery.value.trim();

  const isValid = validationSearchQueryValue(currentSearchQuery);

  if (!isValid) {
    return;
  }

  disconnectIntersectionObserver();

  imgsApiService.query = currentSearchQuery;

  renderGallery.onClear();
  imgsApiService.resetPage();

  showSpinner();

  try {
    const data = await imgsApiService.fetchImgs();

    if (!data.hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      hideSpinner();

      return;
    }

    Notify.success(`Hooray! We found ${data.totalHits} images.`);

    renderGallery.onRender(data.hits);
    registerIntersectionObserver();
    onCheckCollectionEnd(data.totalHits);
  } catch (err) {
    Notify.failure(err.message);
    console.log(err);
  } finally {
    hideSpinner();
  }
}

function validationSearchQueryValue(currentSearchQuery) {
  if (!currentSearchQuery) {
    Notify.failure('Enter a valid value');

    return false;
  }

  if (imgsApiService.query === currentSearchQuery) {
    Notify.failure('Enter new value');

    return false;
  }

  return true;
}

function onCheckCollectionEnd(totalHits) {
  if (totalHits <= refs.gallery.children.length) {
    Notify.success(
      "We're sorry, but you've reached the end of search results."
    );

    disconnectIntersectionObserver();
  }
}

function registerIntersectionObserver() {
  const options = {
    rootMargin: '200px',
  };

  const onEntry = entries => {
    entries.forEach(async entry => {
      if (entry.isIntersecting) {
        showSpinner();

        try {
          const data = await imgsApiService.fetchImgs();
          renderGallery.onRender(data.hits);
          onCheckCollectionEnd(data.totalHits);
        } catch (err) {
          Notify.failure(err.message);
          console.log(err);
        }

        hideSpinner();
      }
    });
  };

  observer = new IntersectionObserver(throttle(onEntry, 500), options);
  observer.observe(refs.sentinel);
}

function disconnectIntersectionObserver() {
  if (observer) {
    observer.disconnect();
  }
}