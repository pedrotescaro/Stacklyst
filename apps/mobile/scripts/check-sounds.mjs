import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const directory = await mkdtemp(join(tmpdir(), 'stacklyst-sounds-'));
const output = join(directory, 'sounds.cjs');
let controller;
try {
  await build({
    entryPoints: [fileURLToPath(new URL('../src/lib/sounds-engine.ts', import.meta.url))],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: output,
    logLevel: 'silent',
  });
  const { SoundEffectsController, confirmedActivitySounds, SOUND_PREFERENCE_KEY } = require(output);
  const stored = new Map();
  const players = [];
  let failPlayback = false;
  const runtime = {
    storage: {
      getItem: async (key) => stored.get(key) ?? null,
      setItem: async (key, value) => {
        stored.set(key, value);
      },
    },
    prepare: async () => {},
    createPlayer: (sound) => {
      let callback;
      const player = {
        sound,
        volume: 1,
        playing: false,
        removed: false,
        listenerRemoved: false,
        addListener: (event, listener) => {
          assert.equal(event, 'playbackStatusUpdate');
          callback = listener;
          return {
            remove: () => {
              player.listenerRemoved = true;
            },
          };
        },
        play: () => {
          assert.ok(
            !players.some((item) => item !== player && item.playing),
            'Sounds must never overlap'
          );
          if (failPlayback) throw new Error('Native player unavailable');
          player.playing = true;
        },
        pause: () => {
          player.playing = false;
        },
        remove: () => {
          player.removed = true;
        },
        finish: () => callback({ didJustFinish: true }),
      };
      players.push(player);
      return player;
    },
  };
  const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  };
  controller = new SoundEffectsController(runtime);
  controller.playSound('quiz_correct', 'before-ready');
  await flush();
  assert.equal(players.length, 0, 'Preferences load before the first sound');
  await controller.restore();
  assert.deepEqual(controller.getSnapshot(), {
    enabled: true,
    ready: true,
    preferenceError: false,
  });

  assert.deepEqual(confirmedActivitySounds({ isCorrect: false }, 'submit'), ['quiz_incorrect']);
  assert.deepEqual(confirmedActivitySounds({ isCorrect: true, xpEarned: 10 }, 'submit'), [
    'quiz_correct',
    'xpgain',
  ]);
  assert.deepEqual(
    confirmedActivitySounds(
      { isCorrect: true, xpEarned: 10, xpResult: { newXp: 505, newLevel: 2 } },
      'submit'
    ),
    ['quiz_correct', 'levelup']
  );
  assert.deepEqual(
    confirmedActivitySounds({ passed: true, xpEarned: 10, totalXp: 805 }, 'submit'),
    ['quiz_correct', 'levelup']
  );
  assert.deepEqual(confirmedActivitySounds({ isCorrect: true }, 'run'), []);
  assert.deepEqual(confirmedActivitySounds({ isCorrect: false }, 'submit', true), [
    'quiz_incorrect',
  ]);
  assert.deepEqual(confirmedActivitySounds({ isCorrect: true, firstCompletion: false }, 'submit'), [
    'quiz_correct',
  ]);
  assert.deepEqual(confirmedActivitySounds({ error: 'Runner unavailable' }, 'submit'), []);

  controller.playSequence(['quiz_correct', 'xpgain', 'lesson_completed'], 'confirmed-1');
  await flush();
  assert.equal(players[0].sound, 'quiz_correct');
  assert.equal(players[0].volume, 0.35);
  controller.playSequence(['quiz_correct', 'xpgain'], 'confirmed-1');
  await flush();
  assert.equal(players.length, 1, 'Duplicate events must not restart the cue');
  players[0].finish();
  assert.equal(players[1].sound, 'xpgain');
  assert.ok(players[0].removed && players[0].listenerRemoved);
  players[1].finish();
  assert.equal(players[2].sound, 'lesson_completed');
  players[2].finish();
  assert.ok(players.every((player) => player.removed && !player.playing));

  controller.playSound('quiz_incorrect', 'wrong');
  await flush();
  const last = players.at(-1);
  assert.equal(last.sound, 'quiz_incorrect');
  controller.setEnabled(false);
  await flush();
  assert.ok(last.removed && !last.playing, 'Disabling stops and frees the current sound');
  assert.equal(stored.get(SOUND_PREFERENCE_KEY), 'false');
  const count = players.length;
  controller.playSound('quiz_correct', 'muted');
  await flush();
  assert.equal(players.length, count);
  const restored = new SoundEffectsController(runtime);
  await restored.restore();
  assert.equal(restored.getSnapshot().enabled, false, 'Preference survives a new app session');
  restored.setEnabled(true);
  await flush();
  assert.equal(stored.get(SOUND_PREFERENCE_KEY), 'true');
  restored.stop();

  controller.setEnabled(true);
  controller.playSequence(['quiz_correct', 'xpgain'], 'background');
  await flush();
  const backgroundPlayer = players.at(-1);
  controller.setForeground(false);
  assert.ok(backgroundPlayer.removed && !backgroundPlayer.playing);
  backgroundPlayer.finish();
  controller.playSound('lesson_completed', 'background-submit');
  await flush();
  assert.equal(players.at(-1), backgroundPlayer, 'Background cannot start or resume a sound');
  controller.setForeground(true);
  await flush();
  assert.equal(players.at(-1), backgroundPlayer);
  controller.playSound('quiz_correct', 'new-foreground-event');
  controller.stop();
  await flush();
  assert.equal(
    players.at(-1),
    backgroundPlayer,
    'Unmount/stop cancels pending playback preparation'
  );
  failPlayback = true;
  controller.playSound('quiz_correct', 'native-error');
  await flush();
  assert.ok(players.at(-1).removed, 'Native playback errors release resources without escaping');
  controller.stop();

  for (const file of [
    'RightAnswer_Sound.mp3',
    'WrongAnswer_Sound.mp3',
    'LessonComplete_Sound.mp3',
    'LevelUp_Sound.mp3',
    'XpGain_Sound.mp3',
  ]) {
    const local = await readFile(new URL('../assets/sounds/' + file, import.meta.url));
    const web = await readFile(new URL('../../../public/sounds/' + file, import.meta.url));
    assert.ok(local.length > 0);
    assert.deepEqual(local, web, 'APK sound differs from website asset: ' + file);
  }
  console.log(
    'Sounds passed: server-confirmed correct/incorrect/XP/level cues, review without reward celebration, silent test runs, sequential playback, duplicate prevention, durable enable/disable, background/unmount cleanup, native failure isolation, and five identical bundled web assets. Stub players do not prove audible playback on Android.'
  );
} finally {
  controller?.stop();
  await rm(directory, { recursive: true, force: true });
}
