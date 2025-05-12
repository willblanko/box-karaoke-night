
import { Song, PlayerState, Performance } from "@/lib/types";

export interface KaraokeContextData {
  queue: Song[];
  currentSong: Song | null;
  playerState: PlayerState;
  performance: Performance | null;
  searchInput: string;
  availableSongs: Song[];
  isLoading: boolean;
  isUSBConnected: boolean;
  pendingSong: Song | null;
  karaokeFolderPath: string;
  previousSongs: Song[];
  wasSkipped: boolean;
  
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  skipSong: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setSearchInput: (input: string) => void;
  searchSongByNumber: (number: string) => Song | undefined;
  setPlayerState: (state: PlayerState) => void;
  confirmAndPlaySong: () => void;
  cancelPendingSong: () => void;
  addPendingSongToQueue: () => void; // Added new function
  loadSongsFromUSB: () => Promise<void>;
  setWasSkipped: (value: boolean) => void;
}
