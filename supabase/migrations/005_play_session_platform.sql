-- Optional per-session platform, captured only where it's actually known
-- (manual "+Log" entries). Auto-detected sessions (Discord/Steam) leave this
-- NULL rather than guessing — Discord's presence payload gives no reliable
-- platform signal today, and inferring from the matched library game breaks
-- down for a title owned on more than one platform (e.g. cross-play games).

ALTER TABLE play_sessions
ADD COLUMN platform platform_type;
