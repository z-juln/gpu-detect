# gpu-detect

基于 WebGL 的浏览器 GPU 档位检测库，从 Unicorn 渲染性能优化逻辑中抽离。

## demo

在线演示：[https://z-juln.github.io/gpu-detect/](https://z-juln.github.io/gpu-detect/)

本地预览：

```bash
yarn preview:demo
```

## install

```bash
npm i gpu-detect
```

## use

```typescript
import { detectWebGLGpuInfo, isHighEndDevice, WebGLGpuTier } from 'gpu-detect'

const gpu = detectWebGLGpuInfo()
// {
//   tier: WebGLGpuTier.High,
//   renderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M1, ...)',
//   maxTextureSize: 16384,
// }

if (gpu.tier === WebGLGpuTier.High) {
  // 启用高画质 WebGL 渲染
}

if (isHighEndDevice()) {
  // 等价于 gpu.tier === WebGLGpuTier.High
}
```

## API


| 导出                     | 说明                                      |
| ---------------------- | --------------------------------------- |
| `detectWebGLGpuInfo()` | 检测 GPU 档位、渲染器名称、最大纹理尺寸（结果缓存）            |
| `isHighEndDevice()`    | `tier === WebGLGpuTier.High` 时返回 `true` |
| `clearWebGLGpuCache()` | 清除缓存，用于测试                               |
| `WebGLGpuTier`         | GPU 档位枚举                                |
| `WebGLGpuInfo`         | 检测结果类型                                  |


## WebGLGpuTier 档位说明

### `WebGLGpuTier.Software`（`'software'`）

CPU 软件渲染，无真实 GPU 硬件加速。典型 renderer 包括 SwiftShader、LLVMpipe、mesa offscreen；浏览器无法创建 WebGL 上下文时也会归入此档。WebGL 性能最差，建议重度降载或禁用 WebGL 特效。

### `WebGLGpuTier.Low`（`'low'`）

低端硬件 GPU：有真实显卡，但性能较弱或规格偏低。匹配老旧集显/移动 GPU（如 Intel HD、Mali-4、Adreno 3/4、PowerVR），或 `maxTextureSize < 8192`。建议保守降载。

### `WebGLGpuTier.Mid`（`'mid'`）

中端硬件 GPU：能读到 renderer，但未命中 high/low 规则。属于"有硬件、型号未明确归类"的兜底档位，例如部分 Intel UHD 7/8、Mali-G5x、Adreno 5xx。性能介于 low 与 high 之间，规则上通常按保守策略处理。

### `WebGLGpuTier.High`（`'high'`）

高端硬件 GPU：型号信号明确为高性能设备。匹配 Apple M 系列、NVIDIA、AMD、Intel Arc/Iris Xe、高端 Adreno 6/7、Mali-G7 等。可启用高画质 WebGL 渲染。

### `WebGLGpuTier.Unknown`（`'unknown'`）

未知档位：SSR 环境、或 WebGL 可用但无法获取 renderer 名称（浏览器未暴露 `WEBGL_debug_renderer_info`）。建议按保守策略处理。

## WebGLGpuInfo 字段


| 字段               | 类型              | 说明                                |
| ---------------- | --------------- | --------------------------------- |
| `tier`           | `WebGLGpuTier`  | 性能档位                              |
| `renderer`       | `string | null` | GPU 渲染器名称；无法获取时为 `null`           |
| `maxTextureSize` | `number | null` | WebGL 支持的最大纹理边长（像素）；无法获取时为 `null` |


