import { parseArgs } from '../cli';

test('parseArgs empty', () => {
  expect(parseArgs([])).toEqual({});
});

test('parseArgs long options', () => {
  expect(parseArgs(['--prefix-width', '40', '--num-width', '10'])).toEqual({ prefixWidth: 40, numWidth: 10 });
  expect(parseArgs(['--currency-column', '50', '--fixed-cjk-width'])).toEqual({
    currencyColumn: 50,
    fixedCJKWidth: true,
  });
});

test('parseArgs short options', () => {
  expect(parseArgs(['-w', '40', '-W', '10', '-c', '60'])).toEqual({
    prefixWidth: 40,
    numWidth: 10,
    currencyColumn: 60,
  });
});

test('parseArgs rejects bad input', () => {
  expect(() => parseArgs(['--nope'])).toThrow('unknown argument');
  expect(() => parseArgs(['-w'])).toThrow('invalid value');
});
