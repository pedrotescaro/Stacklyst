import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { SoundEffectsController, type ActivitySound } from './sounds-engine';

// These are the same branded assets shipped by the website, bundled for offline playback.
const sources: Record<ActivitySound, number> = {
  quiz_correct: require('../../assets/sounds/RightAnswer_Sound.mp3'),
  quiz_incorrect: require('../../assets/sounds/WrongAnswer_Sound.mp3'),
  lesson_completed: require('../../assets/sounds/LessonComplete_Sound.mp3'),
  levelup: require('../../assets/sounds/LevelUp_Sound.mp3'),
  xpgain: require('../../assets/sounds/XpGain_Sound.mp3'),
};

const Context = createContext<SoundEffectsController | null>(null);
export function SoundEffectsProvider({ children }: { children: ReactNode }) {
  const [controller] = useState(
    () =>
      new SoundEffectsController({
        storage: AsyncStorage,
        prepare: () =>
          setAudioModeAsync({
            playsInSilentMode: false,
            allowsRecording: false,
            shouldPlayInBackground: false,
            interruptionMode: 'mixWithOthers',
          }),
        createPlayer: (sound) => createAudioPlayer(sources[sound]),
      })
  );
  useEffect(() => {
    void controller.restore();
    controller.setForeground(AppState.currentState === 'active');
    const listener = AppState.addEventListener('change', (state) =>
      controller.setForeground(state === 'active')
    );
    return () => {
      listener.remove();
      controller.setForeground(false);
    };
  }, [controller]);
  return <Context.Provider value={controller}>{children}</Context.Provider>;
}

export function useSoundEffects() {
  const controller = useContext(Context);
  if (!controller) throw new Error('SoundEffectsProvider is required.');
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot
  );
  return useMemo(
    () => ({
      ...snapshot,
      setEnabled: controller.setEnabled,
      playSound: controller.playSound,
      playSequence: controller.playSequence,
      stopSounds: controller.stop,
    }),
    [controller, snapshot]
  );
}
