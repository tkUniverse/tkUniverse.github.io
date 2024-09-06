let pagesInfo = {
  pageNumber: 0,
  pageSize: 'w-600',
  currentLanguage: 'en',
  isFirstTime: true,
  isSketch: false,
  isGlow: true
};

let lastPageNumber;

async function fetchTotalPages() {
  try {
    const response = await fetch('http://lastpage.tkuniverse.space/');
    const data = await response.json();
    lastPageNumber = Number(data.lastPage);
    update();
  } catch (error) {
    console.error('Error fetching total pages:', error);
  }
}

fetchTotalPages();

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
  if (pagesInfo.pageNumber >= 857) {
    url.searchParams.set('s', pagesInfo.isSketch);
  } else {
    url.searchParams.delete('s', pagesInfo.isSketch);
    pagesInfo.isSketch = false;
  }
  window.history.replaceState({}, '', url.toString());

  document.querySelector('.image-container').classList.remove('page-error');

  let imgUrl = `https://tkuniverse.space/${pagesInfo.currentLanguage}/pages/${pagesInfo.pageNumber + 1}.png`;
  let sketchUrl = `https://tkuniverse.space/sketch/pages/${pagesInfo.pageNumber + 1}.png`;
  let currentUrl = pagesInfo.isSketch ? sketchUrl : imgUrl;

  sketchVerButton.disabled = pagesInfo.pageNumber < 857;

  document.getElementById('page-viewer-button').textContent = '';
  document.querySelector('html').lang = pagesInfo.currentLanguage;
  changeUILanguage(pagesInfo.currentLanguage);
  document.querySelector('title').textContent = `Twokinds Universe - Page ${pagesInfo.pageNumber + 1}`;
  document.getElementById('page-viewer-button').textContent = `${document.getElementById('page-viewer-button').textContent} ${pagesInfo.pageNumber + 1}`;
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
  lastPageNumber ? pageCounter.textContent = `${pagesInfo.pageNumber + 1}/${lastPageNumber}` : pageCounter.textContent = `${pagesInfo.pageNumber + 1}/loading...`;
  changePageSize();
  removeGlow();
  updateButtonState();
};

