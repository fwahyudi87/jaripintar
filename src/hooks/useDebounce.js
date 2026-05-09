export default function useDebounce(fn, delay = 200) {
  let timer = null
  return (...args) => {
    if (timer) return
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}
