"use strict";

let openMenuBtn, menuPopRef, mobileControlHubRef;

/**
 * Show or hide menu.
 */
document.addEventListener("DOMContentLoaded", function () {
  openMenuBtn = document.getElementById("openMenuBtn");
  menuPopRef = document.getElementById("menuPop");
  mobileControlHubRef = document.getElementById("mobileControlHub");
  openMenuBtn.addEventListener("click", openMenu);
  alsoClickOutside(menuPopRef, openMenuBtn, closeMenu);
});

function openMenu() {
  if (isGameRunning) {
    pauseAllIntervals();
    pauseAllTimeouts();
    audioManager.stopSound("inGameMusic");
    isGameRunning = false;
  }

  menuPopRef.style.display = "flex";
  mobileControlHubRef.style.display = "none";
  audioManager.playSound("inHomeMusic");
}

function closeMenu() {
  const w3IncludeRef = document.getElementById("w3_include");
  w3IncludeRef.style.display = "none";

  menuPopRef.style.display = "none";
  if (!isGameRunning && gameStartetOnce) {
    resumeAllIntervals();
    resumeAllTimeouts();
    audioManager.stopSound("inHomeMusic");
    audioManager.playSound("inGameMusic");
    isGameRunning = true;
  } else if (isGameRunning && w3_includeRef) {
    w3_includeRef.style.display = "none";
  }
  startGame();
}

/**
 * Close menu when clicked outside.
 */
function alsoClickOutside(menuPopRef, openMenuBtn, closeMenu) {
  function userClicksOutsideOfPopup(event) {
    return !menuPopRef.contains(event.target) && event.target !== openMenuBtn;
  }

  document.addEventListener("click", function (event) {
    if (
      menuPopRef.style.display === "flex" &&
      userClicksOutsideOfPopup(event)
    ) {
      returnToHome();
    }
  });
}

/**
 * Toggle full screen mode.
 */
function toggleFullscreen(event) {
  event.preventDefault();

  if (gameOver) {
    resetCanvas();
  }

  const mainLayer = document.getElementById("mainLayerAsRelative");
  if (!document.fullscreenElement) {
    enterFullscreen(mainLayer);
  } else {
    exitFullscreen();
  }
}

function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }

  document.getElementById("menuPop").style.display = "none";
  adjustDisplayBasedOnWidthAndOrientation();
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  
  document.getElementById("menuPop").style.display = "none";
  adjustDisplayBasedOnWidthAndOrientation();

  if (!isGameRunning) {
    document
      .getElementById("mobileControlHub")
      .style.setProperty("display", "none", "important");
  }

}

/**
 * Triggert den Vollbildmodus an sich; damit auch die Taste F11 fokussiert wird.
 * Triggers the full screen mode itself; so that the F11 key is also focused.
 */
document.addEventListener("fullscreenchange", () => {
  adjustDisplayBasedOnWidthAndOrientation();
  if (!document.fullscreenElement) {
    resetCanvas();
  }
  resumeAllIntervals();
  resumeAllTimeouts();
});

/**
 * Checks if the current device is in landscape orientation.
 * @returns {boolean} - True if the device is in landscape orientation, otherwise False.
 */
function isLandscapeOrientation() {
  return window.matchMedia("(orientation: landscape)").matches;
}

/**
 * Returns the current width of the browser window.
 * @returns {number} - The width of the window in pixels.
 */
function getScreenWidth() {
  return window.innerWidth;
}

/**
 * Adjusts the display elements based on the width and orientation of the device.
 */
function adjustDisplayBasedOnWidthAndOrientation() {
  const rotateLayerRef = document.getElementById("rotateLayer");
  const mobileControlHubRef = document.getElementById("mobileControlHub");
  const width = getScreenWidth();
  const isLandscape = isLandscapeOrientation();

  if (isLandscape) {
    handleLandscapeMode(width, rotateLayerRef, mobileControlHubRef);
  } else {
    handlePortraitMode(width, rotateLayerRef, mobileControlHubRef);
  }
}

/**
 * Handles display elements in landscape mode.
 */
// function handleLandscapeMode(width, rotateLayerRef, mobileControlHubRef) {
//   if (width <= 667 || (width >= 668 && width <= 1080)) {
//     rotateLayerRef.style.display = "none";
//     mobileControlHubRef.style.display = gameStartetOnce ? "flex" : "none";
//   } else {
//     rotateLayerRef.style.display = "none";
//     mobileControlHubRef.style.display = "none";
//   }
//   // if (ist ein Tablet. Das heisst eine auflösung von max 1366px in der Breite) {
//   //   rotateLayerRef.style.display = "none";
//   //   mobileControlHubRef.style.display = "none";
//   // }
// }

