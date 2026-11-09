# Change Log

All notable changes to the "zed-beancount-formatter" extension will be documented in this file.

## [Unreleased]

本版本只做格式化，不再包含任何语言服务器／补全相关功能。

- 收紧空行：记录之间保证恰好一个空行（连续空行压成一个、缺失的补上），
  文件首尾不留空行；判断依据是「列 0 开始的日期行」，posting / 元数据 /
  缩进注释不论有多少行都算同一条记录，不会被拆开
- 新增 `-i` / `--in-place`：原地格式化文件（临时文件 + rename，可重复执行）；
  不带 `-i` 时可直接把文件路径当参数，结果输出到 stdout
- 修复：输出末尾换行被重复追加，导致每次格式化多出一行空行（对 Zed 的
  format-on-save 是致命缺陷）
- 新增 `-s` / `--separator-column`：移植 Lencerf/vscode-beancount 的小数点对齐算法

## [1.5.0] - 2025-02-08

- Support arithmetic expression as amount #21, thanks [@silverwzw](https://github.com/silverwzw)

## [1.4.2] - 2021-07-07

- bugfix#19, thanks [@whusnoopy](https://github.com/whusnoopy)

## [1.4.1] - 2021-07-05

- Add option doc for `fixedCJKWidth`

## [1.4.0] - 2021-07-05

- #18, Add option `fixedCJKWidth` to treat CJK aka East Asian characters as two letters width.

## [1.3.2] - 2020-01-12

- #8, `CURRENCY_RE` should full match line.

## [1.3.1] - 2020-01-11

- Fix #8, string repeat a negative number.

## [1.3.0] - 2020-01-09

- Big change, the extension do not require `beancount` anymore.

## [1.2.3] - 2020-01-07

- Fix get workspace path error

## [1.2.2] - 2020-01-07

- Add more console log for error message

## [1.2.1] - 2020-01-05

- Fix command not found when using remote-wsl

## [1.2.0] - 2019-08-09

- Added more customization options

## [1.1.1] - 2019-01-30

- add changelog

## [1.1.0] - 2019-01-30

- bugfix, replace `cr` and `crlf` with `lf`

## [1.0.0] - 2019-01-30

- Initial release
