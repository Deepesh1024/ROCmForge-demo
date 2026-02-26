export const CODE_EXAMPLES = [
    {
        id: 'pytorch_fused_matmul',
        title: 'PyTorch Fused Matmul (Research Kernel)',
        code: `// Preloaded CUDA Fused Matmul example
#include <cuda_runtime.h>
#include <stdio.h>

#define TILE_SIZE 16

__global__ void fusedMatMul(float* A, float* B, float* C, int N) {
    int row = blockIdx.y * TILE_SIZE + threadIdx.y;
    int col = blockIdx.x * TILE_SIZE + threadIdx.x;
    
    __shared__ float sA[TILE_SIZE][TILE_SIZE];
    __shared__ float sB[TILE_SIZE][TILE_SIZE];
    
    float sum = 0.0f;
    
    for (int t = 0; t < (N + TILE_SIZE - 1) / TILE_SIZE; ++t) {
        if (row < N && t * TILE_SIZE + threadIdx.x < N)
            sA[threadIdx.y][threadIdx.x] = A[row * N + t * TILE_SIZE + threadIdx.x];
        else
            sA[threadIdx.y][threadIdx.x] = 0.0f;
            
        if (t * TILE_SIZE + threadIdx.y < N && col < N)
            sB[threadIdx.y][threadIdx.x] = B[(t * TILE_SIZE + threadIdx.y) * N + col];
        else
            sB[threadIdx.y][threadIdx.x] = 0.0f;
            
        __syncthreads();
        
        for (int k = 0; k < TILE_SIZE; ++k) {
            sum += sA[threadIdx.y][k] * sB[k][threadIdx.x];
        }
        __syncthreads();
    }
    
    if (row < N && col < N) {
        C[row * N + col] = fmaxf(0.0f, sum);
    }
}`
    },
    {
        id: 'tiled_gemm',
        title: 'Tiled GEMM 1024×1024 FP16',
        code: `// Tiled GEMM 1024x1024 FP16
#include <cuda_fp16.h>

__global__ void gemm_fp16(half* A, half* B, half* C, int M, int N, int K) {
    // simplified for demo
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < M * N) {
        C[idx] = __float2half(0.0f);
    }
}`
    },
    {
        id: 'wavefront_reduction',
        title: 'Wavefront Reduction (Sum)',
        code: `// Wavefront Reduction (Sum)
__inline__ __device__ float warpReduceSum(float val) {
    for (int offset = warpSize/2; offset > 0; offset /= 2) 
        val += __shfl_down_sync(0xffffffff, val, offset);
    return val;
}

__global__ void reduceSum(float *d_in, float *d_out, int N) {
    float sum = 0.0f;
    for(int i = blockIdx.x * blockDim.x + threadIdx.x; i < N; i += blockDim.x * gridDim.x) {
        sum += d_in[i];
    }
    sum = warpReduceSum(sum);
    // ...
}`
    },
    {
        id: 'fused_elementwise',
        title: 'Fused Element-wise + ReLU',
        code: `// Fused Element-wise + ReLU
__global__ void add_relu(float* a, float* b, float* c, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        float val = a[idx] + b[idx];
        c[idx] = val > 0.0f ? val : 0.0f;
    }
}`
    }
];
