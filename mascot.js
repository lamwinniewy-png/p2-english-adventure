/* Susu (red dress) and Neko — realistic reborn doll characters */
'use strict';
const doll = (n, cls = '') => `<img class="doll ${cls}" src="img/${n}.webp" alt="" draggable="false">`;
const MASCOT = {
  happy: doll('neko-happy'),
  wink: doll('susu-cheer'),
  sad: doll('neko-soft'),
  star: doll('susu-cheer'),
  think: doll('susu-think'),
  cloud: '',
};
