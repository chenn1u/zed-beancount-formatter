import { alignSeparatorColumn } from '../align';
import { getPrefixWidth } from '../format';

const INPUT = `2025-02-06 * "S"
  Expenses:Food 200.00 CNY
  Assets:Cash
`;

test('小数点对齐到 separatorColumn 列', () => {
  const out = alignSeparatorColumn(INPUT, 30);
  const posting = out.split('\n')[1];
  expect(posting.indexOf('.')).toBe(29);
  expect(posting).toBe('  Expenses:Food           200.00 CNY');
});

test('没有金额的行原样保留', () => {
  const out = alignSeparatorColumn(INPUT, 30);
  expect(out.split('\n')[0]).toBe('2025-02-06 * "S"');
  expect(out.split('\n')[2]).toBe('  Assets:Cash');
});

test('fixedCJKWidth 按显示宽度对齐', () => {
  const input = '  Expenses:食品烟酒:毛豆 200.00 CNY\n';
  const line = alignSeparatorColumn(input, 30, true).split('\n')[0];
  expect(getPrefixWidth(line.slice(0, line.indexOf('.')), true)).toBe(29);
  // 6 个 CJK 字各占双宽，字符串下标比显示列少 6
  expect(line.indexOf('.')).toBe(23);
});

test('前缀过长时不压缩、保持原样', () => {
  const input = '  Expenses:AVeryVeryVeryLongAccountName 200.00 CNY\n';
  expect(alignSeparatorColumn(input, 10)).toBe(input);
});

test('没有账户名的行不参与对齐', () => {
  const input = '  200.00 CNY\n';
  expect(alignSeparatorColumn(input, 30)).toBe(input);
});
