package lk.nipo.itams.dashboard.controller;

import lk.nipo.itams.assets.repository.AssetRepository;
import lk.nipo.itams.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final AssetRepository assets;
    public DashboardController(AssetRepository assets) { this.assets = assets; }

    @GetMapping("/summary")
    public ApiResponse<Map<String, Long>> summary() {
        long total = assets.count();
        return ApiResponse.ok("Dashboard summary loaded", Map.of(
                "totalAssets", total,
                "activeAssets", assets.countByStatus("ACTIVE"),
                "availableAssets", assets.countByStatus("AVAILABLE"),
                "assignedAssets", assets.countByStatus("ASSIGNED"),
                "underMaintenance", assets.countByStatus("UNDER_MAINTENANCE"),
                "retiredAssets", assets.countByStatus("RETIRED")));
    }
}
