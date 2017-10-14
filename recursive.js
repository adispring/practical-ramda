/* eslint import/no-unresolved: 0, no-var: 0, vars-on-top: 0, no-nested-ternary: 0, max-len: 0 */
const R = require('ramda');
const expect = require('expect');

// map
var mapI = (fn, list) => {
  var newList = [];
  for (let i = 0; i < list.length; i++) {
    newList[i] = fn(list[i]);
  }
  return newList;
};
expect(mapI(R.multiply(2), R.range(1, 5))).toEqual([2, 4, 6, 8]);

var mapR = (fn, list) =>
  (R.isEmpty(list) ? list : R.prepend(fn(R.head(list)), mapR(fn, R.tail(list))));

var mapR2 = (fn, list) => R.cond([
  [R.isEmpty, R.identity],
  [R.T, R.converge(R.prepend, [R.compose(fn, R.head), xs => mapR2(fn, R.tail(xs))])],
])(list);

var mapR3 = (fn, list) => R.unless(
  R.isEmpty,
  R.converge(R.prepend, [R.compose(fn, R.head), xs => mapR3(fn, R.tail(xs))])
)(list);

var mapR4 = (fn, list) => R.unless(
  R.isEmpty,
  ([head, ...tail]) => R.prepend(fn(head), mapR4(fn, tail))
)(list);

expect(mapR4(R.multiply(2), R.range(1, 5))).toEqual([2, 4, 6, 8]);

var mapR5 = (fn, xs) => R.unless(
  R.isEmpty,
  ([head, ...tail]) => [fn(head), ...mapR5(fn, tail)]
)(xs);

expect(mapR5(R.multiply(2), R.range(1, 5))).toEqual([2, 4, 6, 8]);

expect(mapR(R.multiply(2), R.range(1, 5))).toEqual([2, 4, 6, 8]);
expect(mapR2(R.multiply(2), R.range(1, 5))).toEqual([2, 4, 6, 8]);
expect(mapR3(R.multiply(2), R.range(1, 5))).toEqual([2, 4, 6, 8]);

// reduce
var reduceR = (fn, acc, list) =>
  (R.isEmpty(list) ? acc : reduceR(fn, fn(acc, R.head(list)), R.tail(list)));

var reduceR2 = (fn, acc, list) => R.cond([
  [R.isEmpty, () => acc],
  [R.T, xs => reduceR2(fn, fn(acc, R.head(xs)), R.tail(xs))],
])(list);

var reduceR3 = (fn, acc, list) => R.ifElse(
  R.isEmpty,
  () => acc,
  xs => reduceR3(fn, fn(acc, R.head(xs)), R.tail(xs))
)(list);

expect(reduceR(R.add, 0, R.range(1, 5))).toEqual(10);
expect(reduceR2(R.add, 0, R.range(1, 5))).toEqual(10);
expect(reduceR3(R.add, 0, R.range(1, 5))).toEqual(10);

// filter
var filterR = (pred, list) =>
  R.isEmpty(list) ? list : pred(R.head(list)) ? R.prepend(R.head(list), filterR(pred, R.tail(list))) : filterR(pred, R.tail(list));

var filterR2 = (pred, list) => R.cond([
  [R.isEmpty, R.identity],
  [R.compose(pred, R.head), R.converge(R.prepend, [R.head, xs => filterR2(pred, R.tail(xs))])],
  [R.T, xs => filterR2(pred, R.tail(xs))],
])(list);

var filterR3 = (pred, list) => R.unless(
  R.isEmpty,
  R.converge(R.concat, [R.compose(R.ifElse(pred, R.of, R.always([])), R.head), xs => filterR3(pred, R.tail(xs))])
)(list);

var filterR4 = (pred, list) => R.unless(
  R.isEmpty,
  ([head, ...tail]) => [...(pred(head) ? [head] : []), ...filterR4(pred, tail)]
)(list);
expect(filterR4(a => a % 2, R.range(1, 10))).toEqual([1, 3, 5, 7, 9]);

expect(filterR(a => a % 2, R.range(1, 10))).toEqual([1, 3, 5, 7, 9]);
expect(filterR2(a => a % 2, R.range(1, 10))).toEqual([1, 3, 5, 7, 9]);
expect(filterR3(a => a % 2, R.range(1, 10))).toEqual([1, 3, 5, 7, 9]);
expect(filterR4(a => a % 2, R.range(1, 10))).toEqual([1, 3, 5, 7, 9]);

