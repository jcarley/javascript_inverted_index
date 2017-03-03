import _ from 'lodash';
import { RBTree } from 'bintrees';
import Entry from './entry';
import stop_words_list from './stop_words';

var debug = require('debug')('indexer');

export default class InvertedIndex {

  constructor() {
    this.tree = new RBTree(this.compare);
    this.reference = [];
  }

  index(doc) {
    let keys = _.keys(doc);
    let terms = _.map(keys, (key) => {
      debug(`processing key: ${key}`);
      let text = doc[key];
      let t = this.extract_terms(text);
      t = this.lower_case_filter(t);
      t = this.dedup_filter(t);
      t = this.stop_words_filter(t, stop_words_list);
      t = this.prefix_filter(t, key);
      return t;
    });
    terms = _.flatten(terms);
    // this is just for testing right now.  we don't want to store the document
    // long term
    let length = this.reference.push(doc);
    _.each(terms, (term) => {
      let e = new Entry(term);
      let entry;
      if((entry = this.tree.find(e)) === null) {
        entry = new Entry(term);
        this.tree.insert(entry);
      }
      entry.push(length - 1);
    });
    return terms;
  }

  find(term) {
    let e = new Entry(term);
    let entry;
    if((entry = this.tree.find(e)) === null) {
      return null;
    }
    return _.map(entry.indexes, i => this.reference[i]);
  }

  compare(entry1, entry2) {

    let key1 = entry1.term;
    let key2 = entry2.term;

    let comparison = 0
    if(_.gt(key1, key2)) {
      comparison = 1;
    } else if( _.lt(key1, key2)) {
      comparison =  -1;
    }

    return comparison;
  }

  extract_terms(text) {
    if(typeof text !== 'string')
      return text;

    let re = /\b[A-Za-z0-9-_.]+\b/g;
    let result = text.match(re);
    return result;
  }

  lower_case_filter(terms) {
    return _.map(terms, _.toLower);
  }

  dedup_filter(terms) {
    return _.uniq(terms);
  }

  stop_words_filter(terms, stop_words) {
    return _.filter(terms, t => !_.includes(stop_words, t));
  }

  prefix_filter(terms, tag) {
    return terms.map(t => `${tag}:${t}`);
  }

}

