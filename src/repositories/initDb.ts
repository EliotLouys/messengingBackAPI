import db from "../db";

export const initDb = () => {
  // 1. Users (Already exists)
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            display_name TEXT, 
            img TEXT,
            status TEXT
        )
    `
  ).run();

  // 2. Channels (Discussion Rooms)
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            type TEXT DEFAULT 'text', -- <--- YOU MUST ADD THIS COMMA
            creator_id INTEGER NOT NULL,       -- <--- REMOVE THE COMMA HERE
            FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
        )
    `
  ).run();

  // 3. Messages (Linked to User AND Channel)
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            channel_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (channel_id) REFERENCES channels (id) ON DELETE CASCADE
        )
    `
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS channel_members (
        user_id INTEGER NOT NULL,
        channel_id INTEGER NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        role TEXT DEFAULT 'member', -- 'admin' or 'member'
        PRIMARY KEY (user_id, channel_id), -- Prevents duplicates (user can't join twice)
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (channel_id) REFERENCES channels (id) ON DELETE CASCADE
    )
`
  ).run();
  console.log("All tables initialized.");
};
