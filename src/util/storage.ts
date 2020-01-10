export function buildDocumentId(
  ledgerSeq: number,
  txIndex: number = 0,
  opIndex: number = 0,
  effectGroup: number = 0,
  effectIndex: number = 0
): string {
  const parts = Array.from(arguments);

  if (parts.length !== 5) {
    parts.push(...Array(5 - parts.length).fill(0));
  }

  return parts
    .map((arg, i) => {
      arg = arg.toString();
      return i === 0 ? arg.padStart(12, "0") : arg.padStart(4, "0");
    })
    .join("-");
}
