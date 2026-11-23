package lk.nipo.itams.assets.controller;

import jakarta.validation.Valid;
import lk.nipo.itams.assets.dto.AssetRequest;
import lk.nipo.itams.assets.dto.AssetResponse;
import lk.nipo.itams.assets.service.AssetService;
import lk.nipo.itams.common.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
public class AssetController {
    private final AssetService service;
    public AssetController(AssetService service) { this.service = service; }

    @GetMapping
    public ApiResponse<Page<AssetResponse>> list(@RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) String status, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "updatedAt") String sort,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        if (page < 0 || size < 1 || size > 100) throw new IllegalArgumentException("Page must be >= 0 and size must be between 1 and 100");
        if (!java.util.Set.of("updatedAt", "assetCode", "assetName", "purchaseDate", "status").contains(sort))
            throw new IllegalArgumentException("Unsupported sort field");
        Page<AssetResponse> result = service.list(search, status, PageRequest.of(page, size, Sort.by(direction, sort))).map(AssetResponse::from);
        return ApiResponse.ok("Assets loaded", result);
    }

    @GetMapping("/{id}")
    public ApiResponse<AssetResponse> get(@PathVariable Long id) { return ApiResponse.ok("Asset loaded", AssetResponse.from(service.get(id))); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AssetResponse> create(@Valid @RequestBody AssetRequest request) {
        return ApiResponse.ok("Asset created successfully", AssetResponse.from(service.create(request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<AssetResponse> update(@PathVariable Long id, @Valid @RequestBody AssetRequest request) {
        return ApiResponse.ok("Asset updated successfully", AssetResponse.from(service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<AssetResponse> retire(@PathVariable Long id) {
        return ApiResponse.ok("Asset retired successfully", AssetResponse.from(service.retire(id)));
    }
}
