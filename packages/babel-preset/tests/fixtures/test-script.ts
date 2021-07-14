export default function memoize(): any {
  return function <T>(
    _target: {[key: string]: unknown},
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const {value: method} = descriptor;

    if (!method || !(method instanceof Function)) {
      return descriptor;
    }

    return {
      get: function get() {
        const newDescriptor = {
          configurable: true,
          value: () => 'foo',
        };

        Object.defineProperty(this, propertyKey, newDescriptor);
        return newDescriptor.value;
      },
    };
  };
}

class ExampleClass {
  @memoize()
  method() {
    return 'bar';
  }
}

(() => {
  const example = new ExampleClass();
  console.log(example.method());
})();
