import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import createGalleryCards from './templates/gallery.hbs';
// ** при установке hbs
// **(https://www.npmjs.com/package/parcel-transformer-hbs) в .parcelrc добавить:
// "transformers": {
//   "*.hbs": ["parcel-transformer-hbs"]
// }
import { PixabayApi } from './api/pixabay-api';

const searchFormEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const pixabayApi = new PixabayApi();
// console.log(pixabayApi);

const lightbox = new SimpleLightbox('.gallery .photo-card', {
  sourceAttr: 'data-url',
  captionsData: 'alt',
});

const onSearchFormSubmit = async event => {
  event.preventDefault();

  pixabayApi.query = event.currentTarget.elements.searchQuery.value.trim();
  // если инпут только один или у него уникальный класс, можно обратиться к нему через document.querySelector и взять его .value; //см.пред.задачи
  pixabayApi.page = 1;

  if (pixabayApi.query === '') {
    return Notiflix.Notify.info(
      'Sorry, there is nothing to search. Please specify your query.'
    );
  }

  try {
    const response = await pixabayApi.fetchImagesByQuery();
    console.log(response.data);

    if (response.data.total === 0) {
      loadMoreBtn.classList.add('is-hidden');
      galleryEl.innerHTML = '';
      event.target.reset();
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    if (pixabayApi.page * pixabayApi.per_page > response.data.totalHits) {
      loadMoreBtn.classList.add('is-hidden');
    } else {
      loadMoreBtn.classList.remove('is-hidden');
    }
    galleryEl.innerHTML = createGalleryCards(response.data.hits);
    const totalHits = response.data.totalHits;
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);

    window.scrollTo({ top: 0 });
    lightbox.refresh();
  } catch (err) {
    console.log(err);
  }
};

const onLoadMoreBtnClick = async event => {
  pixabayApi.page += 1;

  try {
    const response = await pixabayApi.fetchImagesByQuery();

    if (response.data.hits.length === 0) {
      loadMoreBtn.classList.add('is-hidden');
      return Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }

    galleryEl.insertAdjacentHTML(
      'beforeend',
      createGalleryCards(response.data.hits)
    );
    console.log(
      pixabayApi.page,
      pixabayApi.page * pixabayApi.per_page,
      response.data.totalHits
    );
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 0.5,
      behavior: 'smooth',
    });

    lightbox.refresh();
  } catch (err) {
    console.log(err);
  }
};

searchFormEl.addEventListener('submit', onSearchFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);
