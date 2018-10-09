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
    this.walk(this.tree, matchFn);
  }

  private walk(tree: any, matchFn: any): any | null {
    if (!tree) {
      return null;
    }

    const match = matchFn(tree[valueKey]);

    if (match) {
      return match;
    }

    if (tree[this.leafKey]) {
      return this.walk(tree[this.leafKey], matchFn);
    }

    return null;
  }
}
