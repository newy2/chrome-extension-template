export function setupCounter(element: HTMLButtonElement) {
  console.log("content")
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}

const value = "content";
console.log(value);
setupCounter(document.querySelector("button") as HTMLButtonElement);