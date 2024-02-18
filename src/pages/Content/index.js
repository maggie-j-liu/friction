console.log('Content script yayy!');

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
  const multiplier = Math.pow(Math.E, -(totalScrollDist / 1000) / (SCROLL_TARGET * 30));
  const blurMultiplier = Math.pow(Math.E, -(totalScrollDist / 1000) / (SCROLL_TARGET * 60));
  styleEl.innerHTML = `${selector} { filter: ${
    grayscaleVideo ? `grayscale(${1 - multiplier})` : ''
  } ${blurVideo ? `blur(${(1 - blurMultiplier) * 5}px)` : ''}}`;
};

chrome.storage.local
  .get(['scrollDist', 'videoSlowdown', 'videoGrayscale', 'videoBlur'])
  .then((res) => {
    if (res.scrollDist) {
      totalScrollDist = res.scrollDist;
    } else {
      totalScrollDist = 0;
    }
    slowdownVideo = res.videoSlowdown ?? true;
    grayscaleVideo = res.videoGrayscale ?? true;
    blurVideo = res.videoBlur ?? true;
    console.log(slowdownVideo, grayscaleVideo, blurVideo);
    if (IS_YOUTUBE || IS_INSTAGRAM) {
      updateVideoFilter(
        totalScrollDist,
        IS_YOUTUBE ? YOUTUBE_VIDEO_SELECTOR : INSTAGRAM_VIDEO_SELECTOR
      );
    }
    console.log('totalscrolldist', totalScrollDist);
  });

const handleYoutubeScroll = (event) => {
  event.preventDefault();

  const vids = document.querySelectorAll('video');
  const multiplier = Math.pow(Math.E, --(totalScrollDist / 1000) / (SCROLL_TARGET * 30));

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
      chrome.storage.local.set({ scrollDist: totalScrollDist });
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
  const multiplier = Math.pow(Math.E, -(totalScrollDist / 1000) / (SCROLL_TARGET * 30));

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
      chrome.storage.local.set({ scrollDist: totalScrollDist });
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
if (IS_YOUTUBE) {
  progressBar.style.backgroundColor = 'red';

  document.body.addEventListener('wheel', handleYoutubeScroll, {
    passive: false,
  });
} else if (IS_INSTAGRAM) {
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
        -(totalScrollDist / 1000) / (SCROLL_TARGET * 10)
      );
      const newScrollY = window.scrollY + event.deltaY * multiplier;
      const newScrollX = window.scrollX + event.deltaX * multiplier;

      totalScrollDist += Math.abs(newScrollY - lastScrollPos);
      instanceScroll += Math.abs(scrollY - lastScrollPos);
      console.log(totalScrollDist);
      chrome.storage.local.set({ scrollDist: totalScrollDist });
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


const interval = setInterval(async function() {
  console.log(session)
  if(session){
    console.log("HIII")

    let distance = instanceScroll
    let totalScrollDistAtStart = totalScrollDist;
    instanceScroll = 0
    console.log(JSON.stringify({
       session,
       distance
     }))
    console.log({
         session,
         distance
       })
    await fetch(`https://treehacks-backend-xi.vercel.app/api/log?session=${session}&distance=${distance}`).then((r) => r.json()).then(r => {
       totalScrollDist = (totalScrollDist - totalScrollDistAtStart) + r.friction;
       chrome.storage.local.set({ status: JSON.stringify(r) });
     })
  }
 }, 5000);