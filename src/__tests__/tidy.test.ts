import { tidyBlankLines } from '../tidy';

test('相邻的两条记录之间补一个空行', () => {
  const input = '2026-10-03 * "a"\n    A:B 1.00 CNY\n    C:D\n2026-10-04 * "b"\n    A:B 2.00 CNY';
  expect(tidyBlankLines(input)).toBe(
    '2026-10-03 * "a"\n    A:B 1.00 CNY\n    C:D\n\n2026-10-04 * "b"\n    A:B 2.00 CNY',
  );
});

test('记录行数不固定：多 posting、元数据、注释都算同一条记录', () => {
  const input = [
    '2026-10-03 * "a" "多腿交易"',
    '    A:B 1.00 CNY',
    '    A:C 2.00 CNY',
    '    A:D -3.00 CNY',
    '    key: "metadata"',
    '    ; 缩进注释',
    '    A:E 0.10 CNY',
    '2026-10-04 * "b"',
    '    A:B 2.00 CNY',
  ].join('\n');
  const result = tidyBlankLines(input);
  // 只在第 8 行的下一条记录前补空行，记录内部一处都不插
  expect(result.split('\n')).toEqual([
    '2026-10-03 * "a" "多腿交易"',
    '    A:B 1.00 CNY',
    '    A:C 2.00 CNY',
    '    A:D -3.00 CNY',
    '    key: "metadata"',
    '    ; 缩进注释',
    '    A:E 0.10 CNY',
    '',
    '2026-10-04 * "b"',
    '    A:B 2.00 CNY',
  ]);
});

test('紧贴记录上方的顶层注释不插空行', () => {
  const input = '2026-10-03 * "a"\n    A:B 1.00 CNY\n; 说明\n2026-10-04 * "b"\n    A:B 2.00 CNY';
  expect(tidyBlankLines(input)).toBe('2026-10-03 * "a"\n    A:B 1.00 CNY\n; 说明\n2026-10-04 * "b"\n    A:B 2.00 CNY');
});

test('连续空行压成一个', () => {
  const input = '2026-10-03 * "a"\n    A:B 1.00 CNY\n\n\n\n2026-10-04 * "b"\n    A:B 2.00 CNY';
  expect(tidyBlankLines(input)).toBe('2026-10-03 * "a"\n    A:B 1.00 CNY\n\n2026-10-04 * "b"\n    A:B 2.00 CNY');
});

test('include / option / plugin 之间不插空行', () => {
  const input = 'include "a.bean"\ninclude "b.bean"\noption "title" "x"\nplugin "p"';
  expect(tidyBlankLines(input)).toBe(input);
});

test('配置块与紧随其后的记录之间补空行', () => {
  const input = 'include "a.bean"\n2026-10-03 * "a"\n    A:B 1.00 CNY';
  expect(tidyBlankLines(input)).toBe('include "a.bean"\n\n2026-10-03 * "a"\n    A:B 1.00 CNY');
});

test('文件首尾空行全部删除', () => {
  expect(tidyBlankLines('\n\n2026-10-03 * "a"\n\n\n')).toBe('2026-10-03 * "a"');
});

test('只有空白的行也按空行处理', () => {
  expect(tidyBlankLines('a\n   \n\t\n\nb')).toBe('a\n\nb');
});

test('幂等：再跑一次结果不变', () => {
  const input = '2026-10-03 * "a"\n    A:B 1.00 CNY\n2026-10-04 * "b"\n    A:B 2.00 CNY\n\n\n';
  const once = tidyBlankLines(input);
  expect(tidyBlankLines(once)).toBe(once);
});

test('空输入与纯空行', () => {
  expect(tidyBlankLines('')).toBe('');
  expect(tidyBlankLines('\n\n\n')).toBe('');
});
