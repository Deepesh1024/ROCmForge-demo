export const DEMO_RESPONSES = {
    parse: {
        status: "success",
        metrics: { loc: 38, complexity: "Medium", features_detected: ["__global__", "__shared__", "__syncthreads", "fmaxf"] },
        syntax_tree_id: "ast_8f29c1",
    },
    generate: {
        status: "success",
        hip_code: `// Auto-generated ROCm/HIP Code
#include <hip/hip_runtime.h>
#include <stdio.h>
#include <math.h>

#define TILE_SIZE 16

__global__ void fusedMatMul(float* A, float* B, float* C, int N) {
    int row = hipBlockIdx_y * TILE_SIZE + hipThreadIdx_y;
    int col = hipBlockIdx_x * TILE_SIZE + hipThreadIdx_x;
    
    __shared__ float sA[TILE_SIZE][TILE_SIZE];
    __shared__ float sB[TILE_SIZE][TILE_SIZE];
    
    float sum = 0.0f;
    
    for (int t = 0; t < (N + TILE_SIZE - 1) / TILE_SIZE; ++t) {
        if (row < N && t * TILE_SIZE + hipThreadIdx_x < N)
            sA[hipThreadIdx_y][hipThreadIdx_x] = A[row * N + t * TILE_SIZE + hipThreadIdx_x];
        else
            sA[hipThreadIdx_y][hipThreadIdx_x] = 0.0f;
            
        if (t * TILE_SIZE + hipThreadIdx_y < N && col < N)
            sB[hipThreadIdx_y][hipThreadIdx_x] = B[(t * TILE_SIZE + hipThreadIdx_y) * N + col];
        else
            sB[hipThreadIdx_y][hipThreadIdx_x] = 0.0f;
            
        __syncthreads();
        
        for (int k = 0; k < TILE_SIZE; ++k) {
            sum += sA[hipThreadIdx_y][k] * sB[k][hipThreadIdx_x];
        }
        __syncthreads();
    }
    
    if (row < N && col < N) {
        // Fused Activation (ReLU)
        C[row * N + col] = fmaxf(0.0f, sum);
    }
}`,
        reasoning_trace: [
            "[INFO] Starting deterministic parsing...",
            "[INFO] Analyzing AST and Control Flow Graph...",
            "[DETECT] CUDA core header `<cuda_runtime.h>` found.",
            "[REPLACE] Swapping with `<hip/hip_runtime.h>`.",
            "[DETECT] Block/Thread indices detected.",
            "[REPLACE] `blockIdx.x` -> `hipBlockIdx_x`, etc.",
            "[VERIFY] Checking __shared__ memory limits... 1024 bytes (OK).",
            "[VERIFY] Checking __syncthreads(...) compatibility... (OK).",
            "[DETECT] Math function `fmaxf` found. Validating ROCm math libs.",
            "[SUCCESS] Code safely generated. Ready for execution verification."
        ]
    },
    verify: {
        status: "success",
        metrics: {
            hardware_backend_used: "MI300X",
            cache_hit: true,
            cpu_reference_time_ms: 124.5,
            gpu_time_ms: 8.41,
            speedup_vs_cpu: 14.8,
            l2_norm: 1e-7,
            occupancy: 0.95,
            bandwidth_gbps: 4096.0,
            mfma_util: 0.88,
            execution_confidence: 96
        }
    }
};
