import db from "../db";

export const createMessage = (
  userId: number,
  channelId: number,
  content: string
) => {
  const stmt = db.prepare(
    "INSERT INTO messages (user_id, channel_id, content) VALUES (?, ?, ?)"
  );
  const result = stmt.run(userId, channelId, content);

  // Immediately fetch the created message to return it
  return db
    .prepare("SELECT * FROM messages WHERE id = ?")
    .get(result.lastInsertRowid);
};

export const getMessagesByChannel = (channelId: number) => {
  // JOIN users so we know WHO sent the message
  const stmt = db.prepare(`
        SELECT 
            messages.id, 
            messages.content, 
            messages.created_at,
            users.username
        FROM messages 
        JOIN users ON messages.user_id = users.id 
        WHERE messages.channel_id = ? 
        ORDER BY messages.created_at ASC
    `);
  return stmt.all(channelId);
};
