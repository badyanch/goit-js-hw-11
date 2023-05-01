import axios from 'axios/dist/axios.min.js';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '35911258-fcb6b6dc3bb23cdb1dc2ebeb9';

const searchParams = new URLSearchParams({
  key: API_KEY,
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40,
});

export default class ImgApiService {
  #seachQuery;
  #page;

  constructor() {
    this.#seachQuery = '';
    this.#page = 1;
  }

  async fetchImgs() {
    const url = `${BASE_URL}?${searchParams}&q=${this.#seachQuery}&page=${
      this.#page
    }`;

    const resp = await axios.get(url);

    this.#incrementPage();

    return resp.data;
  }

  #incrementPage() {
    this.#page += 1;
  }

  resetPage() {
    this.#page = 1;
  }

  set query(newQuery) {
    this.#seachQuery = newQuery;
  }

  get query() {
    return this.#seachQuery;
  }
}
