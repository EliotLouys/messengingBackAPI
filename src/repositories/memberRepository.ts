import db from "../db";
import { findUserByUsername } from "./userRepository";

// Add user to channel
export const addMember = (
  username: string,
  channelId: number | bigint,
  requestSenderId: number
) => {
  try {
    const userId = findUserByUsername(username).id;
    const isAllowed =
      requestSenderId ===
      db.prepare("SELECT creator_id FROM channels WHERE id = ?").get(channelId)
        ?.creator_id;
    if (!isAllowed) {
      return false; // Not the creator, cannot delete
    } else {
      const stmt = db.prepare(
        "INSERT INTO channel_members (user_id, channel_id) VALUES (?, ?)"
      );
      stmt.run(userId, channelId);
      return true;
    }
  } catch (err) {
    // Usually fails if they are already a member (due to PRIMARY KEY constraint)
    return false;
  }
};

export const removeMember = (
  targetUsername: string,
  channelId: number,
  requestSenderId: number
): boolean => {
  // 1. Get the ID of the user we want to remove
  const targetUser = findUserByUsername(targetUsername);

  // If the user doesn't exist, we can't remove them. Return false.
  if (!targetUser || !targetUser.id) {
    return false;
  }

  const targetUserId = targetUser.id;

  // 2. Get the Channel's Creator ID
  // We explicitly cast the result to ensure TypeScript knows what to expect
  const channel = db
    .prepare("SELECT creator_id FROM channels WHERE id = ?")
    .get(channelId) as { creator_id: number } | undefined;

  // If channel doesn't exist, return false
  if (!channel) {
    return false;
  }

  // 3. Check Permissions
  const isSelf = targetUserId === requestSenderId; // User is removing themselves
  const isCreator = channel.creator_id === requestSenderId; // User is the owner kicking someone

  // If it's NOT self-removal AND NOT the creator, deny access
  if (!isSelf && !isCreator) {
    return false;
  }

  // 4. Execute Removal
  try {
    const result = db
      .prepare(
        "DELETE FROM channel_members WHERE user_id = ? AND channel_id = ?"
      )
      .run(targetUserId, channelId);

    // returns true if a row was actually deleted
    return result.changes > 0;
  } catch (error) {
    console.error("Remove Member Error:", error);
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
