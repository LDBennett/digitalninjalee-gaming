export type { RawgGame, RawgGameData } from "./rawg.adapter";
export {
  mapRawgToMoods,
  fetchRawgGameData,
  createRawgClient,
  searchRawgGames,
} from "./rawg.adapter";
export type { DiscordPresence } from "./discord.adapter";
export { fetchDiscordPresence } from "./discord.adapter";
export type { IgdbSearchResult, IgdbGameData } from "./igdb.adapter";
export {
  mapIgdbToMoods,
  searchIgdbGames,
  fetchIgdbGameData,
  fetchIgdbGameDataByTitle,
  createIgdbClient,
} from "./igdb.adapter";
