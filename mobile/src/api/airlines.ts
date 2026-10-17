import { API_BASE_URL } from "../config";

export type Status = "Active" | "Inactive";

export interface AirlineInput {
  name: string;
  iata_code: string;
  icao_code: string;
  country: string;
  hub_airport: string;
  hub_city: string;
  founded_year: number;
  status: Status;
  website: string | null;
}

export interface Airline extends AirlineInput {
  id: number;
  created_at: string;
  updated_at: string;
}

export type FieldErrors = Partial<Record<string, string>>;

export class ApiError extends Error {
  constructor(public status: number, public errors: FieldErrors = {}) {
    super(Object.values(errors)[0] ?? `Request failed (${status})`);
  }
}

const URL = `${API_BASE_URL}/airlines.php`;

async function request<T>(url: string, method = "GET", body?: AirlineInput): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.errors ?? (data.error ? { error: data.error } : {}));
  return data as T;
}

export const listAirlines = () => request<Airline[]>(URL);
export const getAirline = (id: number) => request<Airline>(`${URL}?id=${id}`);
export const createAirline = (a: AirlineInput) => request<Airline>(URL, "POST", a);
export const updateAirline = (id: number, a: AirlineInput) => request<Airline>(`${URL}?id=${id}`, "PUT", a);
export const deleteAirline = (id: number) => request<{ deleted: boolean }>(`${URL}?id=${id}`, "DELETE");