/**
 * Handles display elements in landscape mode.
 */
function handleLandscapeMode(width, rotateLayerRef, mobileControlHubRef) {
  if (width <= 667 || (width >= 668 && width <= 1080)) {
    rotateLayerRef.style.display = "none";
    mobileControlHubRef.style.display = gameStartetOnce ? "flex" : "none";
  } else if (width <= 1368) {
    rotateLayerRef.style.display = "none";
    mobileControlHubRef.style.display = "flex";
  } else {
    rotateLayerRef.style.display = "none";
    mobileControlHubRef.style.display = "none";
  }
}

/**
 * Handles display elements in portrait mode.
 */
function handlePortraitMode(width, rotateLayerRef, mobileControlHubRef) {
  if (width >= 667) {
    rotateLayerRef.style.display = "none";
    mobileControlHubRef.style.display = "none";
  } else {
    rotateLayerRef.style.display = "flex";
    mobileControlHubRef.style.display = "none";
  }
}

/**
 * Adds event listeners that adjust the display when the window is resized
 * or when the document is loaded.
 */
window.addEventListener("resize", () =>
  adjustDisplayBasedOnWidthAndOrientation()
);
document.addEventListener("DOMContentLoaded", () =>
  adjustDisplayBasedOnWidthAndOrientation()
);

/**
 * Preload Data
 */
async function prepareTheGamingExperience() {
  await loadingSpinnerStart();
  await preloadAssets();
  loadingSpinnerEnd();
}

async function loadingSpinnerStart() {
  adjustDisplayBasedOnWidthAndOrientation();
  const loadingSpinnerLayerRef = document.getElementById("loadingSpinnerLayer");
  loadingSpinnerLayerRef.style.display = "flex";
}

function loadingSpinnerEnd() {
  const loadingSpinnerLayerRef = document.getElementById("loadingSpinnerLayer");
  loadingSpinnerLayerRef.style.display = "none";
}

/**
 * Define the resources to preload.
 * Preload images, audio and fonts.
 * Wait until all resources are preloaded.
 */
