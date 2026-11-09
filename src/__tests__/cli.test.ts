import { formatText, normalizeOutput, parseArgs } from '../cli';

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

test('parseArgs separatorColumn', () => {
  expect(parseArgs(['-s', '50', '--fixed-cjk-width'])).toEqual({ separatorColumn: 50, fixedCJKWidth: true });
  expect(parseArgs(['--separator-column', '60'])).toEqual({ separatorColumn: 60 });
});

test('parseArgs rejects bad input', () => {
  expect(() => parseArgs(['--nope'])).toThrow('unknown argument');
  expect(() => parseArgs(['-w'])).toThrow('invalid value');
});

test('parseArgs in place 需要文件', () => {
  expect(() => parseArgs(['-i'])).toThrow('requires at least one file');
  expect(parseArgs(['-i', 'a.bean', 'b.bean'])).toEqual({ inPlace: true, files: ['a.bean', 'b.bean'] });
});

test('parseArgs 单个文件不加 -i 也能识别', () => {
  expect(parseArgs(['-c', '80', 'a.bean'])).toEqual({ currencyColumn: 80, files: ['a.bean'] });
});

test('parseArgs --help', () => {
  expect(parseArgs(['--help'])).toEqual({ help: true });
  expect(parseArgs(['-h'])).toEqual({ help: true });
});

test('formatText 按选项切换对齐算法', () => {
  const input = '  Expenses:Food 200.00 CNY\r\n';
  // 默认 bean-format 语义：货币列
  expect(formatText(input, { currencyColumn: 30 })).not.toContain('\r');
  // separator 语义：小数点对齐
  const aligned = formatText(input, { separatorColumn: 20 });
  expect(aligned.indexOf('.')).toBe(19);
});

test('normalizeOutput 保留输入的结尾换行状态，并清掉多余空行', () => {
  const opts = { currencyColumn: 80, fixedCJKWidth: true };
  const body = '2025-01-01 * "x"\n  Expenses:Food 1.00 CNY\n  Assets:Cash';

  // 输入无结尾换行 -> 输出也不补
  expect(normalizeOutput(formatText(body, opts), false).endsWith('\n')).toBe(false);
  // 输入有 1 个 -> 保留 1 个
  const one = normalizeOutput(formatText(body + '\n', opts), true);
  expect(one.endsWith('\n')).toBe(true);
  expect(one.endsWith('\n\n')).toBe(false);
  // 输入多个 -> 只留 1 个
  const many = normalizeOutput(formatText(body + '\n\n\n', opts), true);
  expect(many).toBe(one);
  // 幂等
  expect(normalizeOutput(formatText(one, opts), true)).toBe(one);
  expect(normalizeOutput('', true)).toBe('');
});
