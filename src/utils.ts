export function stripSlashes(str) {
  return str.replace(/(^\/)/, '').replace(/(\/$)/, '')
}

export const snakeCaseToTitle = (str) =>
  str
    .split('_')
    .map(
      (item) =>
        item.charAt(0).toUpperCase() +
        (item.substring(1) === 'DSP' ? item.substring(1).toUpperCase() : item.substring(1)),
    )
    .join(' ')
