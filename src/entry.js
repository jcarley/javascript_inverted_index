
/*
  Entry =
    term: string
    doc_indexs: []int
*/

export default class Entry {

  constructor(term) {
    this._term = term;
    this.indexes = [];
  }

  get term() {
    return this._term;
  }

  push(docIndex) {
    this.indexes.push(docIndex);
  }

}
