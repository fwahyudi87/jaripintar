function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

function createWavBuffer(samples, sampleRate) {
  const numSamples = samples.length
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + numSamples * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, numSamples * 2, true)

  for (let i = 0; i < numSamples; i++) {
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, samples[i] * 32767)), true)
  }

  return buffer
}

function bufferToDataUri(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return 'data:audio/wav;base64,' + btoa(binary)
}

export function makeChimeDataUri() {
  const sampleRate = 44100
  const samples = []
  const noteDuration = 0.12
  const totalDuration = 0.32
  const numSamples = Math.floor(sampleRate * totalDuration)

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const freq = t < noteDuration ? 523 : 659
    const localT = t < noteDuration ? t : t - noteDuration
    const envelope = Math.min(1, (numSamples - i) / (sampleRate * 0.04)) * Math.min(1, i / (sampleRate * 0.005))
    let sample = Math.sin(2 * Math.PI * freq * localT) * envelope
    if (t >= noteDuration && t < noteDuration + 0.08) {
      sample += Math.sin(2 * Math.PI * 880 * (t - noteDuration)) * 0.3
    }
    samples.push(sample)
  }

  return bufferToDataUri(createWavBuffer(samples, sampleRate))
}

export function makeBoopDataUri() {
  const sampleRate = 44100
  const totalDuration = 0.2
  const numSamples = Math.floor(sampleRate * totalDuration)
  const samples = []

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const freq = 300 - (t / totalDuration) * 200
    const envelope = Math.min(1, (numSamples - i) / (sampleRate * 0.05)) * Math.min(1, i / (sampleRate * 0.005))
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.8
    samples.push(sample)
  }

  return bufferToDataUri(createWavBuffer(samples, sampleRate))
}
