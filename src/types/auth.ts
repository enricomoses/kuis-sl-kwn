export interface AdminSessionProfile {
  userId: string;
  email: string;
  role: 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
  next?: string;
}

export interface LoginResponse {
  profile: AdminSessionProfile;
  redirectTo: string;
}

export interface LogoutResponse {
  signedOut: true;
}
