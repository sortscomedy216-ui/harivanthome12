export interface ServiceProvider {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photo?: string;
  category: ServiceCategory;
  skills: string[];
  experience: number; // years
  location: string;
  city: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  verified: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceCategory =
  | "plumber"
  | "electrician"
  | "carpenter"
  | "painter"
  | "cleaner"
  | "acRepair"
  | "pestControl"
  | "appliance";

export interface ServiceCategoryInfo {
  id: ServiceCategory;
  icon: string;
  color: string;
  bgColor: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  role: "seeker" | "provider" | "admin";
  createdAt: Date;
}

export interface Booking {
  id: string;
  seekerId: string;
  providerId: string;
  category: ServiceCategory;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  scheduledDate: Date;
  createdAt: Date;
  notes?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  seekerId: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
