export interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  premium: boolean;
  createdAt: string;
}
export interface Category {
  id: number;
  name: string;
  description: string;
}
export interface Location {
  id: number;
  placeId: string;
  name: string;
  formattedAddress?: string;
  address: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zip?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  priceLevel?: string;
}
export interface Event {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  price: number;
  status: string;
  ageRating: string;
  user: Pick<User, "id" | "name">;
  location: Location;
  category: Category | null;
}
export interface Favorite {
  favoritedAt: string;
  event: Event;
}
export interface Recommendation {
  reason: string;
  event: Event;
}
export interface Plan {
  name: string;
  premium: boolean;
  nearbyLimit: number;
  benefits: string[];
}
export interface Nearby {
  placeId: string;
  name: string;
  address: string;
  type: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  googleMapsUri?: string;
}
export interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
}
export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
  tokenType: string;
}
export interface FieldError {
  field: string;
  message: string;
}
export interface EventInput {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  price: number;
  status: string;
  ageRating: string;
  placeId: string;
  categoryId?: number;
}
