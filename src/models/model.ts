// 1. The Model (Type)
export interface UserMetaData {
  username: string;
  display_name: string;
  img: string;
  status: string;
}

export interface UserMetaData {
  username: string;
  display_name: string;
  img: string;
  status: string;
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

export interface Theme {
  primary_color: string;
  primary_color_dark: string;
  accent_color: string;
  text_color: string;
  accent_text_color: string;
}

export const validateTheme = (theme: any): boolean => {
  if (!theme || typeof theme !== "object") return false;

  const requiredKeys = [
    "primary_color",
    "primary_color_dark",
    "accent_color",
    "text_color",
    "accent_text_color",
  ];

  for (const key of requiredKeys) {
    if (typeof theme[key] !== "string" || !theme[key].trim()) {
      return false;
    }
  }

  return true;
};
export interface Channel {
  id: number;
  name: string;
  description?: string;
  img?: string;
  theme?: Theme;
  creator_id: number;
  users: string[];
}

export interface ChannelUpdateMetadata {
  name?: string;
  description?: string;
  img?: string;
  theme?: Theme; // Reusing the Theme interface from previous steps
}

export interface Message {
  id: number;
  content: string;
  type: "Text" | "Image"; // Restricted string type
  user_id: number;
  channel_id: number;
  created_at: string;
  // Optional: joined fields if you fetch author info
  author_name?: string;
  author_avatar?: string;
}
