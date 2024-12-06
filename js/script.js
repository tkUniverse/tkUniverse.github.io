let pagesInfo = {
  pageNumber: 0,
  currentLanguage: 'en',
  isSketch: false,
  isGlow: true,
  isSpeechless: false,
};

let lastPageNumber;

async function fetchTotalPages() {
  try {
    const response = await fetch('https://api.tkuniverse.space/');
    const data = await response.json();
    lastPageNumber = Number(data.lastPage);
    update();
  } catch (error) {
    console.error('Error fetching total pages:', error);
    lastPageNumber = 1500;
  }
}

async function fetchSketchAvailability() {
  let sketchAvailable;
  try {
    const response = await fetch(`https://tkuniverse.space/sketch/pages/${pagesInfo.pageNumber + 1}.png`);
    if (response.status === 200) {
      sketchAvailable = true;
    } else {
      sketchAvailable = false;
    }
  } catch (error) {
    console.error('Error fetching sketch:', error);
  }

  return sketchAvailable;
}

async function fetchSpeechlessAvailability() {
  let speechlessAvailable;
  try {
    const response = await fetch(`https://tkuniverse.space/speechless/pages/${pagesInfo.pageNumber + 1}.png`);
    if (response.status === 200) {
      speechlessAvailable = true;
    } else {
      speechlessAvailable = false;
    }
  } catch (error) {
    console.error('Error fetching speechless:', error);
  }

  return speechlessAvailable;
}

fetchTotalPages();

function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  const mobileRegex = /android|bb\d+|meego|blackberry|ip(hone|od)|iemobile|kindle|silk|mobile|opera mini|fennec|maemo|windows phone|palm|symbian|bada/i;

  return mobileRegex.test(userAgent) || (window.innerWidth <= 768);
}

function redirectBasedOnDevice() {
  const isRedirected = sessionStorage.getItem('redirected');
  const queryParams = new URLSearchParams(window.location.search);

  if (!isRedirected) {
    sessionStorage.setItem('redirected', 'true');

    if (!queryParams.has('l')) {
      queryParams.set('l', pagesInfo.currentLanguage);
    }

    const targetPage = isMobileDevice() ? 'mobile.html' : 'index.html';
    const redirectUrl = `${targetPage}?${queryParams.toString()}`;

    window.location.replace(redirectUrl);
  }
}

function update() {
  const url = new URL(window.location.href);
  url.searchParams.set('p', pagesInfo.pageNumber + 1);
  url.searchParams.set('l', pagesInfo.currentLanguage);
  if (pagesInfo.pageNumber >= 857) {
    url.searchParams.set('s', pagesInfo.isSketch);
  } else {
    url.searchParams.delete('s', pagesInfo.isSketch);
    pagesInfo.isSketch = false;
  }
  url.searchParams.set('sp', pagesInfo.isSpeechless);
  window.history.replaceState({}, '', url.toString());

  document.querySelector('.image-container').classList.remove('page-error');

  const imgUrl = `https://tkuniverse.space/${pagesInfo.currentLanguage}/pages/${pagesInfo.pageNumber + 1}.png`;
  const sketchUrl = `https://tkuniverse.space/sketch/pages/${pagesInfo.pageNumber + 1}.png`;
  const speechlessUrl = `https://tkuniverse.space/speechless/pages/${pagesInfo.pageNumber + 1}.png`;
  const currentUrl = pagesInfo.isSpeechless ? speechlessUrl : (pagesInfo.isSketch ? sketchUrl : imgUrl);

  fetchSketchAvailability().then(sketchAvailable => {
    sketchVerButton.disabled = !sketchAvailable;
  });

  fetchSpeechlessAvailability().then(speechlessAvailable => {
    speechlessVerButton.disabled = !speechlessAvailable;
  });

  document.querySelector('html').lang = pagesInfo.currentLanguage;
  changeUILanguage(pagesInfo.currentLanguage);
  document.querySelector('title').textContent = `Twokinds Universe - Page ${pagesInfo.pageNumber + 1}`;
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

  lastPageNumber ? pageCounter.textContent = `${pagesInfo.pageNumber + 1}/${lastPageNumber} - ${Math.round(pagesInfo.pageNumber / lastPageNumber * 100)}%` : pageCounter.textContent = `${pagesInfo.pageNumber + 1}/loading...`;
  changePageSize();
  removeGlow();
  updateButtonState();
};

