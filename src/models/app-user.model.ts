export interface AppUser {
  // simplified public schema stored in Firestore: only these three fields
  name: string;
  email: string;
  role: 'admin' | 'programmer' | 'user' | string;
}
