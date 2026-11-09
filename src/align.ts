// 移植自 Lencerf/vscode-beancount 的 Formatter.alignSingleLine
// https://github.com/Lencerf/vscode-beancount/blob/master/src/formatter.ts
import { getPrefixWidth } from './format';

// 账户名：大写字母开头且含冒号，用于判定这是否是一条 posting
const ACCOUNT_RE = /([A-Z][A-Za-z0-9\-]+)(:)/;
// 金额：必须带小数点，小数点即对齐锚点
const AMOUNT_RE = /([\-|\+]?)(?:\d|\d[\d,]*\d)(\.)/;

/**
 * 把金额的小数点对齐到指定列，与原扩展的 separatorColumn 行为一致。
 *
 * @param contents Beancount 内容
 * @param separatorColumn 小数点所在列，1 起算（原配置项同名，默认 50）
 * @param fixedCJKWidth 是否把 CJK aka 东亚字符按双宽计算
 */
export function alignSeparatorColumn(contents: string, separatorColumn: number, fixedCJKWidth?: boolean): string {
  // 列号 1 起算，转换为 0 起的下标
  const targetDotPosition = separatorColumn - 1;

  const aligned = contents.split('\n').map((line) => {
    if (!ACCOUNT_RE.test(line)) {
      return line;
    }
    const amount = AMOUNT_RE.exec(line);
    if (amount === null) {
      return line;
    }
    // 行首补一个非空白字符再 trim，从而保留缩进、只去掉金额前的原始空白
    const contentBefore = ('s' + line.substring(0, amount.index)).trim().substring(1);
    const whiteLength = targetDotPosition - getPrefixWidth(contentBefore, fixedCJKWidth) - (amount[0].length - 1);
    if (whiteLength <= 0) {
      return line;
    }
    return contentBefore + ' '.repeat(whiteLength) + amount[0] + line.substring(amount.index + amount[0].length);
  });

  return aligned.join('\n');
}