document.addEventListener('DOMContentLoaded', function () {
  const pageParam = getQueryParam('p');
  const langParam = getQueryParam('l');
  const isSketchParam = getQueryParam('s');
  const isSpeechlessParam = getQueryParam('sp');

  if (pageParam !== null && !isNaN(pageParam)) {
    pagesInfo.pageNumber = parseInt(pageParam, 10) - 1;
  }

  if (langParam !== null) {
    pagesInfo.currentLanguage = langParam;
  }

  if (isSketchParam !== null) {
    pagesInfo.isSketch = isSketchParam === 'true';
  }

  if (isSpeechlessParam !== null) {
    pagesInfo.isSpeechless = isSpeechlessParam === 'true';
  }

  // redirectBasedOnDevice();

  changeUILanguage(pagesInfo.currentLanguage);
  languageSelect.value = pagesInfo.currentLanguage;

  update();
});

const page = document.querySelector('.page');
const blurredPage = document.querySelector('.blurred-page');
const pageCounter = document.querySelector('.page-number');
const sketchVerButton = document.getElementById('sketch-ver-button');
const speechlessVerButton = document.getElementById('speechless-ver-button');
const goToForm = document.getElementById('go-to-page-form');
const languageSelect = document.getElementById('language');
const downloadButton = document.getElementById('download');
let isToolsShown = false;
let isVisible = true;

languageSelect.addEventListener('change', function () {
  pagesInfo.currentLanguage = languageSelect.value;
  changeUILanguage(pagesInfo.currentLanguage);
  update();
});

let changePage = function (action) {
  if (action === 'first') {
    pagesInfo.pageNumber = 0;
  } else if (action === 'last') {
    pagesInfo.pageNumber = lastPageNumber - 1;
  } else if (action === 'previous' && pagesInfo.pageNumber > 0) {
    pagesInfo.pageNumber -= 1;
  } else if (action === 'next' && pagesInfo.pageNumber < lastPageNumber - 1) {
    pagesInfo.pageNumber += 1;
  }
  update();
};

goToForm.addEventListener('submit', function(evt) {
  evt.preventDefault();
  let pageInput = document.getElementById('page-input').valueAsNumber;
  if (pageInput >= 1 && pageInput <= lastPageNumber) {
    pagesInfo.pageNumber = pageInput - 1;
    update();
  }
  document.getElementById('page-input').value = "";
});

let changePageSize = function () {
  page.className = `page justify-center ${pagesInfo.pageSize}`;
  blurredPage.className = `blurred-page justify-center ${pagesInfo.pageSize}`;
};

sketchVerButton.addEventListener('click', function() {
  pagesInfo.isSketch = !pagesInfo.isSketch;
  if (pagesInfo.isSketch) {
    pagesInfo.isSpeechless = false;
  }
  update();
});

speechlessVerButton.addEventListener('click', function() {
  pagesInfo.isSpeechless = !pagesInfo.isSpeechless;
  if (pagesInfo.isSpeechless) {
    pagesInfo.isSketch = false;
  }
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

function getQueryParam(param, url = window.location.href) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get(param);
};

function removeGlow() {
  if (pagesInfo.isGlow) {
    blurredPage.classList.remove('hidden');
  } else {
    blurredPage.classList.add('hidden');
  }
};

function updateButtonState() {
  sketchVerButton.textContent = pagesInfo.isSketch 
    ? texts['en'].returnButton 
    : texts['en'].sketchVerButton;
  speechlessVerButton.textContent = pagesInfo.isSpeechless 
    ? texts['en'].returnButton 
    : texts['en'].speechlessVerButton;
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.addEventListener('keydown', function(event) {
  if (event.shiftKey && event.key === 'ArrowLeft') {
    changePage('first');
  } else if (event.shiftKey && event.key === 'ArrowRight') {
    changePage('last');
  } else if (event.key === 'ArrowLeft') {
    changePage('previous');
  } else if (event.key === 'ArrowRight') {
    changePage('next');
  }
});