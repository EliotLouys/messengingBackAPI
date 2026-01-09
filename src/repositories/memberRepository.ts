import db from "../db";

// Add user to channel
export const addMember = (userId: number, channelId: number | bigint) => {
  try {
    const stmt = db.prepare(
      "INSERT INTO channel_members (user_id, channel_id) VALUES (?, ?)"
    );
    stmt.run(userId, channelId);
    return true;
  } catch (err) {
    // Usually fails if they are already a member (due to PRIMARY KEY constraint)
    return false;
  }
};

// Check if user is in channel (Returns true/false)
export const isMember = (userId: number, channelId: number): boolean => {
  const stmt = db.prepare(
    "SELECT 1 FROM channel_members WHERE user_id = ? AND channel_id = ?"
  );
  const result = stmt.get(userId, channelId);
  return !!result; // Converts result to boolean (true if found, false if undefined)
};

// Get all channels a user belongs to
export const getUserChannels = (userId: number) => {
  const stmt = db.prepare(`
        SELECT channels.* FROM channels 
        JOIN channel_members ON channels.id = channel_members.channel_id 
        WHERE channel_members.user_id = ?
    `);
  return stmt.all(userId);
};
