# zed-beancount-formatter

Beancount file formatter for [Zed](https://zed.dev).

Zed's extension API cannot register formatters, so this project ships a stdin → stdout
CLI and plugs into Zed's built-in [external formatter](https://zed.dev/docs/configuring-languages) support.

## Install

```sh
git clone https://github.com/chenn1u/zed-beancount-formatter.git
cd zed-beancount-formatter
yarn install && yarn build
```

That is all you need — `out/cli.js` is a self-contained Node script.

Global install (puts `beancount-format` on your `PATH`):

```sh
npm install -g .
```

## Configure Zed

1. Install the `Beancount` extension from the Zed extension gallery (it registers `*.bean` / `*.beancount`).
2. Add a `languages` entry to `~/.config/zed/settings.json` (`cmd-,` → Open JSON Settings):

```jsonc
{
  "languages": {
    "Beancount": {
      "format_on_save": "on",
      "formatter": {
        "external": {
          "command": "node",
          // replace with the absolute path of out/cli.js
          "arguments": ["/path/to/zed-beancount-formatter/out/cli.js"]
        }
      }
    }
  }
}
```

With a global install the command becomes:

```jsonc
"formatter": {
  "external": {
    "command": "beancount-format",
    "arguments": []
  }
}
```

Format manually with `cmd-shift-i` (macOS) / `ctrl-shift-i` (Linux, Windows).

### Settings

All options are CLI flags, appended to `arguments`:

| Flag | Property | Description |
| --- | --- | --- |
| `-w`, `--prefix-width <n>` | prefixWidth | Use this prefix width instead of determining an optimal value automatically. |
| `-W`, `--num-width <n>` | numWidth | Use this width to render numbers instead of determining an optimal value. |
| `-c`, `--currency-column <n>` | currencyColumn | Align currencies in this column. |
| `--fixed-cjk-width` | fixedCJKWidth | Treat CJK aka East Asian characters as two letters wide. |

Example:

```jsonc
"arguments": ["/path/to/out/cli.js", "--fixed-cjk-width", "--currency-column", "60"]
```

Prefer to keep the settings in the project? Zed reads `.zed/settings.json` in the project root.

Note: if `beancount-language-server` is installed, the Beancount extension also attaches an LSP
that can format. Setting `"formatter": {"external": ...}` makes this formatter authoritative.

## Usage on the command line

```sh
bean-format < ledger.bean > formatted.bean
```

## Development

- [format.ts](src/format.ts) was rewritten from beancount's [format.py](https://github.com/beancount/beancount/blob/master/beancount/scripts/format.py)
- [cli.ts](src/cli.ts) is the stdin → stdout wrapper used by Zed
- `yarn test` runs the test cases copied from [format_test.py](https://github.com/beancount/beancount/blob/master/beancount/scripts/format_test.py)
- The test helper `helper.ts` depends on the `bean-format` command, so `beancount` must be installed with pip

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
