import { H as Hls } from "./video-player-dru42stk.js";
window.Hls = window.Hls || Hls;
window.dispatchEvent(new Event("hls-ready"));
