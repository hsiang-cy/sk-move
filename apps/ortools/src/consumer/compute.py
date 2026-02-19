from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import json

def solve_vrp(data):
    """求解VRP問題"""
    # 建立索引管理器和路徑模型
    manager = pywrapcp.RoutingIndexManager(
        len(data['distance_matrix']), 
        len(data['vehicles']), 
        data['depot']
    )
    routing = pywrapcp.RoutingModel(manager)
    
    # 時間回調函數（包含行駛時間 + 服務時間）
    def time_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        # 行駛時間 + 起點的服務時間
        travel_time = data['distance_matrix'][from_node][to_node]
        service_time = data['service_times'][from_node]
        return travel_time + service_time
    
    transit_callback_index = routing.RegisterTransitCallback(time_callback)
    
    # 設定時間維度（包含時間窗口約束）
    time_windows = data['time_windows']
    max_time = max([tw[1] for tw in time_windows])  # 最大結束時間
    
    routing.AddDimension(
        transit_callback_index,
        max_time,  # allow waiting time
        max_time,  # maximum time per vehicle
        False,     # Don't force start cumul to zero
        'Time'
    )
    time_dimension = routing.GetDimensionOrDie('Time')
    
    # 為每個地點設定時間窗口
    for location_idx, time_window in enumerate(time_windows):
        if location_idx == data['depot']:
            continue
        index = manager.NodeToIndex(location_idx)
        time_dimension.CumulVar(index).SetRange(time_window[0], time_window[1])
    
    # 為車輛的起點和終點設定時間
    depot_idx = data['depot']
    for vehicle_id in range(len(data['vehicles'])):
        start_index = routing.Start(vehicle_id)
        end_index = routing.End(vehicle_id)
        time_dimension.CumulVar(start_index).SetRange(
            time_windows[depot_idx][0], time_windows[depot_idx][1])
        time_dimension.CumulVar(end_index).SetRange(
            time_windows[depot_idx][0], time_windows[depot_idx][1])
    
    # 設定距離約束（最長行駛距離限制）
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]
    
    distance_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(distance_callback_index)
    
    for vehicle_id, vehicle in enumerate(data['vehicles']):
        if vehicle['max_distance'] > 0:
            routing.AddDimension(
                distance_callback_index,
                0,  # no slack
                vehicle['max_distance'],  # vehicle maximum travel distance
                True,  # start cumul to zero
                f'Distance_{vehicle_id}'
            )
    
    # 設定載貨量約束
    if data.get('demands'):
        def demand_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            return data['demands'][from_node]
        
        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        
        # 為每台車設定不同的載貨量限制
        vehicle_capacities = [vehicle['capacity'] for vehicle in data['vehicles']]
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,  # null capacity slack
            vehicle_capacities,  # vehicle maximum capacities
            True,  # start cumul to zero
            'Capacity'
        )
    
    # 設定搜尋參數
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH)
    search_parameters.time_limit.seconds = 30
    
    # 求解
    solution = routing.SolveWithParameters(search_parameters)
    
    if solution:
        # 建立結果字典
        result = {
            "status": "success",
            "total_distance": solution.ObjectiveValue(),
            "routes": []
        }
        
        # 提取每台車的路徑
        time_dimension = routing.GetDimensionOrDie('Time')
        
        for vehicle_id, vehicle in enumerate(data['vehicles']):
            index = routing.Start(vehicle_id)
            route_distance = 0
            route_load = 0
            route_nodes = []
            route_times = []
            
            while not routing.IsEnd(index):
                node = manager.IndexToNode(index)
                time_var = time_dimension.CumulVar(index)
                arrival_time = solution.Value(time_var)
                
                route_nodes.append(node)
                route_times.append({
                    "location": node,
                    "arrival_time": arrival_time,
                    "service_time": data['service_times'][node],
                    "departure_time": arrival_time + data['service_times'][node],
                    "time_window": data['time_windows'][node],
                    "location_name": data.get('location_names', {}).get(node, f"地點{node}")
                })
                
                # 計算載貨量
                if data.get('demands'):
                    route_load += data['demands'][node]
                
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                route_distance += data['distance_matrix'][manager.IndexToNode(previous_index)][manager.IndexToNode(index)]
            
            # 加入最後回到倉庫的節點
            final_node = manager.IndexToNode(index)
            final_time_var = time_dimension.CumulVar(index)
            final_arrival_time = solution.Value(final_time_var)
            
            route_nodes.append(final_node)
            route_times.append({
                "location": final_node,
                "arrival_time": final_arrival_time,
                "service_time": data['service_times'][final_node],
                "departure_time": final_arrival_time + data['service_times'][final_node],
                "time_window": data['time_windows'][final_node],
                "location_name": data.get('location_names', {}).get(final_node, f"地點{final_node}")
            })
            
            route_info = {
                "vehicle_id": vehicle_id + 1,
                "vehicle_info": {
                    "license_plate": vehicle['license_plate'],
                    "vehicle_type": vehicle['vehicle_type'],
                    "capacity": vehicle['capacity'],
                    "max_distance": vehicle['max_distance']
                },
                "route": route_nodes,
                "route_details": route_times,
                "distance": route_distance,
                "total_time": final_arrival_time + data['service_times'][final_node],
                "load": route_load if data.get('demands') else 0,
                "capacity_utilization": f"{(route_load / vehicle['capacity'] * 100):.1f}%" if data.get('demands') and vehicle['capacity'] > 0 else "N/A"
            }
            
            result["routes"].append(route_info)
        
        # 輸出JSON
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return True
    else:
        error_result = {
            "status": "error",
            "message": "無法找到解決方案"
        }
        print(json.dumps(error_result, ensure_ascii=False, indent=2))
        return False
