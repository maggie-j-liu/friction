console.log('Content script yayy!');

let scrollY = 0;
const SCROLL_TARGET = 1000;
let scrollingToNext = false;
let activeVidId = 0;
let lastScrollPos = window.scrollY;
let totalScrollDist = 0;

const progressBarContainer = document.createElement('div');

progressBarContainer.style =
  'position: absolute; top: 0; bottom: 0; right: 0; width: 12px; z-index: 9999; display: flex; flex-direction: column';

const spacer = document.createElement('div');

const progressBar = document.createElement('div');
progressBar.style = 'width: 100%;';

progressBarContainer.appendChild(spacer);
progressBarContainer.appendChild(progressBar);

document.body.appendChild(progressBarContainer);

const handleYoutubeScroll = (event) => {
  event.preventDefault();

  const vids = document.querySelectorAll('video');
  const multiplier = Math.pow(Math.E, -totalScrollDist / (SCROLL_TARGET * 10));

  for (const vid of vids) {
    vid.playbackRate = multiplier;
  }

  const percentScrolled = Math.abs(scrollY) / SCROLL_TARGET;
  progressBar.style.height = `${percentScrolled * 100}%`;
  if (scrollY < 0) {
    progressBarContainer.style.justifyContent = 'space-between';
  } else {
    progressBarContainer.style.justifyContent = 'flex-start';
  }

  const videos = [...document.querySelectorAll('.reel-video-in-sequence')];
  const currentId = videos.find(
    (v) =>
      v.hasAttribute('is-active') &&
      v.querySelector("#shorts-container video[tabindex='-1']")
  )?.id;
  if (!currentId) {
    return;
  }

  if (currentId && activeVidId === Number(currentId)) {
    scrollingToNext = false;
  }

  if (scrollingToNext) {
    return;
  }
  scrollY += event.deltaY * 0.4 * Math.pow(Math.E, -percentScrolled * 3);

  if (scrollY > SCROLL_TARGET || scrollY < -SCROLL_TARGET) {
    let scrollDir = scrollY > 0 ? 1 : -1;
    const currentParent = videos.find(
      (v) =>
        v.hasAttribute('is-active') &&
        v.querySelector("#shorts-container video[tabindex='-1']")
    );
    const nextVid = document.getElementById(
      Number(currentParent.id) + scrollDir
    );
    if (nextVid) {
      totalScrollDist += SCROLL_TARGET;
      scrollY = 0;
      activeVidId = Number(currentParent.id) + scrollDir;
      scrollingToNext = true;
      nextVid.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    } else {
      scrollY = Math.max(Math.min(scrollY, SCROLL_TARGET), -SCROLL_TARGET);
    }
  }
};

const handleInstagramScroll = (event) => {
  event.preventDefault();

  // slow down videos as more are scrolled thru
  const vids = document.querySelectorAll('video');
  const multiplier = Math.pow(Math.E, -totalScrollDist / (SCROLL_TARGET * 10));

  for (const vid of vids) {
    vid.playbackRate = multiplier;
  }

  const percentScrolled = Math.abs(scrollY) / SCROLL_TARGET;
  progressBar.style.height = `${percentScrolled * 100}%`;
  if (scrollY < 0) {
    progressBarContainer.style.justifyContent = 'space-between';
  } else {
    progressBarContainer.style.justifyContent = 'flex-start';
  }
  const videos = [...document.querySelectorAll('main video')];
  let currentVideoIdx = null;
  for (let i = 0; i < videos.length; i++) {
    const vid = videos[i];
    const vidClientRect = vid.getBoundingClientRect();
    if (
      vidClientRect.top >= 0 &&
      vidClientRect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      vidClientRect.left >= 0 &&
      vidClientRect.right <=
        (window.innerWidth || document.documentElement.clientWidth)
    ) {
      currentVideoIdx = i;
    }
  }
  if (currentVideoIdx === null) {
    return;
  }
  scrollY += event.deltaY * 0.4 * Math.pow(Math.E, -percentScrolled * 3);

  if (scrollY > SCROLL_TARGET || scrollY < -SCROLL_TARGET) {
    const scrollDir = scrollY > 0 ? 1 : -1;
    const nextVid = videos[currentVideoIdx + scrollDir];
    if (nextVid) {
      totalScrollDist += SCROLL_TARGET;
      scrollY = 0;
      activeVidId = currentVideoIdx + scrollDir;
      scrollingToNext = true;
      nextVid.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    } else {
      scrollY = Math.max(Math.min(scrollY, SCROLL_TARGET), -SCROLL_TARGET);
    }
  }
};

console.log(window.location);
if (
  (window.location.hostname === 'youtube.com' ||
    window.location.hostname === 'www.youtube.com') &&
  window.location.pathname.startsWith('/shorts/')
) {
  console.log('here');
  progressBar.style.backgroundColor = 'red';

  document.body.addEventListener('wheel', handleYoutubeScroll, {
    passive: false,
  });
} else if (
  (window.location.host === 'instagram.com' ||
    window.location.host === 'www.instagram.com') &&
  window.location.pathname.startsWith('/reels/')
) {
  progressBar.style.background = 'linear-gradient(#6228d7, #ee2a7b, #f9ce34)';
  document.body.addEventListener('wheel', handleInstagramScroll, {
    passive: false,
  });
} else {
  window.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const multiplier = Math.pow(
        Math.E,
        -totalScrollDist / (SCROLL_TARGET * 10)
      );
      const newScrollY = window.scrollY + event.deltaY * multiplier;
      const newScrollX = window.scrollX + event.deltaX * multiplier;

      totalScrollDist += Math.abs(newScrollY - lastScrollPos);
      lastScrollPos = newScrollY;

      window.scrollTo({
        left: newScrollX,
        top: newScrollY,
        behavior: 'instant',
      });
    },
    { passive: false, useCapture: true }
  );
}
