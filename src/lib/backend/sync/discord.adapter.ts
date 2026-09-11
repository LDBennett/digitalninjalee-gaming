import WebSocket from "ws";
import { Result, ok, err } from "@/src/lib/backend/shared/result";

export interface DiscordPresence {
  gameName: string | null;
}

const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";
// GUILDS (1 << 0) + GUILD_PRESENCES (1 << 8) — presence data requires the
// privileged Presence Intent enabled on the bot in the Discord developer portal.
const INTENTS = (1 << 0) | (1 << 8);
const OP_HELLO = 10;
const OP_IDENTIFY = 2;
const ACTIVITY_TYPE_PLAYING = 0;

interface GatewayPayload {
  op: number;
  t: string | null;
  d: {
    id?: string;
    guilds?: Array<{ id: string }>;
    presences?: Array<{
      user: { id: string };
      activities?: Array<
        Record<string, unknown> & { type: number; name: string }
      >;
    }>;
  };
}

/**
 * Reads the user's current Discord "Playing" activity via a one-shot gateway
 * connection: identify, wait for the guild's GUILD_CREATE (which includes
 * presences for online members in small guilds), extract the game, disconnect.
 * An offline user or one with no game open resolves to { gameName: null }.
 */
export function fetchDiscordPresence(
  botToken: string,
  userId: string,
  guildId?: string,
  timeoutMs = 8000,
): Promise<Result<DiscordPresence, Error>> {
  return new Promise((resolve) => {
    const socket = new WebSocket(GATEWAY_URL);
    let settled = false;
    let expectedGuilds = Infinity;
    let guildsSeen = 0;

    const settle = (result: Result<DiscordPresence, Error>) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        socket.close();
      } catch {
        // socket may already be closed
      }
      resolve(result);
    };

    const timer = setTimeout(
      () => settle(err(new Error("Discord gateway timed out"))),
      timeoutMs,
    );

    socket.on("error", (e) =>
      settle(err(e instanceof Error ? e : new Error(String(e)))),
    );

    socket.on("close", (code) => {
      // 4004 = authentication failed, 4014 = disallowed intents
      settle(err(new Error(`Discord gateway closed (code ${code})`)));
    });

    socket.on("message", (raw) => {
      let payload: GatewayPayload;
      try {
        payload = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (payload.op === OP_HELLO) {
        socket.send(
          JSON.stringify({
            op: OP_IDENTIFY,
            d: {
              token: botToken,
              intents: INTENTS,
              properties: {
                os: "linux",
                browser: "backlog-app",
                device: "backlog-app",
              },
            },
          }),
        );
        return;
      }

      if (payload.t === "READY") {
        expectedGuilds = payload.d.guilds?.length ?? 0;
        if (expectedGuilds === 0) {
          settle(err(new Error("Bot is not in any Discord server")));
        }
        return;
      }

      if (payload.t !== "GUILD_CREATE") return;
      guildsSeen += 1;

      if (!guildId || payload.d.id === guildId) {
        const presence = payload.d.presences?.find((p) => p.user.id === userId);
        if (presence) {
          const game = presence.activities?.find(
            (a) => a.type === ACTIVITY_TYPE_PLAYING,
          );
          // Temporary diagnostic: dump the raw activity to see whether Discord
          // exposes a platform hint (e.g. "platform": "xbox") for
          // console-linked Connections. Remove once confirmed either way.
          if (game && process.env.DEBUG_DISCORD_PRESENCE === "true") {
            console.log("[discord-activity-raw]", JSON.stringify(game));
          }
          settle(ok({ gameName: game?.name ?? null }));
          return;
        }
        // In the targeted guild but no presence entry -> user is offline.
        if (guildId) {
          settle(ok({ gameName: null }));
          return;
        }
      }

      // All guilds delivered without finding the user's presence -> offline.
      if (guildsSeen >= expectedGuilds) {
        settle(ok({ gameName: null }));
      }
    });
  });
}
