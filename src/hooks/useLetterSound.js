export default function useLetterSound() {
  return (text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text.toLowerCase())
    utter.lang = 'id-ID'
    utter.rate = 0.7
    utter.pitch = 1.3
    window.speechSynthesis.speak(utter)
  }
}
