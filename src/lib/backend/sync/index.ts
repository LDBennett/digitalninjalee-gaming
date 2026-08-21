export type { RawgGame, RawgGameData } from "./rawg.adapter";
export {
  fetchRawgGameData,
  createRawgClient,
  searchRawgGames,
} from "./rawg.adapter";
export type { DiscordPresence } from "./discord.adapter";
export { fetchDiscordPresence } from "./discord.adapter";
export type { SteamPresence } from "./steam.adapter";
export { fetchSteamPresence } from "./steam.adapter";
export type { IgdbSearchResult, IgdbGameData } from "./igdb.adapter";
export {
  searchIgdbGames,
  fetchIgdbGameData,
  fetchIgdbGameDataByTitle,
  createIgdbClient,
} from "./igdb.adapter";
