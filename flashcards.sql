-- tables
-- Table: card
CREATE TABLE card (
    id INT NOT NULL,
    flashcard_set_id INT NOT NULL,
    term TEXT NOT NULL,
    definition TEXT NOT NULL, 
    CONSTRAINT card_pk PRIMARY KEY (id)
);

-- Table: favorites
CREATE TABLE favorites (
    id INT NOT NULL,
    user_id INT NOT NULL,
    flashcard_set_id INT NOT NULL,
    CONSTRAINT favorites_pk PRIMARY KEY (id),
    CONSTRAINT favorites_user_set_unique UNIQUE (user_id, flashcard_set_id) -- prevent duplicate favorites
);

-- Table: flashcard_set
CREATE TABLE flashcard_set (
    id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_date TIMESTAMP NOT NULL,
    CONSTRAINT flashcard_set_pk PRIMARY KEY (id)
);

-- Table: progress
CREATE TABLE progress (
    id INT NOT NULL,
    user_id INT NOT NULL,
    flashcard_set_id INT NOT NULL,
    cards_studied INT NOT NULL DEFAULT 0,
    cards_correct INT NOT NULL DEFAULT 0,
    last_studied TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    CONSTRAINT progress_pk PRIMARY KEY (id)
);

-- Table: user
CREATE TABLE "user" (
    id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    username VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    CONSTRAINT user_pk PRIMARY KEY (id)
);

-- foreign keys
-- Reference: card_flashcard_set (table: card)
ALTER TABLE card ADD CONSTRAINT card_flashcard_set
    FOREIGN KEY (flashcard_set_id)
    REFERENCES flashcard_set (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE;

-- Reference: favorites_flashcard_set (table: favorites)
ALTER TABLE favorites ADD CONSTRAINT favorites_flashcard_set
    FOREIGN KEY (flashcard_set_id)
    REFERENCES flashcard_set (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE;

-- Reference: favorites_user (table: favorites)
ALTER TABLE favorites ADD CONSTRAINT favorites_user
    FOREIGN KEY (user_id)
    REFERENCES "user" (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE;

-- Reference: flashcard_set_user (table: flashcard_set)
ALTER TABLE flashcard_set ADD CONSTRAINT flashcard_set_user
    FOREIGN KEY (user_id)
    REFERENCES "user" (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE;

-- Reference: progress_flashcard_set (table: progress)
ALTER TABLE progress ADD CONSTRAINT progress_flashcard_set
    FOREIGN KEY (flashcard_set_id)
    REFERENCES flashcard_set (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE;

-- Reference: progress_user (table: progress)
ALTER TABLE progress ADD CONSTRAINT progress_user
    FOREIGN KEY (user_id)
    REFERENCES "user" (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE;

-- End of file.
