export interface AvailabilitySlot {
  day: string;     
  from: string;    
  to: string;     
}

export interface AppUser {
  name: string;
  email: string;
  role: 'admin' | 'programmer' | 'user' | string;
  photoURL?: string;
  specialty?: string;           
  description?: string;         
  contactLinks?: string[];      
  socialLinks?: string[];       
  availability?: AvailabilitySlot[]; 
  createdAt?: any;
  updatedAt?: any;
}
