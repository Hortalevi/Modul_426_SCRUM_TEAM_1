CREATE TABLE IF NOT EXISTS app_user (
    phone_number TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat (
    id SERIAL PRIMARY KEY,
    name TEXT,
    is_group BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_member (
    chat_id INT NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
    user_phone TEXT NOT NULL REFERENCES app_user(phone_number) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (chat_id, user_phone)
);

CREATE TABLE IF NOT EXISTS message (
    id SERIAL PRIMARY KEY,
    chat_id INT NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
    sender_phone TEXT NOT NULL REFERENCES app_user(phone_number) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