document.addEventListener('DOMContentLoaded', function () {
  let pageParam = getQueryParam('p');
  let langParam = getQueryParam('l');
  let isSketchParam = getQueryParam('s');
  let urlHasParams = pageParam !== null || langParam !== null || isSketchParam !== null;

  let cookie = getCookie('pagesInfo');
  
  if (cookie) {
    try {
      let cookieData = JSON.parse(cookie);

      if (!urlHasParams) {
        pagesInfo = cookieData;
      } else {
        for (let key in cookieData) {
          if (pagesInfo[key] === undefined) {
            pagesInfo[key] = cookieData[key];
          }
        }
      }
    } catch (e) {
    }
  }

  if (pageParam >= 1 && pageParam <= 1236) {
    pagesInfo.pageNumber = parseInt(pageParam, 10) - 1;
  } else {
    pagesInfo = JSON.parse(cookie);
  }

  if (langParam !== null && texts.hasOwnProperty(langParam)) {
    pagesInfo.currentLanguage = langParam;
  }

  if (isSketchParam !== null) {
    pagesInfo.isSketch = isSketchParam === 'true';
  }

  function bannerLoad() {
    document.querySelector('.banner').src = `https://twokinds.gallery/image/thumbnail/${getRandomInt(1, 5826)}`;
  }
    
  bannerLoad();

  if (pagesInfo.isFirstTime) {
    let userLang = navigator.language || navigator.userLanguage;
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
let toggleGlowButton = document.getElementById('remove-glow');
let sizeSelect = document.getElementById('page-size');
let downloadButton = document.getElementById('download');
let toolsButton = document.getElementById('tools-btn');
let isToolsShown = false;
let isVisible = true;

languageSelect.addEventListener('change', function () {
  pagesInfo.currentLanguage = languageSelect.value;
  changeUILanguage(pagesInfo.currentLanguage);
  update();
});

sizeSelect.addEventListener('change', function () {
  pagesInfo.pageSize = sizeSelect.value;
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
  let pageInput = document.querySelector('.page-input').valueAsNumber;
  if (pageInput >= 1 && pageInput <= lastPageNumber) {
    pagesInfo.pageNumber = pageInput - 1;
    update();
  }
  document.querySelector('.page-input').value = "";
});

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
};

function getQueryParam(param, url = window.location.href) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get(param);
};

toggleGlowButton.addEventListener('click', function() {
  pagesInfo.isGlow = !pagesInfo.isGlow;
  toggleGlowButton.textContent = pagesInfo.isGlow ? texts[pagesInfo.currentLanguage].removePageGlowButton : texts[pagesInfo.currentLanguage].removePageGlowButtonAlt;
  update();
});

let removeGlow = function () {
  if (pagesInfo.isGlow) {
    blurredPage.classList.remove('hidden');
  } else {
    blurredPage.classList.add('hidden');
  }
};

let updateButtonState = function() {
  sketchVerButton.textContent = pagesInfo.isSketch 
    ? texts[pagesInfo.currentLanguage].sketchVerButtonAlt 
    : texts[pagesInfo.currentLanguage].sketchVerButton;
  toggleGlowButton.textContent = pagesInfo.isGlow 
    ? texts[pagesInfo.currentLanguage].removePageGlowButton 
    : texts[pagesInfo.currentLanguage].removePageGlowButtonAlt;
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sideBarToggle() {
  isVisible = !isVisible;
  let sideBar = document.querySelector('.sidebar');
  let mainContent = document.querySelector('main');
  let showSideBar = document.getElementById('show-sidebar');

  if (isVisible) {
    sideBar.classList.remove('hidden');
    showSideBar.style.display = 'none';
    setTimeout(function() {
      sideBar.style.display = 'flex';
      mainContent.style.marginLeft = '300px';
      mainContent.style.width = 'calc(100% - 300px)';
    }, 50);
  } else {
    sideBar.classList.add('hidden');
    showSideBar.style.display = 'block';
    setTimeout(function() {
      sideBar.style.display = 'none';
      mainContent.style.marginLeft = '0';
      mainContent.style.width = '100%';
    }, 50);
  }
}

document.getElementById('show-sidebar').addEventListener('click', function() {
  sideBarToggle();
});

document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('main');
  const showSidebarArea = document.getElementById('show-sidebar');
  let isSidebarVisible = false;

  function showSidebar() {
    sidebar.classList.remove('hidden');
    sidebar.style.display = 'flex';
    showSidebarArea.style.display = 'none'; // Hide the hover area
    setTimeout(() => {
      sidebar.style.transform = 'translateX(0)';
      mainContent.style.marginLeft = '300px';
      mainContent.style.width = 'calc(100% - 300px)';
    }, 10); // Small delay to ensure the transition is applied
  }

  function hideSidebar() {
    sidebar.style.transform = 'translateX(-100%)';
    setTimeout(() => {
      sidebar.classList.add('hidden');
      sidebar.style.display = 'none';
      mainContent.style.marginLeft = '0';
      mainContent.style.width = '100%';
      showSidebarArea.style.display = 'block'; // Show the hover area again
    }, 300); // Match the CSS transition duration
  }

  showSidebarArea.addEventListener('mouseenter', function() {
    if (!isSidebarVisible) {
      showSidebar();
      isSidebarVisible = true;
    }
  });

  sidebar.addEventListener('mouseleave', function() {
    if (isSidebarVisible) {
      hideSidebar();
      isSidebarVisible = false;
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const toolsContainer = document.getElementById('tools-container');
  const toolsButton = document.getElementById('tools-btn');
  const pageSpace = document.querySelector('.page-space');
  let isToolsVisible = false;

  function showToolsContainer() {
    pageSpace.classList.add('mb-0');
    pageSpace.classList.remove('mb-2rem');
    toolsContainer.classList.remove('hidden');
    toolsContainer.style.display = 'block';
    setTimeout(() => {
      toolsContainer.style.maxHeight = '100%'; // Adjust based on your content height
      toolsContainer.style.opacity = '1';
    }, 10); // Small delay to ensure the transition is applied
  }

  function hideToolsContainer() {
    pageSpace.classList.remove('mb-0');
    pageSpace.classList.add('mb-2rem');
    toolsContainer.style.maxHeight = '0';
    toolsContainer.style.opacity = '0';
    setTimeout(() => {
      toolsContainer.classList.add('hidden');
      toolsContainer.style.display = 'none';
    }, 300); // Match the CSS transition duration
  }

  toolsButton.addEventListener('click', function() {
    if (isToolsVisible) {
      hideToolsContainer();
    } else {
      showToolsContainer();
    }
    isToolsVisible = !isToolsVisible;
  });

  const pageElement = document.querySelector('.page');
  let touchstartX = 0;
  let touchendX = 0;

  function handleGesture() {
    if (touchendX < touchstartX - 50) { // Swipe left
      changePage('next');
    }
    if (touchendX > touchstartX + 50) { // Swipe right
      changePage('previous');
    }
  }

  pageElement.addEventListener('touchstart', function(event) {
    touchstartX = event.changedTouches[0].screenX;
  });

  pageElement.addEventListener('touchend', function(event) {
    touchendX = event.changedTouches[0].screenX;
    handleGesture();
  });
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowLeft') {
    changePage('previous');
  } else if (event.key === 'ArrowRight') {
    changePage('next');
  }
});