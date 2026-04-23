const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error ${response.status}`);
  }

  if (response.status === 204) return null as T;

  return response.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterData) =>
    request<{ accessToken: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Restaurants ─────────────────────────────────────────────────────────────

export const restaurantsApi = {
  getBySlug: (slug: string) =>
    request<Restaurant>(`/restaurants/slug/${slug}`),

  getById: (id: string) =>
    request<Restaurant>(`/restaurants/${id}`),

  create: (data: CreateRestaurantData) =>
    request<Restaurant>('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateRestaurantData>) =>
    request<Restaurant>(`/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  createTable: (restaurantId: string, data: CreateTableData) =>
    request<Table>(`/restaurants/${restaurantId}/tables`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTable: (tableId: string, data: Partial<CreateTableData & { status: string }>) =>
    request<Table>(`/restaurants/tables/${tableId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteTable: (tableId: string) =>
    request<void>(`/restaurants/tables/${tableId}`, {
      method: 'DELETE',
    }),

  addStaff: (restaurantId: string, email: string) =>
    request<{ message: string }>(`/restaurants/${restaurantId}/staff`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// ─── Waitlist ─────────────────────────────────────────────────────────────────

export const waitlistApi = {
  join: (data: JoinWaitlistData) =>
    request<WaitlistEntry>('/waitlist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getWaitlist: (restaurantId: string) =>
    request<WaitlistEntry[]>(`/waitlist/${restaurantId}`),

  call: (entryId: string) =>
    request<WaitlistEntry>(`/waitlist/${entryId}/call`, { method: 'PATCH' }),

  seat: (entryId: string) =>
    request<WaitlistEntry>(`/waitlist/${entryId}/seat`, { method: 'PATCH' }),

  finish: (entryId: string) =>
    request<WaitlistEntry>(`/waitlist/${entryId}/finish`, { method: 'PATCH' }),

  cancel: (entryId: string) =>
    request<WaitlistEntry>(`/waitlist/${entryId}/cancel`, { method: 'PATCH' }),
};

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'host';
  restaurantId: string | null;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  phone: string;
  isOpen: boolean;
  estimatedWaitMinutes: number;
  tables: Table[];
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export interface WaitlistEntry {
  id: string;
  guestName: string;
  partySize: number;
  phone: string;
  status: 'waiting' | 'called' | 'seated' | 'finished' | 'cancelled';
  position: number;
  notes: string | null;
  joinedAt: string;
  calledAt: string | null;
  seatedAt: string | null;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'owner' | 'host';
}

export interface CreateRestaurantData {
  name: string;
  phone?: string;
  estimatedWaitMinutes?: number;
  isOpen?: boolean;
}

export interface CreateTableData {
  number: string;
  capacity: number;
}

export interface JoinWaitlistData {
  restaurantId: string;
  guestName: string;
  partySize: number;
  phone: string;
  notes?: string;
}