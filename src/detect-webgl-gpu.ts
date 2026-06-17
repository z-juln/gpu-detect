import { WebGLGpuTier, type WebGLGpuInfo } from './types'

let cachedWebGLGpuInfo: WebGLGpuInfo | null = null

const UNKNOWN_GPU_INFO: WebGLGpuInfo = {
  tier: WebGLGpuTier.Unknown,
  renderer: null,
  maxTextureSize: null,
}

const SOFTWARE_GPU_INFO: WebGLGpuInfo = {
  tier: WebGLGpuTier.Software,
  renderer: null,
  maxTextureSize: null,
}

function classifyGpuTier(renderer: string | null, maxTextureSize: number): WebGLGpuTier {
  const rendererLower = renderer?.toLowerCase() ?? ''

  if (/swiftshader|llvmpipe|software|mesa offscreen/.test(rendererLower)) {
    return WebGLGpuTier.Software
  }

  if (
    /intel hd|intel uhd 6|mali-4|mali-t[67]|adreno \(tm\) 3|adreno \(tm\) 4|adreno 3|adreno 4|powervr/.test(
      rendererLower,
    ) ||
    maxTextureSize < 8192
  ) {
    return WebGLGpuTier.Low
  }

  if (
    /apple m|apple gpu|nvidia|amd|radeon|adreno \(tm\) 6|adreno \(tm\) 7|adreno 6|adreno 7|mali-g7|intel arc|intel iris xe/.test(
      rendererLower,
    )
  ) {
    return WebGLGpuTier.High
  }

  if (renderer) {
    return WebGLGpuTier.Mid
  }

  return WebGLGpuTier.Unknown
}

/* 清除检测结果缓存，主要用于测试 */
export function clearWebGLGpuCache() {
  cachedWebGLGpuInfo = null
}

/*
 * 通过 WebGL 检测 GPU 档位与渲染器信息。
 * 优先使用 failIfMajorPerformanceCaveat 排除性能陷阱上下文；
 * 结果在页面生命周期内缓存，重复调用返回同一对象。
 */
export function detectWebGLGpuInfo(): WebGLGpuInfo {
  if (cachedWebGLGpuInfo) return cachedWebGLGpuInfo

  if (typeof document === 'undefined') {
    cachedWebGLGpuInfo = UNKNOWN_GPU_INFO
    return cachedWebGLGpuInfo
  }

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1

  const gl =
    canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) ??
    canvas.getContext('webgl') ??
    canvas.getContext('experimental-webgl')

  if (!gl || !(gl instanceof WebGLRenderingContext)) {
    cachedWebGLGpuInfo = SOFTWARE_GPU_INFO
    return cachedWebGLGpuInfo
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  const renderer = debugInfo ? (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string) : null
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
  const tier = classifyGpuTier(renderer, maxTextureSize)

  cachedWebGLGpuInfo = { tier, renderer, maxTextureSize }
  return cachedWebGLGpuInfo
}

/* 仅当 tier 为 WebGLGpuTier.High 时返回 true */
export function isHighEndDevice() {
  return detectWebGLGpuInfo().tier === WebGLGpuTier.High
}
