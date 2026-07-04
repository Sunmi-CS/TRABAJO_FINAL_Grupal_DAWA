// ── API Types ────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'CLIENTE';
export type Provider = 'LOCAL' | 'GOOGLE';
export type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string | null;
  provider: Provider;
  createdAt?: string;
  pets?: Pet[];
  _count?: { pets: number; reservations: number };
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  age: number;
  weight: number;
  photoUrl?: string | null;
  notes?: string | null;
  ownerId: string;
  createdAt?: string;
  owner?: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  _count?: { reservations: number };
  vaccinations?: Vaccination[];
}

export interface Vaccination {
  id: string;
  name: string;
  applicationDate: string;
  nextDueDate?: string | null;
  notes?: string | null;
  petId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutos
  isActive: boolean;
  createdAt?: string;
  _count?: { reservations: number };
}

export interface Reservation {
  id: string;
  reservationDate: string;
  reservationTime: string;
  status: ReservationStatus;
  notes?: string | null;
  ownerId: string;
  petId: string;
  serviceId: string;
  createdAt?: string;
  owner?: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  pet?: Pick<Pet, 'id' | 'name' | 'species' | 'breed' | 'photoUrl'>;
  service?: Pick<Service, 'id' | 'name' | 'price' | 'duration'>;
}

// ── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

// ── Dashboard Types ───────────────────────────────────────────────────────────

export interface DashboardStats {
  totals: {
    users: number;
    pets: number;
    reservations: number;
    newUsersThisMonth: number;
  };
  reservationsByStatus: { status: ReservationStatus; count: number }[];
  topServices: { service: Service | undefined; count: number }[];
  recentReservations: Reservation[];
}

// ── Form Types ────────────────────────────────────────────────────────────────

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PetForm {
  name: string;
  species: string;
  breed?: string;
  age: number;
  weight: number;
  notes?: string;
  photo?: FileList;
}

export interface ServiceForm {
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive?: boolean;
}

export interface ReservationForm {
  petId: string;
  serviceId: string;
  reservationDate: string;
  reservationTime: string;
  notes?: string;
}

export interface VaccinationForm {
  name: string;
  applicationDate: string;
  nextDueDate?: string;
  notes?: string;
}
