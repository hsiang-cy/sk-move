from pydantic import BaseModel, field_validator
from typing import Optional


class Location(BaseModel):
    id: int
    name: Optional[str] = None
    lat: float
    lng: float
    demand: int = 0
    service_time: int = 0
    time_window_start: int = 0
    time_window_end: int = 1440  # 默認為一天的分鐘數


class Vehicle(BaseModel):
    id: int
    capacity: int


class VRPRequest(BaseModel):
    webhook_url: str

    depot_index: int = 0

    locations: list[Location]
    vehicles: list[Vehicle]

    distance_matrix: list[list[int]]    # 以公尺為單位的距離矩陣
    time_matrix: list[list[int]]        # 以分鐘為單位的時間矩陣

    time_limit_seconds: int = 30
    fixed_vehicle_cost: int = 0

    @field_validator("locations")
    @classmethod
    def check_locations(cls, v):
        if len(v) < 2:
            raise ValueError("至少需要 1 個 depot + 1 個客戶節點")
        return v

    @field_validator("vehicles")
    @classmethod
    def check_vehicles(cls, v):
        if len(v) < 1:
            raise ValueError("至少需要 1 輛車")
        return v

    @field_validator("distance_matrix", "time_matrix")
    @classmethod
    def check_matrix(cls, v, info):
        for row in v:
            if len(row) != len(v):
                raise ValueError("矩陣必須是 N x N 的正方形")
        return v
