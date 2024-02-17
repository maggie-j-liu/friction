console.log("Content script yayy!");

let scrollStartTime;
let startedScroll = false;
let scrollY = 0;
let scrollRate = 1;
const SCROLL_TARGET = 1000;
let scrollingToNext = false;
let activeVidId = 0;
var startTime = Date.now();
var maxtime = 60000; //ms right so this is 10 mins

// window.addEventListener("scroll", (evt) => {
//   if (!startedScroll) {
//     startedScroll = true;
//     scrollStartTime = Date.now();
//     // console.log("start", window.scrollY);
//     scrollY = window.scrollY;
//     // console.log("start scroll", scrollStartTime);
//   }
// });

// window.addEventListener("scrollend", (evt) => {
//   startedScroll = false;
//   let scrollEndTime = Date.now();
//   let scrollMs = scrollEndTime - scrollStartTime;
//   // console.log("end", window.scrollY);
//   let delta = window.scrollY - scrollY;
//   console.log(delta);
//   // window.scrollTo({ top: scrollY + delta / 2 });

//   // console.log("end scroll", scrollEndTime);
//   // console.log(`scrolled for ${scrollMs / 1000} seconds...`);
// });

// Set the scroll speed factor
let scrollSpeed = 0.5;

// window.scrollTo({
//   top: 1000,
//   behavior: "smooth",
// });

const progressBarContainer = document.createElement("div");

progressBarContainer.style =
  "position: absolute; top: 0; bottom: 0; right: 0; width: 12px; z-index: 9999; display: flex; flex-direction: column";

const spacer = document.createElement("div");

const progressBar = document.createElement("div");
progressBar.style = "width: 100%; background-color: red;";

progressBarContainer.appendChild(spacer);
progressBarContainer.appendChild(progressBar);

document.body.appendChild(progressBarContainer);

document.body.addEventListener(
  "wheel",
  (event) => {
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
    // if (
    //   videos.find(
    //     (v) =>
    //       v.hasAttribute("is-active") &&
    //       v.querySelector("#shorts-container video[tabindex='-1']")
    //   ) === undefined
    // ) {
    //   console.log("here");
    //   return;
    // }

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
  },
  {
    passive: false,
  }
);
