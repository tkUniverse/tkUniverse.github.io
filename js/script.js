let pageNumber = 0;
let currentLanguage = 'en';
let pagesInfo = {
  enPages: `https://tkuniverse.github.io/en/pages/${pageNumber + 1}.png`,
  ruPages: `https://twokinds.ru/comic/${pageNumber + 1}/page`,
  totalPages: 1235
};

let page = document.querySelector('.page');
let blurredPage = document.querySelector('.blurred-page');
let pageCounter = document.querySelector('.page-number');
let releaseDate = document.querySelector('.release-date');
let sketchVerButton = document.querySelector('.sketch-ver-button');
let speschlessVerButton = document.querySelector('.speschless-ver-button');
let goToButton = document.getElementById('go-to-page-button');
let languageSelect = document.getElementById('language');
let lastPageNumber = pagesInfo.totalPages;

document.addEventListener('DOMContentLoaded', function () {
  update(pageNumber);
});

languageSelect.addEventListener('change', function () {
  currentLanguage = languageSelect.value;
  update(pageNumber);
});

let changePage = function (currentPage, action) {
  if (action === 'first') {
    pageNumber = 0;
  } else if (action === 'last') {
    pageNumber = lastPageNumber - 1;
  } else if (action === 'previous' && currentPage > 0) {
    pageNumber--;
  } else if (action === 'next' && currentPage < lastPageNumber - 1) {
    pageNumber++;
  }
  update(pageNumber);
};

let update = function (updPageNumber) {
  if (currentLanguage === 'en') {
    pagesInfo.enPages = `https://tkuniverse.github.io/en/pages/${pageNumber + 1}.png`;
    page.src = pagesInfo.enPages;
    blurredPage.src = pagesInfo.enPages;
  } else if (currentLanguage === 'ru') {
    pagesInfo.ruPages = `https://twokinds.ru/comic/${updPageNumber + 1}/page`;
    page.src = pagesInfo.ruPages;
    blurredPage.src = pagesInfo.ruPages;
  }
  pageCounter.textContent = `${pageNumber + 1}/${lastPageNumber}`;
};

goToButton.addEventListener('click', function() {
  let pageInput = document.querySelector('.page-input').valueAsNumber;
  if (pageInput >= 1 && pageInput <= lastPageNumber) {
    document.querySelector('.error').classList.add('hidden');
    pageNumber = pageInput - 1;
    update(pageNumber);
  } else {
    document.querySelector('.error').classList.remove('hidden');
  }
  document.querySelector('.page-input').value = "";
});
