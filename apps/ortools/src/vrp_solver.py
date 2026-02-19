from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

from index import VRPRequest


def solve_vrp(data: VRPRequest) -> dict:
    n = len(data.locations)
    num_vehicles = len(data.vehicles)
    depot = data.depot_index

    # ───────────────────────────────────────────────
    # 1. Index Manager & Routing Model
    # ───────────────────────────────────────────────
    manager = pywrapcp.RoutingIndexManager(n, num_vehicles, depot)
    routing = pywrapcp.RoutingModel(manager)

    # ───────────────────────────────────────────────
    # 2. 成本函數：最短總距離
    # ───────────────────────────────────────────────
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data.distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # ───────────────────────────────────────────────
    # 3. 固定使用成本（促使少派車，可選）
    # ───────────────────────────────────────────────
    if data.fixed_vehicle_cost > 0:
        routing.SetFixedCostOfAllVehicles(data.fixed_vehicle_cost)

    # ───────────────────────────────────────────────
    # 4. Capacity Dimension
    # ───────────────────────────────────────────────
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return data.locations[from_node].demand

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)

    # 各車輛容量可以不同
    vehicle_capacities = [v.capacity for v in data.vehicles]

    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,                    # slack（容量不允許鬆弛）
        vehicle_capacities,   # 各車最大載重
        True,                 # 從 0 開始累計
        "Capacity",
    )

    # ───────────────────────────────────────────────
    # 5. Time Dimension（含時間窗 + 停留時間）
    # ───────────────────────────────────────────────
    def time_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        travel = data.time_matrix[from_node][to_node]
        service = data.locations[from_node].service_time
        return travel + service

    time_callback_index = routing.RegisterTransitCallback(time_callback)

    # 取得所有時窗的最大值作為 horizon
    max_time = max(loc.time_window_end for loc in data.locations)

    routing.AddDimension(
        time_callback_index,
        max_time,   # 允許等待（slack），讓車輛可以提早到達後等候時窗開始
        max_time,   # 每條路線的最大累計時間
        False,      # 不強制從 0 開始（depot 有自己的時間窗）
        "Time",
    )

    time_dimension = routing.GetDimensionOrDie("Time")

    # 套用每個節點的時間窗
    for location_idx, loc in enumerate(data.locations):
        index = manager.NodeToIndex(location_idx)
        time_dimension.CumulVar(index).SetRange(
            loc.time_window_start,
            loc.time_window_end,
        )

    # 讓求解器優先在時間窗早的節點進行排程（改善解品質）
    for vehicle_id in range(num_vehicles):
        routing.AddVariableMinimizedByFinalizer(
            time_dimension.CumulVar(routing.Start(vehicle_id))
        )
        routing.AddVariableMinimizedByFinalizer(
            time_dimension.CumulVar(routing.End(vehicle_id))
        )

    # ───────────────────────────────────────────────
    # 6. 搜尋參數
    # ───────────────────────────────────────────────
    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_params.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_params.time_limit.seconds = data.time_limit_seconds

    # ───────────────────────────────────────────────
    # 7. 求解
    # ───────────────────────────────────────────────
    solution = routing.SolveWithParameters(search_params)

    if solution is None:
        raise ValueError("找不到可行解，請確認時間窗與容量限制是否過於嚴苦")

    # ───────────────────────────────────────────────
    # 8. 解析結果
    # ───────────────────────────────────────────────
    routes = []
    total_distance = 0

    for vehicle_id in range(num_vehicles):
        index = routing.Start(vehicle_id)

        # 跳過空路線（車輛未被派遣）
        if routing.IsEnd(solution.Value(routing.NextVar(index))):
            continue

        stops = []
        route_distance = 0
        route_load = 0

        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            loc = data.locations[node]
            time_var = time_dimension.CumulVar(index)

            stops.append({
                "location_id": loc.id,
                "name": loc.name,
                "arrival_time": solution.Min(time_var),   # 抵達時間（秒）
                "demand": loc.demand,
            })

            route_load += loc.demand
            next_index = solution.Value(routing.NextVar(index))
            route_distance += routing.GetArcCostForVehicle(index, next_index, vehicle_id)
            index = next_index

        # 加上終點（depot）
        node = manager.IndexToNode(index)
        time_var = time_dimension.CumulVar(index)
        stops.append({
            "location_id": data.locations[node].id,
            "name": data.locations[node].name,
            "arrival_time": solution.Min(time_var),
            "demand": 0,
        })

        total_distance += route_distance
        routes.append({
            "vehicle_id": data.vehicles[vehicle_id].id,
            "stops": stops,
            "total_distance": route_distance,
            "total_load": route_load,
        })

    return {
        "status": "success",
        "total_distance": total_distance,
        "routes": routes,
    }