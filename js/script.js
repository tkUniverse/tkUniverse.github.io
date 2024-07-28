let pagesInfo = {
  pageNumber: 1234,
  totalPages: 1235,
  currentLanguage: 'en'
};

function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
  options = {
    path: '/',
    SameSite: 'Lax',
    ...options
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

let update = function () {
  let imgUrl = `https://tkuniverse.github.io/${pagesInfo.currentLanguage}/pages/${pagesInfo.pageNumber + 1}.png`;

  page.src = imgUrl;
  blurredPage.src = imgUrl;

  page.onerror = function () {
    this.onerror = null;
    this.src = 'img/placeholder.png';
  };

  blurredPage.onerror = function () {
    this.onerror = null;
    this.src = 'img/placeholder.png';
  };

  setCookie('pagesInfo', JSON.stringify(pagesInfo));
  pageCounter.textContent = `${pagesInfo.pageNumber + 1}/${lastPageNumber}`;
  pagesInfo.currentLanguage = languageSelect.value;
};

document.addEventListener('DOMContentLoaded', function () {
  let cookie = getCookie('pagesInfo');
  if (cookie) {
    pagesInfo = JSON.parse(cookie);
  } else {
    setCookie('pagesInfo', JSON.stringify(pagesInfo));
  }
  update();
});

let page = document.querySelector('.page');
let blurredPage = document.querySelector('.blurred-page');
let pageCounter = document.querySelector('.page-number');
let releaseDate = document.querySelector('.release-date');
let sketchVerButton = document.querySelector('.sketch-ver-button');
let speschlessVerButton = document.querySelector('.speschless-ver-button');
let goToButton = document.getElementById('go-to-page-button');
let goToForm = document.getElementById('go-to-page-form');
let languageSelect = document.getElementById('language');
let lastPageNumber = pagesInfo.totalPages;
let toolsButton = document.getElementById('tools-btn');
let isToolsShown = false;

languageSelect.addEventListener('change', function () {
  pagesInfo.currentLanguage = languageSelect.value;
  update();
});

let changePage = function (currentPage, action) {
  if (action === 'first') {
    pagesInfo.pageNumber = 0;
  } else if (action === 'last') {
    pagesInfo.pageNumber = lastPageNumber - 1;
  } else if (action === 'previous' && currentPage > 0) {
    pagesInfo.pageNumber = pagesInfo.pageNumber - 1;
  } else if (action === 'next' && currentPage < lastPageNumber - 1) {
    pagesInfo.pageNumber = pagesInfo.pageNumber + 1;
  }
  update();
};

goToForm.addEventListener('submit', function(evt) {
  evt.preventDefault();
  let pageInput = document.querySelector('.page-input').valueAsNumber;
  if (pageInput >= 1 && pageInput <= lastPageNumber) {
    document.querySelector('.error').classList.add('hidden');
    pagesInfo.pageNumber = pageInput - 1;
    update();
  } else {
    document.querySelector('.error').classList.remove('hidden');
  }
  document.querySelector('.page-input').value = "";
});

toolsButton.addEventListener('click', function () {
  if (!isToolsShown) {
    document.getElementById('tools-container').classList.remove('hidden');
    isToolsShown = true;
  } else {
    document.getElementById('tools-container').classList.add('hidden');
    isToolsShown = false;
  }
});
