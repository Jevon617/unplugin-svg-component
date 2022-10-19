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

export function replace(dts: string, symbolIds: Set<string>, componentName: string) {
  return dts.replace(
    /\$svg_symbolIds/g,
    Array.from(symbolIds).join('" | "'),
  ).replace(
    /\$component_name/g,
    componentName,
  )
}