// quickSort
var quickSortR = R.cond(
  [R.isEmpty, R.always([])],
  [
    R.T,
    xs => {
      const head = R.head(xs);
      const tail = R.tail(xs);
      return R.compose(quickSortR, R.filter(R.lte(R.__, head)))(tail)
              .concat(head)
              .concat(R.compose(quickSortR, R.filter(R.gte(R.__, head)))(tail));
    },
  ]
);

expect(quickSortR([8, 18, 2, 5, 4, 6])).toEqual([2, 4, 5, 6, 8, 18]);

var quickSortR2 = R.unless(
  R.isEmpty,
  xs => { // 其实可以用扩展符 ... [head, ...tail]
    const head = R.head(xs);
    const tail = R.tail(xs);
    return R.compose(quickSortR2, R.filter(R.lte(R.__, head)))(tail)
     .concat(head)
     .concat(R.compose(quickSortR2, R.filter(R.gte(R.__, head)))(tail));
  }
);

expect(quickSortR2([8, 18, 2, 5, 4, 6])).toEqual([2, 4, 5, 6, 8, 18]);

var quickSortR3 = R.unless(
  R.isEmpty,
  ([head, ...tail]) => [
    ...R.compose(quickSortR3, R.filter(R.lte(R.__, head)))(tail),
    head,
    ...R.compose(quickSortR3, R.filter(R.gte(R.__, head)))(tail),
  ]
);

expect(quickSortR3([8, 18, 2, 5, 4, 6])).toEqual([2, 4, 5, 6, 8, 18]);

// fibonacci sequence
var fibR = n => R.unless(
  R.contains(R.__, [0, 1]),
  () => fibR(n - 1) + fibR(n - 2)
)(n);

expect(fibR(6)).toEqual(8);

// reverse
var reverseR = R.unless(
  R.isEmpty,
  xs => reverseR(R.tail(xs)).concat(R.head(xs))
);

expect(reverseR([1, 3, 5, 7])).toEqual([7, 5, 3, 1]);

// merge

var mergeR = (xs, ys) => {
  if (R.isEmpty(xs)) {
    return ys;
  } else if (R.isEmpty(ys)) {
    return xs;
  } else {
    return R.head(xs) >= R.head(ys) ?
           R.of(R.head(ys)).concat(mergeR(xs, R.tail(ys))) :
           R.of(R.head(xs)).concat(mergeR(R.tail(xs), ys));
  }
};

var mergeR2 = R.cond([
  [R.compose(R.isEmpty, R.nthArg(0)), R.nthArg(1)],
  [R.compose(R.isEmpty, R.nthArg(1)), R.nthArg(0)],
  [R.T, (xs, ys) =>
    R.head(xs) >= R.head(ys) ?
                  R.of(R.head(ys)).concat(mergeR(xs, R.tail(ys))) :
                  R.of(R.head(xs)).concat(mergeR(R.tail(xs), ys)),
  ],
]);

var mergeR3 = R.cond([
  [R.compose(R.isEmpty, R.nthArg(0)), R.nthArg(1)],
  [R.compose(R.isEmpty, R.nthArg(1)), R.nthArg(0)],
  [
    R.T,
    ([x, ...xtail], [y, ...ytail]) => x >= y ?
      R.of(y).concat(mergeR3([x, ...xtail], ytail)) :
      R.of(x).concat(mergeR3(xtail, [y, ...ytail])),
  ],
]);

expect(mergeR([1, 3, 5, 7], [2, 4, 6, 8])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
expect(mergeR2([1, 3, 5, 7], [2, 4, 6, 8])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
expect(mergeR3([1, 3, 5, 7], [2, 4, 6, 8])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

// maximum

var maximumR = R.cond([
  [R.isEmpty, () => 'maximum of empty list'],
  [R.compose(R.equals(1), R.length), R.head],
  [R.T, ([x, ...xtail]) => R.max(x, maximumR(xtail))],
]);

var maximumR2 = xs => {
  if (R.isEmpty(xs)) {
    throw new Error('maximumR of empty list');
  } else if (xs.length === 1) {
    return R.head(xs);
  } else {
    return R.max(R.head(xs), maximumR2(R.tail(xs)));
  }
};

expect(maximumR([1, 3, 4, 2, 8, 10, 5])).toEqual(10);
expect(maximumR2([1, 3, 4, 2, 8, 10, 5])).toEqual(10);

// contains
var containsR = (val, list) => R.ifElse(
  R.isEmpty,
  R.always(false),
  xs => R.head(xs) === val ? true : containsR(val, R.tail(xs))
)(list);

expect(containsR(3, [1, 3, 5, 7])).toEqual(true);
