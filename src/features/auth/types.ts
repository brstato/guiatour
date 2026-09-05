export interface LoginResult {
  success: boolean;
  statusCode: number;
  token: string;
  rToken: string;
  userId: string;
  errorMessage: string;
}

export interface RefreshResult {
  success: boolean;
  statusCode: number;
  token: string;
  rToken: string;
}

export interface RecoveryResult {
  success: boolean;
  statusCode: number;
  message: string;
}

export interface GoogleLoginPayload {
  g_email: string;
  g_id: string;
  g_token: string;
  g_name: string;
  ads_id: string | null;
  r_token: string;
}
