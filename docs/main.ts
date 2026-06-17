import {
  clearWebGLGpuCache,
  detectWebGLGpuInfo,
  isHighEndDevice,
  WebGLGpuTier,
} from '../src/index'

type TierMeta = {
  label: string
  className: string
  description: string
}

const TIER_META: Record<WebGLGpuTier, TierMeta> = {
  [WebGLGpuTier.High]: {
    label: 'High',
    className: 'tier-high',
    description: '高端硬件 GPU，可启用高画质 WebGL 渲染。',
  },
  [WebGLGpuTier.Mid]: {
    label: 'Mid',
    className: 'tier-mid',
    description: '中端硬件 GPU，有真实显卡但未命中 high/low 规则。',
  },
  [WebGLGpuTier.Low]: {
    label: 'Low',
    className: 'tier-low',
    description: '低端硬件 GPU，建议保守降载。',
  },
  [WebGLGpuTier.Software]: {
    label: 'Software',
    className: 'tier-software',
    description: 'CPU 软件渲染，无硬件 GPU 加速。',
  },
  [WebGLGpuTier.Unknown]: {
    label: 'Unknown',
    className: 'tier-unknown',
    description: '无法获取 renderer 或非浏览器环境。',
  },
}

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return 'N/A'
  return String(value)
}

function formatBoolean(value: boolean) {
  return value
    ? '<span class="bool-yes">是</span>'
    : '<span class="bool-no">否</span>'
}

function createKvRows(rows: Array<{ label: string; value: string; mono?: boolean }>) {
  return rows
    .map(
      ({ label, value, mono }) => `
        <div class="kv-row">
          <dt>${label}</dt>
          <dd${mono ? ' class="mono"' : ''}>${value}</dd>
        </div>
      `,
    )
    .join('')
}

function renderGpuCard() {
  const gpu = detectWebGLGpuInfo()
  const tierMeta = TIER_META[gpu.tier]

  return `
    <section class="card span-all">
      <div class="tier-banner">
        <span class="tier-pill ${tierMeta.className}">${tierMeta.label}</span>
        <p class="tier-desc">${tierMeta.description}</p>
      </div>
      <dl class="kv-list">
        ${createKvRows([
          { label: 'Tier 值', value: gpu.tier, mono: true },
          { label: 'Renderer', value: formatValue(gpu.renderer), mono: true },
          { label: 'Max Texture Size', value: formatValue(gpu.maxTextureSize) },
          { label: '高端设备 (isHighEndDevice)', value: formatBoolean(isHighEndDevice()) },
        ])}
      </dl>
    </section>
  `
}

function renderDeviceCard() {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  const isIPad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

  return `
    <section class="card">
      <h2>设备信息</h2>
      <dl class="kv-list">
        ${createKvRows([
          { label: 'Platform', value: navigator.platform },
          { label: 'Hardware Concurrency', value: String(navigator.hardwareConcurrency) },
          { label: 'Device Memory (GB)', value: formatValue(nav.deviceMemory) },
          { label: 'Max Touch Points', value: String(navigator.maxTouchPoints) },
          { label: 'Pointer Coarse', value: formatBoolean(isCoarsePointer) },
          { label: 'iPad 伪装检测', value: formatBoolean(isIPad) },
        ])}
      </dl>
    </section>
  `
}

function renderEnvironmentCard() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return `
    <section class="card">
      <h2>环境与偏好</h2>
      <dl class="kv-list">
        ${createKvRows([
          { label: 'User Agent', value: navigator.userAgent, mono: true },
          { label: 'Document Hidden', value: formatBoolean(document.hidden) },
          { label: 'Prefers Reduced Motion', value: formatBoolean(reducedMotion) },
          { label: '检测时间', value: new Date().toLocaleString() },
        ])}
      </dl>
    </section>
  `
}

function render() {
  const app = document.getElementById('app')
  if (!app) return

  app.innerHTML = `${renderGpuCard()}${renderDeviceCard()}${renderEnvironmentCard()}`
}

document.getElementById('refresh')?.addEventListener('click', () => {
  clearWebGLGpuCache()
  render()
})

render()
