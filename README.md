# zed-beancount-formatter

Beancount file formatter for [Zed](https://zed.dev) and its forks.

Zed's extension API cannot register formatters, so this project ships a small CLI that reads stdin and
writes stdout, and plugs into Zed's built-in
[external formatter](https://zed.dev/docs/configuring-languages) support. Language support itself comes
from the `Beancount` extension in the Zed gallery.

## Install

```sh
git clone https://github.com/chenn1u/zed-beancount-formatter.git
cd zed-beancount-formatter
yarn install && yarn build
```

`out/cli.js` is then self-contained — no runtime dependencies.

Optional, to get a `beancount-format` command on your `PATH`:

```sh
npm install -g .
```

## Configure Zed

1. Install the `Beancount` extension from the Zed gallery (it registers `*.bean` / `*.beancount`).
2. Add a `languages` entry to your settings file (`cmd-,` → Open JSON Settings). Zed uses
   `~/.config/zed/settings.json`; forks use their own directory, e.g. `~/.config/wu/settings.json`.

```jsonc
{
  "languages": {
    "Beancount": {
      "format_on_save": "on",
      "formatter": {
        "external": {
          "command": "node",
          // absolute path of out/cli.js
          "arguments": ["/path/to/zed-beancount-formatter/out/cli.js", "-c", "80", "--fixed-cjk-width"]
        }
      }
    }
  }
}
```

With a global install the command becomes `"command": "beancount-format", "arguments": ["-c", "80", "--fixed-cjk-width"]`.

Format manually with `cmd-shift-i` (macOS) / `ctrl-shift-i` (Linux, Windows). Project-local settings go in
`.zed/settings.json` instead of the global file.

## Settings

All options are CLI flags, appended to `arguments`:

| Flag | Description |
| --- | --- |
| `-c`, `--currency-column <n>` | Align currencies in this column. |
| `-w`, `--prefix-width <n>` | Use this account-name width instead of picking a value from the file. |
| `-W`, `--num-width <n>` | Use this amount width instead of picking a value from the file. |
| `-s`, `--separator-column <n>` | Switch to decimal-separator alignment at this column (see below). |
| `--fixed-cjk-width` | Treat CJK aka East Asian characters as two columns wide. |
| `-i`, `--in-place` | Rewrite the given files instead of printing to stdout. |

There are two alignment styles and you pick one:

- **default** — beancount's `format.py` semantics: account names padded, amounts right-aligned, currencies
  lined up at `-c`.
- **`-s`** — decimal points lined up at a fixed column instead. This is the algorithm of
  [Lencerf/vscode-beancount](https://github.com/Lencerf/vscode-beancount)'s `separatorColumn`, and it
  overrides `-c` / `-w` / `-W`.

`--fixed-cjk-width` applies to both.

## Strict blank lines

Whatever the formatter emits is tightened up before it is written back:

- exactly one blank line **between** records: runs of blank lines are collapsed to one, and a missing
  blank line is inserted
- no blank lines at the start or the end of the file
- a file that ends without a final newline keeps it that way

A record is anything that starts at column 0 with a date. Every indented line below it — however many
postings, metadata fields and indented comments — belongs to that record, so a transaction is never split
regardless of its length. A top-level `;` comment directly above a record stays attached to it, and
`include` / `option` / `plugin` lines are left adjacent.

The result is idempotent: formatting twice yields the same bytes.

```
2026-10-03 * "京东" "三餐"
    Expenses:Food:三餐                                                   21.42 CNY
    Liabilities:CreditCard:支付白

2026-10-03 * "充电桩" "充电"
    Expenses:Daily:充电                                                   0.71 CNY
    Liabilities:CreditCard:支付白
```

## Command line

Without file arguments the CLI reads stdin and writes stdout, which is what the editor calls.

```sh
# preview: nothing is written
beancount-format -c 80 --fixed-cjk-width < ledger.bean
beancount-format -c 80 --fixed-cjk-width ledger.bean > /tmp/preview.bean && diff ledger.bean /tmp/preview.bean

# rewrite in place (temp file + rename, safe to repeat)
beancount-format -i -c 80 --fixed-cjk-width ledger.bean account/*.bean

# whole journal
cd ~/Projects/Beancount && beancount-format -i -c 80 --fixed-cjk-width $(git ls-files '*.bean')
```

Without a global install, call the script directly:

```sh
node /path/to/zed-beancount-formatter/out/cli.js -i -c 80 --fixed-cjk-width ledger.bean
```

Never write `beancount-format ledger.bean > ledger.bean` — the shell truncates the file before the command
runs. Use `-i`.

## Development

| File | Purpose |
| --- | --- |
| [src/format.ts](src/format.ts) | Port of beancount's [format.py](https://github.com/beancount/beancount/blob/master/beancount/scripts/format.py) |
| [src/align.ts](src/align.ts) | Decimal-separator alignment (`-s`), ported from [Lencerf/vscode-beancount](https://github.com/Lencerf/vscode-beancount/blob/master/src/formatter.ts) |
| [src/tidy.ts](src/tidy.ts) | Blank-line rules |
| [src/cli.ts](src/cli.ts) | Argument parsing, stdin/stdout and in-place handling |

`yarn build`, `yarn test`, `yarn lint`. The tests in `format.test.ts` compare against the real
`bean-format` command, so `beancount` must be installed for those to pass.

## License

The MIT License (MIT)

Copyright (c) 2025 dongfg <mail@dongfg.com> (https://dongfg.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
