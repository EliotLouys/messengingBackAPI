import db from "../db";

export const createChannel = (name: string, description: string) => {
  try {
    const stmt = db.prepare(
      "INSERT INTO channels (name, description) VALUES (?, ?)"
    );
    const result = stmt.run(name, description);
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
