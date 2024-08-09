let pagesInfo = {
  pageNumber: 0,
  pageSize: 'w-600',
  currentLanguage: 'en',
  isFirstTime: true,
  isSketch: false,
  isGlow: true
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
  const url = new URL(window.location.href);
  url.searchParams.set('p', pagesInfo.pageNumber + 1);
  url.searchParams.set('l', pagesInfo.currentLanguage);
  window.history.replaceState({}, '', url.toString());

  document.querySelector('.image-container').classList.remove('page-error');

  let imgUrl = `https://tkuniverse.space/${pagesInfo.currentLanguage}/pages/${pagesInfo.pageNumber + 1}.png`;
  let sketchUrl = `https://tkuniverse.space/sketch/pages/${pagesInfo.pageNumber + 1}.png`;
  let currentUrl = pagesInfo.isSketch ? sketchUrl : imgUrl;

  sketchVerButton.disabled = pagesInfo.pageNumber < 857;

  document.getElementById('page-viewer-button').textContent = `Continue: ${pagesInfo.pageNumber + 1}`
  page.src = currentUrl;
  blurredPage.src = currentUrl;
  downloadButton.href = currentUrl;
  downloadButton.download = `Twokinds Universe - ${pagesInfo.currentLanguage}${pagesInfo.pageNumber + 1}.png`;

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
  changePageSize();
  removeGlow();
};

document.addEventListener('DOMContentLoaded', function () {
  let pageParam = parseInt(getQueryParam('p'), 10) - 1;
  let langParam = getQueryParam('l');

  if (isNaN(pageParam) || pageParam < 0 || pageParam > totalPages) {
    pageParam = null;
  }

  let cookie = getCookie('pagesInfo');
  let userLang = navigator.language || navigator.userLanguage;

  if (cookie) {
    pagesInfo = JSON.parse(cookie);
  } else {
    setCookie('pagesInfo', JSON.stringify(pagesInfo));
  }

  if (pageParam !== null) {
    pagesInfo.pageNumber = pageParam;
  }

  if (langParam !== null && texts.hasOwnProperty(langParam)) {
    pagesInfo.currentLanguage = langParam;
  } else if (pagesInfo.isFirstTime) {
    if (texts.hasOwnProperty(userLang)) {
      pagesInfo.currentLanguage = userLang;
    } else {
      pagesInfo.currentLanguage = 'en';
    }
    pagesInfo.isFirstTime = false;
  }

  changeUILanguage(pagesInfo.currentLanguage);
  languageSelect.value = pagesInfo.currentLanguage;
  
  sketchVerButton.textContent = pagesInfo.isSketch 
    ? texts[pagesInfo.currentLanguage].sketchVerButtonAlt 
    : texts[pagesInfo.currentLanguage].sketchVerButton;

  update();
});

let page = document.querySelector('.page');
let blurredPage = document.querySelector('.blurred-page');
let pageCounter = document.querySelector('.page-number');
let sketchVerButton = document.getElementById('sketch-ver-button');
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
    pagesInfo.pageNumber -= 1;
  } else if (action === 'next' && currentPage < lastPageNumber - 1) {
    pagesInfo.pageNumber += 1;
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

function toggleVisibility(element) {
  if (element.classList.contains('invisible')) {
    element.style.display = 'flex';
    element.offsetHeight; 
    element.classList.remove('invisible');
  } else {
    element.classList.add('invisible');
    element.addEventListener('transitionend', function handler() {
      element.style.display = 'none';
      element.removeEventListener('transitionend', handler);
    });
  }
}

let previewToPage = function (pageNumber) {
  pagesInfo.pageNumber = pageNumber;
  update();
  changeTab(1);
};

let createPreviews = function() {
  let archive = document.getElementById('tab-2');
  for (let i = 1; i <= lastPageNumber; i++) {
    let link = document.createElement('button');
    link.onclick = () => previewToPage(i - 1);
    archive.appendChild(link);
    let preview = document.createElement('img');
    preview.classList.add('preview');
    preview.src = `https://tkuniverse.space/${pagesInfo.currentLanguage}/pages/${i}.png`;
    link.appendChild(preview);
  }
};

let changeTab = function(tabNumber) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.add('hidden'));
  document.getElementById('tab-' + tabNumber).classList.remove('hidden');
};

let changePageSize = function () {
  page.className = `page justify-center ${pagesInfo.pageSize}`;
  blurredPage.className = `blurred-page justify-center ${pagesInfo.pageSize}`;
};

sketchVerButton.addEventListener('click', function() {
  pagesInfo.isSketch = !pagesInfo.isSketch;
  sketchVerButton.textContent = pagesInfo.isSketch 
    ? texts[pagesInfo.currentLanguage].sketchVerButtonAlt 
    : texts[pagesInfo.currentLanguage].sketchVerButton;
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
}

function getQueryParam(param, url = window.location.href) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get(param);
}

document.getElementById('remove-glow').addEventListener('click', function() {
  pagesInfo.isGlow = !pagesInfo.isGlow;
  document.getElementById('remove-glow').textContent = pagesInfo.isGlow ? texts[pagesInfo.currentLanguage].removePageGlowButton : texts[pagesInfo.currentLanguage].removePageGlowButtonAlt
  update();
});

let removeGlow = function () {
  if (pagesInfo.isGlow) {
    blurredPage.classList.remove('hidden');
  } else {
    blurredPage.classList.add('hidden');
  }
};
