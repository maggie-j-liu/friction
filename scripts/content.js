console.log("Content script yayy!");

let lastScroll;
let startedScroll = false;
let totalScrollSeconds = 0;
let scrollY = 0;
let scrollRate = 1;
const SCROLL_TARGET = 1000;
let scrollingToNext = false;
let activeVidId = 0;
var startTime = Date.now();
var maxtime = 60000; //ms right so this is 10 mins
let lastScrollPos = window.scrollY;
let totalScrollDist = 0;

// Set the scroll speed factor
let scrollSpeed = 0.5;

const progressBarContainer = document.createElement("div");

progressBarContainer.style =
  "position: absolute; top: 0; bottom: 0; right: 0; width: 12px; z-index: 9999; display: flex; flex-direction: column";

const spacer = document.createElement("div");

const progressBar = document.createElement("div");
progressBar.style = "width: 100%; background-color: red;";

progressBarContainer.appendChild(spacer);
progressBarContainer.appendChild(progressBar);

document.body.appendChild(progressBarContainer);

const handleYoutubeScroll = (event) => {
  event.preventDefault();

  const percentScrolled = Math.abs(scrollY) / SCROLL_TARGET;
  progressBar.style.height = `${percentScrolled * 100}%`;
  if (scrollY < 0) {
    progressBarContainer.style.justifyContent = "space-between";
  } else {
    progressBarContainer.style.justifyContent = "flex-start";
  }

  const videos = [...document.querySelectorAll(".reel-video-in-sequence")];
  const currentId = videos.find(
    (v) =>
      v.hasAttribute("is-active") &&
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
  slowDown = Date.now() - startTime <= maxtime;
  console.log(slowDown);
  // scrollY += event.deltaY * scrollRate;
  // scrollRate *= Math.pow(Math.E, -percentScrolled * 3);
  scrollY += event.deltaY * 0.4 * Math.pow(Math.E, -percentScrolled * 3);
  // console.log(scrollY);

  if (scrollY > SCROLL_TARGET || scrollY < -SCROLL_TARGET) {
    let scrollDir = scrollY > 0 ? 1 : -1;
    const currentParent = videos.find(
      (v) =>
        v.hasAttribute("is-active") &&
        v.querySelector("#shorts-container video[tabindex='-1']")
    );
    const nextVid = document.getElementById(
      Number(currentParent.id) + scrollDir
    );
    if (nextVid) {
      scrollY = 0;
      activeVidId = Number(currentParent.id) + scrollDir;
      scrollingToNext = true;
      nextVid.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    } else {
      scrollY = Math.max(Math.min(scrollY, SCROLL_TARGET), -SCROLL_TARGET);
    }
  }
};

const handleOtherScroll = (event) => {};

console.log(window.location);
if (
  (window.location.hostname === "youtube.com" ||
    window.location.hostname === "www.youtube.com") &&
  window.location.pathname.startsWith("/shorts/")
) {
  console.log("here");

  document.body.addEventListener("wheel", handleYoutubeScroll, {
    passive: false,
  });
} else {
  // window.addEventListener("scroll", (event) => {
  //   console.log("here");
  //   if (!startedScroll) {

  //   }
  // });

  addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const multiplier = Math.pow(Math.E, -totalScrollDist / 10000);
      const newScrollY = window.scrollY + event.deltaY * multiplier;
      const newScrollX = window.scrollX + event.deltaX * multiplier;

      totalScrollDist += Math.abs(newScrollY - lastScrollPos);
      lastScrollPos = newScrollY;
      console.log(Math.pow(Math.E, -totalScrollDist / 10000));
      // const timeNow = Date.now();
      // const msCurrentScroll = timeNow - lastScroll;
      // lastScroll = timeNow;

      // totalScrollSeconds += msCurrentScroll / 1000;
      window.scrollTo({
        left: newScrollX,
        top: newScrollY,
        behavior: "instant",
      });
    },
    { passive: false, useCapture: true }
  );
}
