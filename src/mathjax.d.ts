interface Window {
  MathJax?: {
    typesetPromise?: (elements: HTMLElement[]) => Promise<void>
  }
}
