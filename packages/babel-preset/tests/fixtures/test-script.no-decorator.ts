export class ExampleClass {
  method() {
    return 'bar';
  }
}

(() => {
  const example = new ExampleClass();
  console.log(example.method());
})();
