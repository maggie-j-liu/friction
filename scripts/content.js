console.log("Content script yayy!");

let scrollStartTime;
let startedScroll = false;
let scrollY = 0;

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

document.body.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    let target = window.scrollY + event.deltaY * 1;
    scrollY += event.deltaY * 0.2;
    console.log(scrollY);
    if (scrollY > 1000 || scrollY < -1000) {
      let scrollDir = scrollY > 0 ? 1 : -1;
      scrollY = 0;
      console.log("here");
      const videos = [...document.querySelectorAll(".reel-video-in-sequence")];
      const currentParent = videos.find(
        (v) =>
          v.hasAttribute("is-active") &&
          v.querySelector("#shorts-container video[tabindex='-1']")
      );
      console.log("parent", currentParent);
      const currentVid = currentParent.querySelector("video");
      console.log(currentVid);
      console.log(currentVid.id);
      const nextVid = document.getElementById(
        Number(currentParent.id) + scrollDir
      );
      nextVid.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  },
  {
    passive: false,
  }
);
