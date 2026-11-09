// 顶层记录起始行：列 0 开始、以日期开头。它后面跟多少条 posting、元数据都算同一条记录。
const RECORD_START_RE = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/;

/** 顶层注释：列 0 开始的 `;` 行，语义上属于紧跟其后的记录 */
function isTopLevelComment(line: string): boolean {
  return line === line.trimStart() && line.trimStart().startsWith(';');
}

/** 列 0 开始的行（记录、指令、注释）；缩进行都是上一条记录的从属内容 */
function isTopLevel(line: string): boolean {
  return line === line.trimStart();
}

/**
 * 收紧空行：
 * - 记录之间最多一个空行，连续空行压成一个
 * - 顶层带日期的记录前必须有且只有一个空行（本来没有就补上）
 * - 文件首尾不留空行
 *
 * 判断依据是「顶层行」而不是行数，所以一条记录有多少条 posting 都不影响结果。
 * 紧贴记录上方的顶层注释视为该记录的一部分，不会被空行隔开。
 *
 * @param text 已对齐的文本，结尾有无换行都可以
 */
export function tidyBlankLines(text: string): string {
  const kept: string[] = [];
  let pendingBlank = false;
  // 上一条保留行是否为顶层注释（若是，则下一条记录紧跟其后，不补空行）
  let prevWasTopLevelComment = false;

  for (const line of text.split('\n')) {
    if (line.trim() === '') {
      // 空行先挂起，确认后面还有内容才真正写出去（因此首尾空行自动消失）
      pendingBlank = true;
      continue;
    }

    if (kept.length > 0) {
      if (pendingBlank) {
        kept.push('');
      } else if (isTopLevel(line) && RECORD_START_RE.test(line) && !prevWasTopLevelComment) {
        // 新记录紧贴在上一条记录的最后一行之后，补一个空行
        kept.push('');
      }
    }

    kept.push(line);
    pendingBlank = false;
    prevWasTopLevelComment = isTopLevelComment(line);
  }

  return kept.join('\n');
}
