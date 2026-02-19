from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import httpx
import uuid
import asyncio

app = FastAPI()


# ───────────────────────────────────────────────
# Schema
# ───────────────────────────────────────────────


class Location(BaseModel):
    id: int  # 節點編號，0 通常為 depot
    name: Optional[str] = None  # 地點名稱（可選，方便辨識）
    lat: float  # 緯度
    lng: float  # 經度
    demand: int = 0  # 貨物需求量（depot 填 0）
    service_time: int = 0  # 停留時間，單位：秒（depot 填 0）
    time_window_start: int = 0  # 最早可服務時間，單位：秒（距離當天 00:00）
    time_window_end: int = 86400  # 最晚可服務時間，單位：秒，預設一整天


class Vehicle(BaseModel):
    id: int  # 車輛編號
    capacity: int  # 最大載貨量


class VRPRequest(BaseModel):
    webhook_url: str  # 必填：解完後回傳結果的 URL

    depot_index: int = 0  # 倉庫在 locations 裡的 index，預設第 0 筆

    locations: list[Location]  # 必填：所有地點（含 depot）
    vehicles: list[Vehicle]  # 必填：所有車輛

    # 距離矩陣與時間矩陣，N x N（N = len(locations)）
    distance_matrix: list[list[int]]  # 必填：單位建議為公尺
    time_matrix: list[list[int]]  # 必填：單位建議為秒

    # 求解器參數（可選）
    time_limit_seconds: int = 30  # 求解時間限制，預設 30 秒
    fixed_vehicle_cost: int = 0  # 每輛車的固定使用成本，設 > 0 可促使少派車

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
        # 這裡無法直接拿到 locations 長度，在 endpoint 裡再做交叉驗證
        for row in v:
            if len(row) != len(v):
                raise ValueError("矩陣必須是 N x N 的正方形")
        return v


# ───────────────────────────────────────────────
# VRP 求解
# ───────────────────────────────────────────────

from vrp_solver import solve_vrp


# ───────────────────────────────────────────────
# 背景任務：求解 + 打 Webhook
# ───────────────────────────────────────────────


async def run_vrp_and_notify(job_id: str, data: VRPRequest):
    loop = asyncio.get_event_loop()
    try:
        # 把同步的 solve_vrp 丟到 thread pool，不阻塞 event loop
        result = await loop.run_in_executor(None, solve_vrp, data)
        payload = {"job_id": job_id, **result}
    except Exception as e:
        payload = {
            "job_id": job_id,
            "status": "error",
            "message": str(e),
        }

    async with httpx.AsyncClient() as client:
        try:
            await client.post(data.webhook_url, json=payload, timeout=10)
        except Exception as e:
            print(f"[{job_id}] Webhook 發送失敗: {e}")


# ───────────────────────────────────────────────
# Endpoints
# ───────────────────────────────────────────────


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/start_vrp_computation", status_code=202)
async def start_computation(request: VRPRequest, background_tasks: BackgroundTasks):
    # 交叉驗證矩陣大小與地點數是否一致
    n = len(request.locations)
    if len(request.distance_matrix) != n:
        return {
            "error": f"distance_matrix 應為 {n}x{n}，但收到 {len(request.distance_matrix)} 列"
        }
    if len(request.time_matrix) != n:
        return {
            "error": f"time_matrix 應為 {n}x{n}，但收到 {len(request.time_matrix)} 列"
        }

    job_id = str(uuid.uuid4())
    background_tasks.add_task(run_vrp_and_notify, job_id, request)

    return {
        "message": "VRP 計算已啟動",
        "job_id": job_id,
    }

# 目前用的是秒，記得配合後端改用分