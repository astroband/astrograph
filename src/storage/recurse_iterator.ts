export class RecurseIterator {
  private tree: any;
  private leafKey: string;
  private valueKey: string;

  constructor(tree: any, leafKey: string, valueKey: string) {
    this.tree = tree;
    this.leafKey = leafKey;
    this.valueKey = valueKey;
  }

  public find(matchFn: any): any | null {
    this.walk(this.tree[0], matchFn);
  }

  private walk(leaf: any, matchFn: any): any | null {
    if (!tree) {
      return null;
    }

    const value = tree[valueKey];

    if (value) {
      const match = matchFn(value);

      if (match) {
        return match;
      }
    }

    const nextLeaf = leaf[this.leafKey] ? leaf[this.leafKey][0] : null;

    if (nextLeaf) {
      return this.walk(nextLeaf, matchFn);
    }

    return null;
  }
}
