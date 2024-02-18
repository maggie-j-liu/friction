import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { DEFAULT_BLOCKED_SITES } from '../../constants';

let scrollY = 0;
const SCROLL_TARGET = 1000;
let scrollingToNext = false;
let activeVidId = 0;
let lastScrollPos = window.scrollY;
let totalScrollDist = 0;
let instanceScroll = 0;
let session = null;

let slowdownVideo = false,
  blurVideo = false,
  grayscaleVideo = false;

let checkpoints = [1000, 3000, 5000, 10000];
let prevCheckpoint = 0;

const IS_YOUTUBE =
  (window.location.hostname === 'youtube.com' ||
    window.location.hostname === 'www.youtube.com') &&
  window.location.pathname.startsWith('/shorts/');
const IS_INSTAGRAM =
  (window.location.host === 'instagram.com' ||
    window.location.host === 'www.instagram.com') &&
  window.location.pathname.startsWith('/reels/');

const progressBarContainer = document.createElement('div');

progressBarContainer.style =
  'position: absolute; top: 0; bottom: 0; right: 0; width: 12px; z-index: 9999; display: flex; flex-direction: column';

const spacer = document.createElement('div');

const progressBar = document.createElement('div');
progressBar.style = 'width: 100%;';

progressBarContainer.appendChild(spacer);
progressBarContainer.appendChild(progressBar);

document.body.appendChild(progressBarContainer);

const styleEl = document.createElement('style');
document.head.appendChild(styleEl);

const YOUTUBE_VIDEO_SELECTOR =
  '.reel-video-in-sequence video, .reel-video-in-sequence #player-container';
const INSTAGRAM_VIDEO_SELECTOR = 'main video';

const updateVideoFilter = (scrollDist, selector) => {
  const multiplier = Math.pow(
    Math.E,
    -(scrollDist / 1000) / (SCROLL_TARGET * 30)
  );
  const blurMultiplier = Math.pow(
    Math.E,
    -(scrollDist / 1000) / (SCROLL_TARGET * 60)
  );
  styleEl.innerHTML = `${selector} { filter: ${
    grayscaleVideo ? `grayscale(${1 - multiplier})` : ''
  } ${blurVideo ? `blur(${(1 - blurMultiplier) * 5}px)` : ''}}`;
};

const findPassedCheckpoint = () => {
  let largestCheckpointPassed = 0;
  if (totalScrollDist <= checkpoints[checkpoints.length - 1]) {
    for (let i = checkpoints.length - 1; i >= 0; i--) {
      if (totalScrollDist >= checkpoints[i]) {
        largestCheckpointPassed = checkpoints[i];
        break;
      }
    }
  } else {
    largestCheckpointPassed = Math.floor(totalScrollDist / 10000) * 10000;
  }
  return largestCheckpointPassed;
};

const snarkyComments = [
  'Starting to feel the friction?',
  "You're creating friction in the friend group.",
  'Things are getting heated... slow down the scrolling.',
  'Put your energy towards other things, not just creating friction.',
  'Scroll... scroll... scroll.... more friction I guess?',
  "Your friends aren't going to like this extra friction.",
];

