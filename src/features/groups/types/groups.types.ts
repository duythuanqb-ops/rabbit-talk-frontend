export interface Group {
  id: string;
  title: string;
  description: string | null;
  avatar: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  uuid: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  joined_at: string;
}

export interface CreateGroupDto {
  title: string;
  description?: string;
  avatar?: string;
}

export interface UpdateGroupDto {
  title?: string;
  description?: string;
  avatar?: string;
}
