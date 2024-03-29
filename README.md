
<p align="center">
  <h1 align="center">
    <img src="https://github.com/maggie-j-liu/friction/assets/39828164/e0996d12-2cf0-4471-8d6d-f53ee6acdcc5" height="80px" /> <br />
    Use your energy to do work, don't just create <i>Friction</i>.
  </h1>
</p>

Find yourself on Instagram Reels all day? Can't escape the Twitter drug? We'll help you break that habit with a bit of social friction.

<img width="542" alt="Screenshot 2024-02-17 at 11 33 57 PM" src="https://github.com/maggie-j-liu/friction/assets/39828164/67544dd4-1f50-4b24-845a-f62e962251dc">

Here's how it works:

* Get all your friends together in a group.
  * You can set your group's timezone as well as a designated no-fricition rest period.
* Anytime someone scrolls on a website like Twitter or Instagram, the distance they scrolled is tracked.
* The more distance that the group scrolls, the more "friction" is added to everyone's trackpad.
  * This means over time, if people are doomscrolling a lot, it becomes harder & harder to scroll....
* And if you're addicted to Instagram Reels or YouTube Shorts, we'll also make them slower and blurrier (+ greyscale them!) over time.

That way you put your energy towards other things, not just creating friction.

## Behind-the-scenes

We've got a couple of things happening behind the scenes to make this happen:

* A PostgreSQL database being accessed / edited by a collection of Vercel Serverless Functions (via Prisma).
  * We're hosting this database on Vercel's Serverless Postgres.
* A Chrome extension built using React
  * This Chrome extension hijacks the `wheel` and `onScroll` events to produce the friction effect
 
Built at [TreeHacks 2024](https://www.treehacks.com/) by [@janetguo](https://github.com/janetguo), [@sampoder](https://github.com/sampoder), and [@maggie-j-liu](https://github.com/maggie-j-liu)

Here's our mascot MITtens and our project!

![IMG_5692](https://github.com/maggie-j-liu/friction/assets/39828164/90a2c7a5-b699-4868-8fc2-7c1891204f71)

And a team photo!

![IMG_5694](https://github.com/maggie-j-liu/friction/assets/39828164/caf6ce41-2703-4b67-a8ea-ce184aa2d806)


