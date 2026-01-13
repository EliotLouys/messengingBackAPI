import db from "../db";
import { ChannelCreator, ChannelUpdateMetadata, Theme } from "../models/model";
import { findUserById } from "./userRepository";

export const createChannel = (
  name: string,
  description: string,
  img: string,
  theme: Theme,
  creatorId: number
) => {
  try {
    const stmt = db.prepare(
      `INSERT INTO channels (name, description, img, theme, creator_id) 
       VALUES (?, ?, ?, ?, ?)`
    );

    // Convert theme JSON to string for storage
    const themeString = JSON.stringify(theme);

    const result = stmt.run(name, description, img, themeString, creatorId);

    return {
      id: result.lastInsertRowid,
      name,
      description,
      img,
      theme,
      creator_id: creatorId,
      users: [], // Return empty array initially (Controller will add creator)
    };
  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE")
      throw new Error("CHANNEL_EXISTS");
    throw err;
  }
};

export const getChannelsByUser = (userId: number) => {
  // 1. Select channels AND group all usernames into a single string (comma-separated)
  const channels = db
    .prepare(
      `
        SELECT 
            channels.*, 
            GROUP_CONCAT(users.username) as user_list
        FROM channels
        JOIN channel_members ON channels.id = channel_members.channel_id
        JOIN users ON channel_members.user_id = users.id
        WHERE channels.id IN (
            SELECT channel_id FROM channel_members WHERE user_id = ?
        )
        GROUP BY channels.id
      `
    )
    .all(userId);

  // 2. Process the results: Parse Theme JSON and Split User List
  return channels.map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    img: c.img,
    type: c.type,
    creator_id: findUserById(c.creator_id)?.username,
    // Parse the JSON string back to an object
    theme: c.theme ? JSON.parse(c.theme) : null,
    // Split the "user1,user2,user3" string into an array
    users: c.user_list ? c.user_list.split(",") : [],
  }));
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

export const updateChannel = (
  channelId: number,
  userId: number,
  data: ChannelUpdateMetadata
) => {
  // 1. Fetch channel to check permissions (Only creator can update)
  const channel = db
    .prepare("SELECT creator_id FROM channels WHERE id = ?")
    .get(channelId) as { creator_id: number } | undefined;

  if (!channel) {
    throw new Error("CHANNEL_NOT_FOUND");
  }

  if (channel.creator_id !== userId) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Build Dynamic Query (Partial Update)
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }
  if (data.img !== undefined) {
    fields.push("img = ?");
    values.push(data.img);
  }
  if (data.theme !== undefined) {
    fields.push("theme = ?");
    values.push(JSON.stringify(data.theme)); // Store as String
  }

  // If nothing to update, return early
  if (fields.length === 0) return true;

  // Add the ID for the WHERE clause
  values.push(channelId);

  const sql = `UPDATE channels SET ${fields.join(", ")} WHERE id = ?`;

  try {
    const info = db.prepare(sql).run(...values);
    return info.changes > 0;
  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new Error("CHANNEL_NAME_TAKEN");
    }
    throw err;
  }
};
