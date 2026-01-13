import db from "../db";
import { ChannelCreator } from "../models/model";

export const createChannel = (
  name: string,
  description: string,
  creatorId: number
) => {
  try {
    const stmt = db.prepare(
      "INSERT INTO channels (name, description, creator_id) VALUES (?, ?, ?)"
    );
    const result = stmt.run(name, description, creatorId);
    return { id: result.lastInsertRowid, name, description };
  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE")
      throw new Error("CHANNEL_EXISTS");
    throw err;
  }
};

export const getAllChannels = () => {
  return db.prepare("SELECT * FROM channels").all();
};

export const getChannelsByUser = (userId: number) => {
  return db
    .prepare(
      `
        SELECT channels.* FROM channels
        JOIN channel_members ON channels.id = channel_members.channel_id
        WHERE channel_members.user_id = ?
    `
    )
    .all(userId);
};

export const deleteChannel = (channelId: number, userId: number) => {
  const creator_id = db
    .prepare("SELECT creator_id FROM channels WHERE id = ?")
    .get(channelId) as ChannelCreator;
  console.log(creator_id.creator_id);
  const isAllowed = userId === creator_id.creator_id;

  if (!isAllowed) {
    return false; // Not the creator, cannot delete
  } else {
    console.log("ran the query");

    const stmt = db.prepare("DELETE FROM channels WHERE id = ?");
    const result = stmt.run(channelId);
    return result.changes > 0;
  }
};
