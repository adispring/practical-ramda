const R = require('ramda');
const expect = require('expect');
const tape = require('tape');

console.log(R.range(1, 4));

// map
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

console.log(mapR(R.multiply(2), R.range(1, 5)));
console.log(mapR2(R.multiply(2), R.range(1, 5)));
console.log(mapR3(R.multiply(2), R.range(1, 5)));

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

console.log(reduceR(R.add, 0, R.range(1, 5)));
console.log(reduceR2(R.add, 0, R.range(1, 5)));
console.log(reduceR3(R.add, 0, R.range(1, 5)));

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

console.log(filterR(a => a % 2, R.range(1, 10)));
console.log(filterR2(a => a % 2, R.range(1, 10)));
console.log(filterR3(a => a % 2, R.range(1, 10)));

// quickSort
var quickSortR = R.unless(
  R.isEmpty,
  xs => { // 其实可以用扩展符 ... [head, ...tail]
    const head = R.head(xs);
    const tail = R.tail(xs);
    return R.compose(quickSortR, R.filter(R.lte(R.__, head)))(tail)
     .concat(head)
     .concat(R.compose(quickSortR, R.filter(R.gte(R.__, head)))(tail));
  }
);

console.log(quickSortR([8, 18, 2, 5, 4, 6]));

// fibonacci sequence
var fibR = n => R.unless(
  R.contains(R.__, [0, 1]),
  () => fibR(n - 1) + fibR(n - 2)
)(n);

console.log(fibR(6));

// reverse
var reverseR = R.unless(
  R.isEmpty,
  xs => reverseR(R.tail(xs)).concat(R.head(xs))
);

console.log(reverseR([1, 3, 5, 7]));

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

console.log(mergeR([1, 3, 5, 7], [2, 4, 6, 8]));
console.log(mergeR2([1, 3, 5, 7], [2, 4, 6, 8]));
console.log(mergeR3([1, 3, 5, 7], [2, 4, 6, 8]));

// maximum

var maximumR = R.cond([
  [R.isEmpty, () => 'maximum of empty list'],
  [R.compose(R.equals(1), R.length), R.head],
  [R.T, ([x, ...xtail]) => R.max(x, maximumR(xtail))],
]);

var maximumR2 = xs => {
  if (R.isEmpty(xs)) {
    throw 'maximumR of empty list';
  } else if (xs.length === 1) {
    return R.head(xs);
  } else {
    return R.max(R.head(xs), maximumR2(R.tail(xs)));
  }
};

console.log(maximumR([1, 3, 4, 2, 8, 10, 5]));
console.log(maximumR2([1, 3, 4, 2, 8, 10, 5]));

// contains
var containsR = (val, list) => R.ifElse(
  R.isEmpty,
  R.always(false),
  xs => R.head(xs) === val ? true : containsR(val, R.tail(xs))
)(list);

console.log(containsR(3, [1, 3, 5, 7]));

expect(containsR(3, [1, 3, 5, 7])).toEqual(true);
tape('', t => {
  t.equal(containsR(3, [1, 3, 5, 7]), true);
  t.end();
});
