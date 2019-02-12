import { NQuad, NQuads } from "../../../../src/storage/nquads";

describe("nquads", () => {
  it("new, compact(), toString()", () => {
    const nquads = new NQuads();

    nquads.length = 100;

    expect(nquads.compact().length).toEqual(0);
    expect(nquads.toString()).toEqual("");
  });

  it("prevents duplicates", () => {
    const nquadsA = new NQuads();
    const nquadsB = new NQuads();

    nquadsA.push(new NQuad(NQuad.blank("account"), "id", NQuad.value("abcd")));
    nquadsB.push(new NQuad(NQuad.blank("account"), "id", NQuad.value("abcde")));

    nquadsA.push(...nquadsB);
    nquadsA.concat(nquadsB);

    expect(nquadsA.compact().length).toEqual(1);
    expect(nquadsA[0].object.value).toEqual("abcde");
  });
});
