import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
export function createGame(): Phaser.Game {
  return new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#060c1b', scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, render: { antialias: true, roundPixels: false }, scene: [BootScene, GameScene], audio: { noAudio: true }, banner: false });
}
