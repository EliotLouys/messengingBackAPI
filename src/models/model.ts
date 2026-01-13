// 1. The Model (Type)
export interface UserMetaData {
  username: string;
  display_name: string;
  img: string;
  status: string;
}

export interface UpdateUserMetadataDTO {
  display_name?: string;
  img?: string;
  status?: string;
  // We usually don't let users change their 'username' easily,
  // but if you want to allow it, add it here.
}

//

export interface UserMetaData {
  username: string;
  display_name: string;
  img: string;
  status: string;
}

export interface UpdateUserMetadataDTO {
  display_name?: string;
  img?: string;
  status?: string;
}

// --- NEW TYPES ADDED BELOW ---

// Represents a row in the 'users' table
export interface User {
  id: number;
  username: string;
  password?: string; // Optional because we might select without password sometimes
}

// Minimal shape needed for checking channel permissions
export interface ChannelCreator {
  creator_id: number;
}
