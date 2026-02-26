export const CUDA_EXAMPLE = `// Preloaded CUDA Fused Matmul example
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
        // Fused Activation (ReLU)
        C[row * N + col] = fmaxf(0.0f, sum);
    }
}`;
