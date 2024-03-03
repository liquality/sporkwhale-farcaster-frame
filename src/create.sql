-- Create sql db
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255),
    fid INTEGER
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question VARCHAR(255),
    expired BOOLEAN DEFAULT false
);

CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    followers INTEGER,
    name VARCHAR(255) UNIQUE NOT NULL,
    c_address VARCHAR(255),
    c_wallet VARCHAR(255),
    c_pool VARCHAR(255),
    salt VARCHAR(255),
    question_id INT,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE user_question_responses (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    correct_response BOOLEAN,
    is_onchain BOOLEAN DEFAULT false,
    response VARCHAR(255),
    channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE
);

CREATE TABLE clashes (
    id SERIAL PRIMARY KEY,
    question_id INT,
    channel1_id INT,
    channel2_id INT,
    channel_winner_id INT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (channel1_id) REFERENCES channels(id),
    FOREIGN KEY (channel2_id) REFERENCES channels(id),
    FOREIGN KEY (channel_winner_id) REFERENCES channels(id)
);

create index idx_clashes_question_channels ON clashes (question_id, channel1_id, channel2_id);

-- IF YOU WANT TO DROP:
DROP TABLE IF EXISTS user_question_responses CASCADE;

DROP TABLE IF EXISTS questions CASCADE;

DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS channels CASCADE;

DROP TABLE IF EXISTS clashes CASCADE;

/*
 INDEXES
 */
CREATE INDEX idx_users_wallet_address ON users (wallet_address);

CREATE INDEX idx_user_question_responses_question_user_channel ON user_question_responses (user_id, question_id, channel_id);

CREATE INDEX idx_channels_name ON channels (name);

/*
 QUESTIONS 
 */
alter table
    questions drop column expired;

alter table
    questions
add
    column expires_at timestamp null;

alter table
    questions
add
    column correct_response VARCHAR(255);

alter table
    questions
add
    column options json NOT null default '[]' :: json;

create index idx_questions_id_expires ON questions (id, expires_at);

alter table
   user_question_responses
add
    column has_minted BOOLEAN DEFAULT false;