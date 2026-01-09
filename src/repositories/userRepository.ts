import db from "../db";
import bcrypt from "bcrypt";
import { UserMetaData } from "../models/model";

// 2. Define the functions your controller needs
export const findUserByUsername = (username: string) => {
  // .get() returns the first match or undefined
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
};

export const findUserById = (id: number) => {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
};

export const createUser = async (username: string, plainPassword: string) => {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    const result = db
      .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
      .run(username, hashedPassword);
    return { id: result.lastInsertRowid, username };
  } catch (error: any) {
    // Handle "Unique" constraint error (User already exists)
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new Error("USERNAME_TAKEN");
    }
    throw error;
  }
};
// --- GET Metadata ---
export const findUserMetaData = (userId: number): UserMetaData | undefined => {
  const query = `
    SELECT username, display_name, img, status 
    FROM users 
    WHERE id = ?
  `;

  // db.prepare() creates the statement, .get() executes it synchronously
  return db.prepare(query).get(userId) as UserMetaData | undefined;
};

// --- UPDATE Metadata ---
export const updateUserMetaData = (
  userId: number,
  data: Partial<UserMetaData>
): void => {
  const fieldsToUpdate = [];
  const values = [];

  // 1. Build the dynamic columns
  if (data.display_name !== undefined) {
    fieldsToUpdate.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.img !== undefined) {
    fieldsToUpdate.push("img = ?");
    values.push(data.img);
  }
  if (data.status !== undefined) {
    fieldsToUpdate.push("status = ?");
    values.push(data.status);
  }

  // If nothing to update, exit
  if (fieldsToUpdate.length === 0) {
    return;
  }

  // 2. Prepare the query
  const query = `UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;

  // Add userId as the last parameter for the WHERE clause
  values.push(userId);

  // 3. Execute
  // Use spread operator (...) because .run() expects arguments, not an array
  db.prepare(query).run(...values);
};
