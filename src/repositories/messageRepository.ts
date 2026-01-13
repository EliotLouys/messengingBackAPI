import db from "../db";

export const createMessage = (
  userId: number,
  channelId: number,
  content: string,
  type: "Text" | "Image" = "Text" // Default to Text
) => {
  const stmt = db.prepare(
    "INSERT INTO messages (user_id, channel_id, content, type) VALUES (?, ?, ?, ?)"
  );
  const result = stmt.run(userId, channelId, content, type);

  return {
    id: result.lastInsertRowid,
    user_id: userId,
    channel_id: channelId,
    content,
    type, // Return the type
    created_at: new Date().toISOString(),
  };
};

export const getMessagesByChannel = (channelId: number) => {
  // Select the new 'type' column as well
  return db
    .prepare(
      `
        SELECT 
            messages.id, 
            messages.content, 
            messages.type,  -- <--- Fetch type
            messages.created_at, 
            messages.user_id,
            users.username as author_name,
            users.img as author_avatar
        FROM messages
        JOIN users ON messages.user_id = users.id
        WHERE channel_id = ?
        ORDER BY messages.created_at ASC
    `
    )
    .all(channelId);
};
