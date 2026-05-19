export interface Friend {
  friendship_id: string;
  uuid: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  role: 'student' | 'teacher';
}

export interface PendingRequest {
  request_id: string;
  uuid: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  direction: 'incoming' | 'outgoing';
}

export interface SearchUserResult {
  uuid: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: 'student' | 'teacher';
  friendship_id: string | null;
  friendship_status: 'pending' | 'accepted' | 'declined' | null;
  friendship_sender: string | null;
}