const processScroll = () => {
  chrome.storage.local.set({ scrollDist: totalScrollDist });
  let largestCheckpointPassed = findPassedCheckpoint(totalScrollDist);
  if (prevCheckpoint < largestCheckpointPassed) {
    prevCheckpoint = largestCheckpointPassed;
    Toastify({
      text: snarkyComments[
        Math.floor(Math.random() * (snarkyComments.length - 1))
      ],
      duration: 3000,
      close: false,
      gravity: 'bottom', // `top` or `bottom`
      position: 'right', // `left`, `center` or `right`
      style: {
        background: '#000',
        color: 'white',
        borderRadius: '8px',
        fontFamily: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Helvetica, sans-serif`,
        boxShadow: 'none',
        border: '1px solid white',
      },
    }).showToast();
  }
};

const handleYoutubeScroll = (event) => {
  event.preventDefault();

  const multiplier = Math.pow(
    Math.E,
    -(totalScrollDist / 1000) / (SCROLL_TARGET * 30)
  );

  updateVideoFilter(totalScrollDist, YOUTUBE_VIDEO_SELECTOR);

  if (slowdownVideo) {
    const vids = document.querySelectorAll('video');
    for (const vid of vids) {
      vid.playbackRate = multiplier;
    }
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
  scrollY += event.deltaY * Math.pow(Math.E, -(totalScrollDist / 1000) / 8000);
  totalScrollDist += Math.abs(scrollY - lastScrollPos);
  instanceScroll += Math.abs(scrollY - lastScrollPos);
  lastScrollPos = scrollY;

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
      processScroll();
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

  const multiplier = Math.pow(
    Math.E,
    -(totalScrollDist / 1000) / (SCROLL_TARGET * 30)
  );

  updateVideoFilter(totalScrollDist, INSTAGRAM_VIDEO_SELECTOR);

  if (slowdownVideo) {
    // slow down videos as more are scrolled thru
    const vids = document.querySelectorAll('video');
    for (const vid of vids) {
      vid.playbackRate = multiplier;
    }
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
  scrollY += event.deltaY * Math.pow(Math.E, -(totalScrollDist / 1000) / 8000);
  totalScrollDist += Math.abs(scrollY - lastScrollPos);
  instanceScroll += Math.abs(scrollY - lastScrollPos);
  lastScrollPos = scrollY;

  if (scrollY > SCROLL_TARGET || scrollY < -SCROLL_TARGET) {
    const scrollDir = scrollY > 0 ? 1 : -1;
    const nextVid = videos[currentVideoIdx + scrollDir];
    if (nextVid) {
      processScroll();
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

const handleOtherSites = () => {
  window.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const multiplier = Math.pow(
        Math.E,
        -(totalScrollDist / 1000) / (SCROLL_TARGET * 10)
      );
      const newScrollY = window.scrollY + event.deltaY * multiplier;
      const newScrollX = window.scrollX + event.deltaX * multiplier;

      totalScrollDist += Math.abs(newScrollY - lastScrollPos);
      instanceScroll += Math.abs(scrollY - lastScrollPos);
      processScroll();
      lastScrollPos = newScrollY;

      window.scrollTo({
        left: newScrollX,
        top: newScrollY,
        behavior: 'instant',
      });
    },
    { passive: false, useCapture: true }
  );
};

const interval = setInterval(async function () {
  if (session) {
    let distance = instanceScroll;
    let totalScrollDistAtStart = totalScrollDist;
    instanceScroll = 0;
    await fetch(
      `https://treehacks-backend-xi.vercel.app/api/log?session=${session}&distance=${distance}`
    )
      .then((r) => r.json())
      .then((r) => {
        totalScrollDist = totalScrollDist - totalScrollDistAtStart + r.friction;
        chrome.storage.local.set({ status: JSON.stringify(r) });
      });
  }
}, 5000);

const addScrollHandlers = (blockedSites) => {
  if (blockedSites.some((site) => window.location.href.startsWith(site))) {
    if (IS_YOUTUBE) {
      progressBar.style.backgroundColor = 'red';
      document.body.addEventListener('wheel', handleYoutubeScroll, {
        passive: false,
      });
    } else if (IS_INSTAGRAM) {
      progressBar.style.background =
        'linear-gradient(#6228d7, #ee2a7b, #f9ce34)';
      document.body.addEventListener('wheel', handleInstagramScroll, {
        passive: false,
      });
    } else {
      handleOtherSites();
    }
  }
};

chrome.storage.local
  .get([
    'status',
    'session',
    'videoSlowdown',
    'videoGrayscale',
    'videoBlur',
    'blockedSites',
  ])
  .then((res) => {
    if (res.status) {
      totalScrollDist = JSON.parse(res.status).friction;
      session = res.session;
    } else {
      totalScrollDist = 0;
    }
    prevCheckpoint = findPassedCheckpoint();

    slowdownVideo = res.videoSlowdown ?? true;
    grayscaleVideo = res.videoGrayscale ?? true;
    blurVideo = res.videoBlur ?? true;
    if (IS_YOUTUBE || IS_INSTAGRAM) {
      updateVideoFilter(
        totalScrollDist,
        IS_YOUTUBE ? YOUTUBE_VIDEO_SELECTOR : INSTAGRAM_VIDEO_SELECTOR
      );
    }
    addScrollHandlers(
      res.blockedSites ? JSON.parse(res.blockedSites) : DEFAULT_BLOCKED_SITES
    );
  });
