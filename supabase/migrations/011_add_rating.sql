ALTER TABLE games ADD COLUMN rating NUMERIC(2,1) CHECK (rating >= 0.5 AND rating <= 5);
