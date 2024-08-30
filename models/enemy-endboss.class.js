"use strict";

class Endboss extends MovableObject {
  IMAGES_ALERT = [
    "./img/4_enemie_boss_chicken/2_alert/G5.png",
    "./img/4_enemie_boss_chicken/2_alert/G6.png",
    "./img/4_enemie_boss_chicken/2_alert/G7.png",
    "./img/4_enemie_boss_chicken/2_alert/G8.png",
    "./img/4_enemie_boss_chicken/2_alert/G9.png",
    "./img/4_enemie_boss_chicken/2_alert/G10.png",
    "./img/4_enemie_boss_chicken/2_alert/G11.png",
    "./img/4_enemie_boss_chicken/2_alert/G12.png",
  ];

  IMAGES_WALKING = [
    "./img/4_enemie_boss_chicken/1_walk/G1.png",
    "./img/4_enemie_boss_chicken/1_walk/G2.png",
    "./img/4_enemie_boss_chicken/1_walk/G3.png",
    "./img/4_enemie_boss_chicken/1_walk/G4.png",
  ];

  IMAGES_HURT = [
    "./img/4_enemie_boss_chicken/4_hurt/G21.png",
    "./img/4_enemie_boss_chicken/4_hurt/G22.png",
    "./img/4_enemie_boss_chicken/4_hurt/G23.png",
  ];

  IMAGES_DEAD = [
    "./img/4_enemie_boss_chicken/5_dead/G24.png",
    "./img/4_enemie_boss_chicken/5_dead/G25.png",
    "./img/4_enemie_boss_chicken/5_dead/G26.png",
  ];

  IMAGES_ATTACK = [
    "./img/4_enemie_boss_chicken/3_attack/G13.png",
    "./img/4_enemie_boss_chicken/3_attack/G14.png",
    "./img/4_enemie_boss_chicken/3_attack/G15.png",
    "./img/4_enemie_boss_chicken/3_attack/G16.png",
    "./img/4_enemie_boss_chicken/3_attack/G17.png",
    "./img/4_enemie_boss_chicken/3_attack/G18.png",
    "./img/4_enemie_boss_chicken/3_attack/G19.png",
    "./img/4_enemie_boss_chicken/3_attack/G20.png",
  ];

  offset = {
    top: 60,
    bottom: 0,
    left: 50,
    right: 20,
  };

  height = 400;
  width = 300;
  y = 50;
  speed = 3;
  hits = 0;
  isBossWalking = false;
  isBossAlert = false;
  isBossHurt = false;
  isBossAttack = false;
  isBossDead = false;
  attackSpeedMultiplier = 8;

  constructor() {
    super().loadImage(this.IMAGES_WALKING[0]);
    this.images = {};
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_ATTACK);
    this.loadImages(this.IMAGES_ALERT);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.x = 1500;
    this.animate();
    this.checkDistanceToCharacter();
  }

  // loadImages(imagePaths) {
  //   // Stellt sicher, dass Bilder geladen werden und im Array gespeichert werden
  //   imagePaths.forEach((path) => {
  //     this.images[path] = Static.getImage(path);
  //   });
  // }

  /**
   * Laufen Animation ist OK.
   */
  animate() {
    this.animationInterval = setStoppableInterval(() => {
      if (this.isBossDead) {
        this.playAnimation(this.IMAGES_DEAD);
      } else if (this.isBossHurt) {
        this.playAnimation(this.IMAGES_HURT);
      } else if (this.isBossAttack) {
        this.playAnimation(this.IMAGES_ATTACK);
        this.moveTowardsCharacter();
      } else if (this.isBossAlert) {
        this.playAnimation(this.IMAGES_ALERT);
      } else {
        this.playAnimation(this.IMAGES_WALKING);
        this.moveLeft();
      }
    }, 200);
  }

  /**
   * Bewege den Boss-ATTACK auf den Charakter zu.
   * Hier der Multiplikator für speed.
   */
  moveTowardsCharacter() {
    let speed = this.isBossAttack
      ? this.speed * this.attackSpeedMultiplier
      : this.speed;
    this.x -= speed;
  }

  /**
   * 1. Abfrage für Boss sterben.
   * 2. Logik für Treffer an dem Gegner.
   */
  hit_Boss() {
    this.hits += 1;
    let newPercentage = Math.max(100 - this.hits * 20, 0);
    this.world.statusBarBoss.setPercentage(newPercentage);
    audioManager.playSound("bossHurting");

    if (this.hits >= 5) {
      this.die();
    } else {
      this.triggerCounterStrike();
    }
  }

  /**
   * Der Boss bleibt für 3 Sekunden im Angriffszustand
   * Boss ist verletzt für 1 Sekunden
   *
   */
  triggerCounterStrike() {
    this.world.audioManager.playSound("bossAttacking");
    if (!this.isBossAttack) {
      this.isBossHurt = true;
      this.isBossAttack = true;
      this.world.scheduleChickenSpawn(); // Zeitplan für stike-Chicken
      setTimeout(() => {
        this.isBossHurt = false;
        setTimeout(() => {
          this.world.audioManager.stopSound("bossAttacking");
          this.isBossAttack = false;
        }, 3000);
      }, 1000);
    }
  }

  /**
   * Tötungslogik für das Huhn.
   */
  die() {
    this.isBossDead = true;

    // clearInterval(this.animationInterval);

    setTimeout(() => {
      this.world.level.enemies = this.world.level.enemies.filter(
        (enemy) => enemy !== this
      );
    }, 700);

    setTimeout(() => {
      this.world.audioManager.playSound("gameWin");
      gameOver();
    }, 1000);
  }

  checkDistanceToCharacter() {
    setStoppableInterval(() => {
      if (this.isCloseTo(this.world.character, 250)) {
        if (!this.isBossAlert) {
          this.isBossAlert = true;
          // TODO: BOSS in Alarmbereitschaft Musik.
        }
      } else {
        this.isBossAlert = false;
      }
    }, 1000 / 10);
  }

  isCloseTo(character, distance) {
    return Math.abs(this.x - character.x) < distance;
  }
}
