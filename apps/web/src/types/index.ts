export interface TimeWindow {
  start: string // "HH:mm"
  end: string   // "HH:mm"
}

export interface Location {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  timeWindows: TimeWindow[]
  dwellTime: number         // 分鐘
  acceptedVehicleTypes: string[] // VehicleType IDs
  cargoDemand: number
}

export interface Vehicle {
  id: string
  name: string
  licensePlate: string
  vehicleTypeId: string
  distanceLimit: number | null    // null = 無限制
  workingHoursLimit: number | null // null = 無限制（小時）
  cargoCapacity: number
}

export interface VehicleType {
  id: string
  name: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthUser {
  id: string
  username: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}
