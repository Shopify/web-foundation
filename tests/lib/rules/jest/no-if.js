const {RuleTester} = require('eslint');
const rule = require('../../../../lib/rules/jest/no-if');

const ruleTester = new RuleTester({
  parser: require.resolve('babel-eslint'),
});

ruleTester.run('no-if', rule, {
  valid: [
    {
      code: `if(foo) {}`,
    },
    {
      code: `it('foo', () => {})`,
    },
    {
      code: `foo('bar', () => {
        if(baz) {}
      })`,
    },
    {
      code: `describe('foo', () => {
        if('bar') {}
      })`,
    },
    {
      code: `describe.skip('foo', () => {
        if('bar') {}
      })`,
    },
    {
      code: `describe('foo', () => {
        if('bar') {}
      })`,
    },
    {
      code: `xdescribe('foo', () => {
        if('bar') {}
      })`,
    },
    {
      code: `fdescribe('foo', () => {
        if('bar') {}
      })`,
    },
    {
      code: `describe('foo', () => {
        if('bar') {}
      })
      if('baz') {}
      `,
    },
    {
      code: `describe('foo', () => {
          afterEach(() => {
            if('bar') {}
          });
        })
      `,
    },
    {
      code: `describe('foo', () => {
          beforeEach(() => {
            if('bar') {}
          });
        })
      `,
    },
    {
      code: `const foo = bar ? foo : baz;`,
    },
    {
      code: `
      it('valid', () => {
        const values = something.map((thing) => {
          if (thing.isFoo) {
            return thing.foo
          } else {
            return thing.bar;
          }
        });

        expect(values).toStrictEqual(['foo']);
      });
      `,
    },
    {
      code: `
      describe('valid', () => {
        it('still valid', () => {
          const values = something.map((thing) => {
            if (thing.isFoo) {
              return thing.foo
            } else {
              return thing.bar;
            }
          });

          expect(values).toStrictEqual(['foo']);
        });
      });
      `,
    },
    {
      code: `
      describe('valid', () => {
        describe('still valid', () => {
          it('really still valid', () => {
            const values = something.map((thing) => {
              if (thing.isFoo) {
                return thing.foo
              } else {
                return thing.bar;
              }
            });

            expect(values).toStrictEqual(['foo']);
          });
        });
      });
      `,
    },
    {
      code: `it('foo', () => {
        const foo = bar(() => qux ? qux() : false);
      });
      `,
    },
  ],
  invalid: [
    {
      code: `it('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `it.skip('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `it.only('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `xit('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `fit('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `test('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `test.skip('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `test.only('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `xtest('foo', () => {
        if('bar') {}
      })`,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `describe('foo', () => {
        it('bar', () => {
          if('bar') {}
        })
      })`,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `describe('foo', () => {
        it('bar', () => {
          if('bar') {}
        })
        it('baz', () => {
          if('qux') {}
          if('quux') {}
        })
      })`,
      errors: [
        {
          messageId: 'noIf',
        },
        {
          messageId: 'noIf',
        },
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `it('foo', () => {
        callExpression()
        if ('bar') {}
      })
      `,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
    {
      code: `it('foo', () => {
        const foo = bar ? foo : baz;
      })
      `,
      errors: [
        {
          messageId: 'noConditional',
        },
      ],
    },
    {
      code: `it('foo', () => {
        const foo = bar ? foo : baz;
      })
      const foo = bar ? foo : baz;
      `,
      errors: [
        {
          messageId: 'noConditional',
        },
      ],
    },
    {
      code: `it('foo', () => {
        const foo = bar ? foo : baz;
        const anotherFoo = anotherBar ? anotherFoo : anotherBaz;
      })
      `,
      errors: [
        {
          messageId: 'noConditional',
        },
        {
          messageId: 'noConditional',
        },
      ],
    },
    {
      code: `
      describe('valid', () => {
        describe('still valid', () => {
          it('really still valid', () => {
            const values = something.map((thing) => {
              if (thing.isFoo) {
                return thing.foo
              } else {
                return thing.bar;
              }
            });

            if('invalid') {
              expect(values).toStrictEqual(['foo']);
            }
          });
        });
      });
      `,
      errors: [
        {
          messageId: 'noIf',
        },
      ],
    },
  ],
});