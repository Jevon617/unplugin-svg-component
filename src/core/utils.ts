export function debounce(fn: (...args: any) => void, delay: number) {
  let timer: NodeJS.Timeout

  return function (...args) {
    if (timer)
      clearTimeout(timer)

    timer = setTimeout(() => {
      fn.apply(this, args)
      clearTimeout(timer)
    }, delay)
  }
}