async function preloadAssets() {
  const imagesToLoad = [
    "./img/2_character_pepe/1_idle/idle/I-1.png",
    "./img/2_character_pepe/1_idle/idle/I-2.png",
    "./img/2_character_pepe/1_idle/idle/I-3.png",
    "./img/2_character_pepe/1_idle/idle/I-4.png",
    "./img/2_character_pepe/1_idle/idle/I-5.png",
    "./img/2_character_pepe/1_idle/idle/I-6.png",
    "./img/2_character_pepe/1_idle/idle/I-7.png",
    "./img/2_character_pepe/1_idle/idle/I-8.png",
    "./img/2_character_pepe/1_idle/idle/I-9.png",
    "./img/2_character_pepe/1_idle/idle/I-10.png",
    "./img/2_character_pepe/1_idle/long_idle/I-11.png",
    "./img/2_character_pepe/1_idle/long_idle/I-12.png",
    "./img/2_character_pepe/1_idle/long_idle/I-13.png",
    "./img/2_character_pepe/1_idle/long_idle/I-14.png",
    "./img/2_character_pepe/1_idle/long_idle/I-15.png",
    "./img/2_character_pepe/1_idle/long_idle/I-16.png",
    "./img/2_character_pepe/1_idle/long_idle/I-17.png",
    "./img/2_character_pepe/1_idle/long_idle/I-18.png",
    "./img/2_character_pepe/1_idle/long_idle/I-19.png",
    "./img/2_character_pepe/1_idle/long_idle/I-20.png",
    "./img/2_character_pepe/2_walk/W-21.png",
    "./img/2_character_pepe/2_walk/W-22.png",
    "./img/2_character_pepe/2_walk/W-23.png",
    "./img/2_character_pepe/2_walk/W-24.png",
    "./img/2_character_pepe/2_walk/W-25.png",
    "./img/2_character_pepe/2_walk/W-26.png",
    "./img/2_character_pepe/3_jump/J-31.png",
    "./img/2_character_pepe/3_jump/J-32.png",
    "./img/2_character_pepe/3_jump/J-33.png",
    "./img/2_character_pepe/3_jump/J-34.png",
    "./img/2_character_pepe/3_jump/J-35.png",
    "./img/2_character_pepe/3_jump/J-36.png",
    "./img/2_character_pepe/3_jump/J-37.png",
    "./img/2_character_pepe/3_jump/J-38.png",
    "./img/2_character_pepe/3_jump/J-39.png",
    "./img/2_character_pepe/4_hurt/H-41.png",
    "./img/2_character_pepe/4_hurt/H-42.png",
    "./img/2_character_pepe/4_hurt/H-43.png",
    "./img/2_character_pepe/5_dead/D-51.png",
    "./img/2_character_pepe/5_dead/D-52.png",
    "./img/2_character_pepe/5_dead/D-53.png",
    "./img/2_character_pepe/5_dead/D-54.png",
    "./img/2_character_pepe/5_dead/D-55.png",
    "./img/2_character_pepe/5_dead/D-56.png",
    "./img/2_character_pepe/5_dead/D-57.png",
    "./img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
    "./img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
    "./img/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
    "./img/3_enemies_chicken/chicken_normal/2_dead/dead.png",
    "./img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
    "./img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
    "./img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
    "./img/3_enemies_chicken/chicken_small/2_dead/dead.png",
    "./img/4_enemie_boss_chicken/1_walk/G1.png",
    "./img/4_enemie_boss_chicken/1_walk/G2.png",
    "./img/4_enemie_boss_chicken/1_walk/G3.png",
    "./img/4_enemie_boss_chicken/1_walk/G4.png",
    "./img/4_enemie_boss_chicken/2_alert/G5.png",
    "./img/4_enemie_boss_chicken/2_alert/G6.png",
    "./img/4_enemie_boss_chicken/2_alert/G7.png",
    "./img/4_enemie_boss_chicken/2_alert/G8.png",
    "./img/4_enemie_boss_chicken/2_alert/G9.png",
    "./img/4_enemie_boss_chicken/2_alert/G10.png",
    "./img/4_enemie_boss_chicken/2_alert/G11.png",
    "./img/4_enemie_boss_chicken/2_alert/G12.png",
    "./img/4_enemie_boss_chicken/3_attack/G13.png",
    "./img/4_enemie_boss_chicken/3_attack/G14.png",
    "./img/4_enemie_boss_chicken/3_attack/G15.png",
    "./img/4_enemie_boss_chicken/3_attack/G16.png",
    "./img/4_enemie_boss_chicken/3_attack/G17.png",
    "./img/4_enemie_boss_chicken/3_attack/G18.png",
    "./img/4_enemie_boss_chicken/3_attack/G19.png",
    "./img/4_enemie_boss_chicken/3_attack/G20.png",
    "./img/4_enemie_boss_chicken/4_hurt/G21.png",
    "./img/4_enemie_boss_chicken/4_hurt/G22.png",
    "./img/4_enemie_boss_chicken/4_hurt/G23.png",
    "./img/4_enemie_boss_chicken/5_dead/G24.png",
    "./img/4_enemie_boss_chicken/5_dead/G25.png",
    "./img/4_enemie_boss_chicken/5_dead/G26.png",
    "./img/5_background/layers/1_first_layer/1.png",
    "./img/5_background/layers/1_first_layer/2.png",
    "./img/5_background/layers/2_second_layer/1.png",
    "./img/5_background/layers/2_second_layer/2.png",
    "./img/5_background/layers/3_third_layer/1.png",
    "./img/5_background/layers/3_third_layer/2.png",
    "./img/5_background/layers/4_clouds/1.png",
    "./img/5_background/layers/4_clouds/2.png",
    "./img/5_background/layers/air.png",
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
    "./img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
    "./img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
    "./img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
    "./img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
    "./img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
    "./img/6_salsa_bottle/2_salsa_bottle_on_ground.png",
    "./img/6_salsa_bottle/salsa_bottle.png",
    "./img/7_statusbars/1_statusbar/1_statusbar_coin/blue/0.png",
    "./img/7_statusbars/1_statusbar/1_statusbar_coin/blue/20.png",
    "./img/7_statusbars/1_statusbar/1_statusbar_coin/blue/40.png",
    "./img/7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png",
    "./img/7_statusbars/1_statusbar/1_statusbar_coin/blue/80.png",
    "./img/7_statusbars/1_statusbar/1_statusbar_coin/blue/100.png",
    "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png",
    "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png",
    "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png",
    "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png",
    "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png",
    "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png",
    "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png",
    "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png",
    "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png",
    "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png",
    "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png",
    "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png",
    "./img/7_statusbars/2_statusbar_endboss/orange/orange0.png",
    "./img/7_statusbars/2_statusbar_endboss/orange/orange20.png",
    "./img/7_statusbars/2_statusbar_endboss/orange/orange40.png",
    "./img/7_statusbars/2_statusbar_endboss/orange/orange60.png",
    "./img/7_statusbars/2_statusbar_endboss/orange/orange80.png",
    "./img/7_statusbars/2_statusbar_endboss/orange/orange100.png",
    "./img/7_statusbars/3_icons/icon_coin.png",
    "./img/7_statusbars/3_icons/icon_health_endboss.png",
    "./img/7_statusbars/3_icons/icon_health.png",
    "./img/7_statusbars/3_icons/icon_salsa_bottle.png",
    "./img/8_coin/coin_1.png",
    "./img/8_coin/coin_2.png",
    "./img/9_intro_outro_screens/game_over/youWin.png",
    "./img/9_intro_outro_screens/game_over/youLose.png",
    "./img/9_intro_outro_screens/start/startscreen_1.png",
    "./img/9_intro_outro_screens/start/startscreen_2.png",
    "./img/desert.png",
    "./img/desertBackground.jpg",
    "./img/konstantin.png",
  ];

  const audioToLoad = [
    "./audio/homeMenuSound01.mp3",
    "./audio/homeMenuSound02.mp3",
    "./audio/inGameSound01.mp3",
    "./audio/chickenDeath01.mp3",
    "./audio/bossHurting01.mp3",
    "./audio/bossAttacking01.mp3",
    "./audio/coin01.mp3",
    "./audio/coin02.mp3",
    "./audio/coin03.mp3",
    "./audio/coin04.mp3",
    "./audio/deathPepe01.mp3",
    "./audio/hurt01.mp3",
    "./audio/hurt02.mp3",
    "./audio/hurt03.mp3",
    "./audio/hurt04.mp3",
    "./audio/hurt05.mp3",
    "./audio/jump01.mp3",
    "./audio/jump02.mp3",
    "./audio/jump03.mp3",
    "./audio/jump04.mp3",
    "./audio/snore01.mp3",
    "./audio/snore02.mp3",
    "./audio/snore03.mp3",
    "./audio/snore04.mp3",
    "./audio/steps01.mp3",
    "./audio/steps02.mp3",
    "./audio/pickSalsa01.mp3",
    "./audio/pickSalsa02.mp3",
    "./audio/splash01.mp3",
    "./audio/splash02.mp3",
    "./audio/splash03.mp3",
    "./audio/splash04.mp3",
    "./audio/throw01.mp3",
    "./audio/throw02.mp3",
    "./audio/win.mp3",
    "./audio/loose.mp3",
  ];

  const fontsToLoad = [
    new FontFace("MyFont1", "url(./fonts/creepster-v13-latin-regular.woff2)"),
    new FontFace("MyFont2", "url(./fonts/frijole-v14-latin-regular.woff2)"),
    new FontFace("MyFont3", "url(./fonts/sancreek-v25-latin-regular.woff2)"),
    new FontFace("MyFont3", "url(./fonts/lexend-v19-latin-100.woff2)"),
    new FontFace("MyFont3", "url(./fonts/lexend-v19-latin-200.woff2)"),
    new FontFace("MyFont3", "url(./fonts/lexend-v19-latin-300.woff2)"),
    new FontFace("MyFont3", "url(./fonts/lexend-v19-latin-500.woff2)"),
    new FontFace("MyFont3", "url(./fonts/lexend-v19-latin-600.woff2)"),
    new FontFace("MyFont3", "url(./fonts/lexend-v19-latin-700.woff2)"),
    new FontFace("MyFont3", "url(./fonts/lexend-v19-latin-800.woff2)"),
    new FontFace("MyFont3", "url(./fonts/lexend-v19-latin-900.woff2)"),
  ];

  Static.preloadImages(imagesToLoad);
  Static.preloadAudio(audioToLoad);
  Static.preloadFonts(fontsToLoad);

  try {
    await preloadImages(imagesToLoad);
    await preloadAudio(audioToLoad);
    await preloadFonts(fontsToLoad);

    // console.log("Alle Assets wurden erfolgreich vorgeladen.");
  } catch (error) {
    // console.error("Fehler beim Vorladen von Assets:", error);
  }
}

/**
 * Preload images and treat them as promises.
 */
function preloadImages(paths) {
  return Promise.all(
    paths.map((path) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
          Static.imageCache[path] = img;
          resolve(img);
        };
        img.onerror = reject;
      });
    })
  );
}

/**
 * Preload audio files and treat them as promises.
 */
function preloadAudio(paths) {
  return Promise.all(
    paths.map((path) => {
      return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.src = path;
        audio.oncanplaythrough = () => {
          Static.audioCache[path] = audio;
          resolve(audio);
        };
        audio.onerror = reject;
      });
    })
  );
}

/**
 * Preload fonts and treat them as promises.
 */
function preloadFonts(fonts) {
  return Promise.all(
    fonts.map((font) => {
      return font.load().then((loadedFont) => {
        Static.fontCache[font.family] = loadedFont;
        document.fonts.add(loadedFont);
      });
    })
  );
}
