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
