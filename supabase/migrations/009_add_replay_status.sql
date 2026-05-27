ALTER TABLE games
  ADD COLUMN replay_status TEXT
    CHECK (replay_status IN ('want-to-replay', 'replaying'));

UPDATE games
  SET replay_status = 'want-to-replay'
  WHERE replay = TRUE;

ALTER TABLE games DROP COLUMN replay;
