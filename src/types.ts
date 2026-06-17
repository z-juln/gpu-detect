/** WebGL GPU 性能档位，由 renderer 名称与 maxTextureSize 启发式判定 */
export enum WebGLGpuTier {
  /*
   * 软件渲染：无真实 GPU 硬件加速，由 CPU 模拟 WebGL。
   * 典型 renderer：SwiftShader、LLVMpipe、mesa offscreen；
   * 或浏览器无法创建 WebGL 上下文时也会归入此档。
   */
  Software = 'software',

  /*
   * 低端硬件 GPU：有真实显卡，但性能较弱或规格偏低。
   * 匹配老旧集显/移动 GPU（如 Intel HD、Mali-4、Adreno 3/4），
   * 或 maxTextureSize < 8192。
   */
  Low = 'low',

  /*
   * 中端硬件 GPU：能读到 renderer，但未命中 high/low 规则。
   * 属于"有硬件、型号未明确归类"的保守兜底档位，
   * 例如部分 Intel UHD 7/8、Mali-G5x、Adreno 5xx 等。
   */
  Mid = 'mid',

  /*
   * 高端硬件 GPU：型号信号明确为高性能设备。
   * 匹配 Apple M 系列、NVIDIA、AMD、Intel Arc/Iris Xe、
   * 高端 Adreno 6/7、Mali-G7 等。
   */
  High = 'high',

  /*
   * 未知：SSR 环境、或 WebGL 可用但无法获取 renderer 名称
   *（浏览器未暴露 WEBGL_debug_renderer_info）。
   */
  Unknown = 'unknown',
}

/** WebGL GPU 检测结果 */
export type WebGLGpuInfo = {
  /* 性能档位，见 WebGLGpuTier */
  tier: WebGLGpuTier
  /* GPU 渲染器名称，来自 UNMASKED_RENDERER_WEBGL；无法获取时为 null */
  renderer: string | null
  /* WebGL 支持的最大纹理边长（像素）；无法获取时为 null */
  maxTextureSize: number | null
}
