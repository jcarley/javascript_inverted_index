import _ from 'lodash';
import assert from 'assert';

import InvertedIndex from '../src/index';
import Entry from '../src/entry';

suite('invertedIndex')

test('extracts terms from a string', () => {
  let text = "Turtles love pizza";
  let invertedIndex = new InvertedIndex();
  assert.deepStrictEqual(invertedIndex.extract_terms(text), ["Turtles", "love", "pizza"])
});

test('lower case all tersm', () => {
  let terms = ["TurTleS", "LovE", "PiZzA"];
  let invertedIndex = new InvertedIndex();
  assert.deepStrictEqual(invertedIndex.lower_case_filter(terms), ["turtles", "love", "pizza"]);
});

test('remove duplicate terms', () => {
  let terms = ["love", "pizza", "pizza", "turtles", "turtles", "turtles", "turtles"];
  let invertedIndex = new InvertedIndex();
  assert.deepStrictEqual(invertedIndex.dedup_filter(terms), ["love", "pizza", "turtles"]);
});

test('remove stop words', () => {
  let terms = ["is", "I", "love", "my", "999", "if", "are", "turtles"];
  let stop_words = ["are", "is", "if"];
  let invertedIndex = new InvertedIndex();
  assert.deepStrictEqual(invertedIndex.stop_words_filter(terms, stop_words), ["I", "love", "my", "999", "turtles"]);
});

test('add a tag to each term', () => {
  let tag = "name";
  let terms = ["turtles", "love", "pizza"];
  let invertedIndex = new InvertedIndex();
  assert.deepStrictEqual(invertedIndex.prefix_filter(terms, tag), ["name:turtles", "name:love", "name:pizza"]);
});

test('compare', () => {
  // cmp(a,b), it returns -1 if a < b, 0 if a == b and 1 if a > b.

  let entry1 = new Entry("body:pizza", {});
  let entry2 = new Entry("body:turtles", {});

  let invertedIndex = new InvertedIndex();
  assert.deepStrictEqual(invertedIndex.compare(entry1, entry2), -1)
  assert.deepStrictEqual(invertedIndex.compare(entry2, entry1), 1)
  assert.deepStrictEqual(invertedIndex.compare(entry1, entry1), 0)
});

test('index a whole string', () => {
  let tag = "body";
  let stop_words = ["are", "is", "if"];

  let text = "My pizza is is is are if pizza -------- good";

  let invertedIndex = new InvertedIndex();

  let terms = invertedIndex.extract_terms(text);
  terms = invertedIndex.lower_case_filter(terms);
  terms = invertedIndex.dedup_filter(terms);
  terms = invertedIndex.stop_words_filter(terms, stop_words);
  terms = invertedIndex.prefix_filter(terms, tag);

  assert.deepStrictEqual(terms, ["body:my", "body:pizza", "body:good"]);
});

test('index a document', () => {
  let doc = {
    id: "123",
    body: "Turtles love pizza"
  };

  // we could add a converter here.  going to do with out for now

  let invertedIndex = new InvertedIndex();
  let terms = invertedIndex.index(doc);
  assert.deepStrictEqual(terms, ["id:123", "body:turtles", "body:love", "body:pizza"]);
  assert.deepStrictEqual(invertedIndex.tree.size, 4);
  assert.deepStrictEqual(invertedIndex.reference.length, 1);
});

test('index several documents', () => {

  let doc1 = {
    id: "123",
    body: "Turtles love pizza"
  };

  let doc2 = {
    id: "124",
    body: "Turtles love water"
  };

  let doc3 = {
    id: "125",
    body: "Turtles know karate",
    title: "The story of leo"
  };

  // we could add a converter here.  going to do with out for now

  let invertedIndex = new InvertedIndex();

  let start = new Date();
  for(let i in _.range(10000)) {
    invertedIndex.index(doc1);
    invertedIndex.index(doc2);
    invertedIndex.index(doc3);
  }
  let end = new Date();
  var time = end.getTime() - start.getTime();
  console.log('finished in', time, 'ms');

  start = new Date();
  let foundDocs = invertedIndex.find("title:leo");
  end = new Date();
  time = end.getTime() - start.getTime();
  console.log('finished in', time, 'ms');
  // assert.deepStrictEqual(foundDocs, [doc3]);
});


