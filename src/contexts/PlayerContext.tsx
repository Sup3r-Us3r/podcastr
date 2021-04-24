import { useState, useContext, createContext, ReactNode } from 'react';

type WithChildren<T = {}> =
  T & { children: ReactNode };

type IEpisode = {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
};

type IPlayerContextData = {
  episodeList: IEpisode[];
  currentEpisodeIndex: number;
  isPlaying: boolean;
  play: (episode: IEpisode) => void;
  playList: (list: IEpisode[], index: number) => void;
  togglePlay: () => void;
  toggleLoop: () => void;
  toggleShuffling: () => void;
  isLooping: boolean;
  isShuffling: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  playNext: () => void;
  playPrevious: () => void;
  setPlayingState: (state: boolean) => void;
  clearPlayerState: () => void;
};

export const PlayerContext = createContext({} as IPlayerContextData);

const PlayerProvider = ({ children }: WithChildren) => {
  const [episodeList, setEpisodeList] = useState<IEpisode[]>([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  function play(episode: IEpisode) {
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
    setIsPlaying(true);
  }

  function playList(list: IEpisode[], index: number) {
    setEpisodeList(list);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
  }

  function togglePlay() {
    setIsPlaying((prevState) => !prevState);
  }

  function toggleLoop() {
    setIsLooping((prevState) => !prevState);
  }

  function toggleShuffling() {
    setIsShuffling((prevState) => !prevState);
  }

  function setPlayingState(state: boolean) {
    setIsPlaying(state);
  }

  function clearPlayerState() {
    setEpisodeList([]);
    setCurrentEpisodeIndex(0);
  }

  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length;

  function playNext() {
    const nextEpisodeIndex = currentEpisodeIndex + 1;

    if (isShuffling) {
      const nextRandomEpisodeIndex = Math.floor(
        Math.random() * episodeList.length
      );

      setCurrentEpisodeIndex(nextRandomEpisodeIndex);
    } else if (hasNext) {
      setCurrentEpisodeIndex(nextEpisodeIndex);
    }
  }

  function playPrevious() {
    if (hasPrevious) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    }
  }

  return (
    <PlayerContext.Provider value={{
      episodeList,
      currentEpisodeIndex,
      isPlaying,
      playList,
      play,
      togglePlay,
      toggleLoop,
      toggleShuffling,
      isLooping,
      isShuffling,
      hasNext,
      hasPrevious,
      playNext,
      playPrevious,
      setPlayingState,
      clearPlayerState,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;

export const usePlayer = () => {
  return useContext(PlayerContext);
}
