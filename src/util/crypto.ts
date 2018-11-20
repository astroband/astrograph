import crypto from "crypto";

export function makeKey(...args: any[]): string {
  const h = crypto.createHash("sha256");
  args.forEach(value => h.update(`${value.toString()}:`));
  return h.digest("hex");
}
