from fastapi import APIRouter, BackgroundTasks
from fastapi import HTTPException
import httpx
import uuid
import asyncio

from vrp.schema import VRPRequest
from vrp.solver import solve_vrp

router = APIRouter(prefix="/vrp", tags=["VRP"])


# ── 背景任務：求解 + 打 Webhook ──


async def run_vrp_and_notify(job_id: str, data: VRPRequest):
    loop = asyncio.get_running_loop()
    try:
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


# ── Endpoints ──


@router.post("/solve", status_code=202)
async def start_computation(request: VRPRequest, background_tasks: BackgroundTasks):
    n = len(request.locations)
    if len(request.distance_matrix) != n:
        raise HTTPException(
            status_code=422,
            detail=f"distance_matrix 應為 {n}x{n}，但收到 {len(request.distance_matrix)} 列",
        )
    if len(request.time_matrix) != n:
        raise HTTPException(
            status_code=422,
            detail=f"time_matrix 應為 {n}x{n}，但收到 {len(request.time_matrix)} 列",
        )

    job_id = str(uuid.uuid4())
    background_tasks.add_task(run_vrp_and_notify, job_id, request)

    return {
        "message": "VRP 計算已啟動",
        "job_id": job_id,
    }
