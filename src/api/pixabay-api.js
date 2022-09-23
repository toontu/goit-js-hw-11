import axios from 'axios';

export class PixabayApi {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '24564551-73178b9d9b6620a210ba5c0c6';

  constructor() {
    this.query = null;
    this.page = 1;
    this.per_page = 40;
  }

  fetchImagesByQuery() {
    return axios.get(`${this.#BASE_URL}/`, {
      params: {
        key: this.#API_KEY,
        q: this.query,
        page: this.page,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        per_page: this.per_page,
      },
    });
  }
}
