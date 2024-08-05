let pagesInfo = {
  pageNumber: 0,
  pageSize: 'w-600',
  currentLanguage: 'en',
  isSketch: false,
  ifFirstTime: true
};

const totalPages = 1235;

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
  document.querySelector('.image-container').classList.remove('page-error');

  let imgUrl = `https://tkuniverse.space/${pagesInfo.currentLanguage}/pages/${pagesInfo.pageNumber + 1}.png`;
  let sketchUrl = `https://tkuniverse.space/sketch/pages/${pagesInfo.pageNumber + 1}.png`;
  let currentUrl = imgUrl;

  if (pagesInfo.pageNumber < 857) {
    sketchVerButton.disabled = true;
  } else {
    sketchVerButton.disabled = false;
  }

  if (pagesInfo.isSketch) {
    currentUrl = sketchUrl;
  } else {
    currentUrl = imgUrl;
  }

  page.src = currentUrl;
  blurredPage.src = currentUrl;
  download.href = currentUrl.slice(24);
  download.download = `Twokinds Universe - ${pagesInfo.pageNumber + 1}${pagesInfo.currentLanguage}.png`;

  page.onerror = function () {
    this.onerror = null;
    this.src = 'img/placeholder.png';
    document.querySelector('.image-container').classList.add('page-error');
  };

  blurredPage.onerror = function () {
    this.onerror = null;
    this.src = 'img/placeholder.png';
  };

  setCookie('pagesInfo', JSON.stringify(pagesInfo));
  pageCounter.textContent = `${pagesInfo.pageNumber + 1}/${lastPageNumber}`;
  pagesInfo.currentLanguage = languageSelect.value;
  pagesInfo.pageSize = sizeSelect.value;
  changePageSize();
};

document.addEventListener('DOMContentLoaded', function () {
  let cookie = getCookie('pagesInfo');
  let userLang = navigator.language || navigator.userLanguage;

  if (cookie) {
    pagesInfo = JSON.parse(cookie);
  } else {
    setCookie('pagesInfo', JSON.stringify(pagesInfo));
  }
  if (pagesInfo.isSketch) {
    sketchVerButton.textContent = 'Return';
  } else {
    sketchVerButton.textContent = 'Sketch';
  }
  if (pagesInfo.ifFirstTime) {
    if (texts.hasOwnProperty(userLang)) {
      pagesInfo.currentLanguage = userLang;
      changeUILanguage(userLang);
    } else {
      pagesInfo.currentLanguage = 'en';
      changeUILanguage(pagesInfo.currentLanguage);
    }
    languageSelect.value = pagesInfo.currentLanguage;
    pagesInfo.ifFirstTime = false;
  } else {
    changeUILanguage(pagesInfo.currentLanguage);
    languageSelect.value = pagesInfo.currentLanguage;
  }
  update();
});

let page = document.querySelector('.page');
let blurredPage = document.querySelector('.blurred-page');
let pageCounter = document.querySelector('.page-number');
let releaseDate = document.querySelector('.release-date');
let sketchVerButton = document.getElementById('sketch-ver-button');
let speschlessVerButton = document.getElementById('speachless-ver-button');
let goToButton = document.getElementById('go-to-page-button');
let goToForm = document.getElementById('go-to-page-form');
let languageSelect = document.getElementById('language');
let sizeSelect = document.getElementById('page-size');
let downloadButton = document.getElementById('download');
let lastPageNumber = totalPages;
let toolsButton = document.getElementById('tools-btn');
let isToolsShown = false;

languageSelect.addEventListener('change', function () {
  pagesInfo.currentLanguage = languageSelect.value;
  changeUILanguage(pagesInfo.currentLanguage);
  update();
});

sizeSelect.addEventListener('change', function () {
  pagesInfo.pageSize = sizeSelect.value;
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
    pagesInfo.pageNumber = pageInput - 1;
    update();
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

let previewToPage = function (pageNumber) {
  pagesInfo.pageNumber = pageNumber;
  update();
  changeTab(1);
}

let createPreviews = function() {
  let archive = document.getElementById('tab-2');
  for (let i = 1; i < lastPageNumber + 1; i++) {
    let link = document.createElement('button');
    link.onclick = () => previewToPage(i-1);
    archive.appendChild(link);
    let preview = document.createElement('img');
    preview.classList.add('preview'+i);  
    preview.classList.add('preview');
    preview.src = `https://tkuniverse.space/${pagesInfo.currentLanguage}/pages/${i}.png`;
    link.appendChild(preview);
  }
}

let changeTab = function(tabNumber) {
  let targetPage = document.getElementById('tab-'+tabNumber);
  let otherPages = document.querySelectorAll('.tab');
  otherPages.forEach(function(otherPages) {
    otherPages.classList.add('hidden');
  });
  targetPage.classList.remove('hidden');
}

let changePageSize = function () {
  page.className = '';
  blurredPage.className = '';
  
  page.classList.add('page', 'justify-center');
  page.classList.add(pagesInfo.pageSize);

  blurredPage.classList.add('blurred-page', 'justify-center');
  blurredPage.classList.add(pagesInfo.pageSize);
}

sketchVerButton.addEventListener('click', function() {
  if (pagesInfo.isSketch) {
    pagesInfo.isSketch = false;
    sketchVerButton.textContent = 'Sketch';
  } else {
    pagesInfo.isSketch = true;
    sketchVerButton.textContent = 'Return';
  }
  changeUILanguage(pagesInfo.currentLanguage);
  update();
});

function changeUILanguage(lang) {
  const textElements = document.querySelectorAll('[data-text]');
  textElements.forEach(element => {
      const key = element.getAttribute('data-text');
      if (texts[lang] && texts[lang][key]) {
          element.textContent = texts[lang][key];
      }
  });

  const placeholderElements = document.querySelectorAll('[data-placeholder]');
  placeholderElements.forEach(element => {
      const key = element.getAttribute('data-placeholder');
      if (texts[lang] && texts[lang][key]) {
          element.setAttribute('placeholder', texts[lang][key]);
      }
  });
};

