// "use strict";

// let f = 2 && 3;
// console.log("f ", f);
// let d = 2 || 3;
// console.log("d ", d);
// let r = "11,22,44".split(",");
// console.log("r ", r);

// class F {
//   constructor() {
//     this.x = 2;
//   }
//   s() {
//     return 55;
//   }
//   q = [1];
//   qw = () => this.x;
// }
// F.t = 4;

// let g = new F();

// console.log(g.qw());
// console.log(F.t);

//--------------------------------------------------------

// function fn() {
//   let x = 0;

//   let funct1 = () => x++;
//   let funct2 = () => console.log(t);

//   return { funct1, funct2 };
// }
// const obj1 = fn();
// obj1.funct1();
// obj1.funct1();
// obj1.funct2();

// const obj2 = fn();

// obj2.funct1();
// obj2.funct1();
// obj2.funct1();
// obj2.funct1();
// obj2.funct2();
//====================================
// let a = {
//   t: 5,
//   f() {
//     console.log("f--", this);
//     let f1 = () => {
//       console.log("f1--", this);
//       f2 = () => {
//         console.log("f2--", this);
//         let f3 = () => {
//           console.log("f3--", this);
//           let f4 = arg => {
//             console.log("f4--", this);
//             arg();
//           };
//           f4(function () {
//             console.log("f5--", this);
//           });
//         };
//         f3();
//       };
//       f2();
//     };
//     f1();
//   },
// };

// a.f();
//------------------------

// let d = { s: 9 };

// class A {
//   constructor() {
//     this.g = 6;
//     this.fn3 = function () {
//       console.log("fn3", this);
//     }.bind(d);
//     this.fn4 = () => console.log("fn4", this);
//   }
//   fn1 = () => console.log("fn1", this);
//   fn2(arg) {
//     console.log("fn2", this);
//     arg();
//   }
// }

// let a1 = new A();
// a1.fn1.call(d);
// a1.fn2.call(d, function () {
//   console.log("fn7", this);
// });
// a1.fn3();
// a1.fn4();

//===============================================

// let q = {
//   r: 8,
//   w: 9,
//   t: () => console.log(this),
//   fff() {
//     console.log(this);
//   },
// };
// q.t();
// q.fff();

// console.log(11, this);

// class F {
//   p = 7;
//   t = () => console.log(33, this);
// }

// let g = new F();

// g.t();
// console.log(44, g);

// ===============
// const p1 = new Promise((resolve, reject) => {
//   resolve(2);
// });

// const p = new Promise((resolve, reject) => {
//   resolve(1);
// });
// console.log(p);
// p.then(resol => console.log(resol)).finally(() => console.log(87878));

// Promise.all([p, p1]).then(resolve => console.log(resolve));
// let f = Promise.resolve(1);
// console.log(33, f);

//============================================================
// let arr = [1, 2, 3, 4, 5];
// let iteratorArr = arr[Symbol.iterator]();
// console.log(iteratorArr); // Object [Array Iterator] {}
// console.log(iteratorArr.next()); // { value: 1, done: false }
// console.log(iteratorArr.next()); // { value: 2, done: false }
//===============================================================
// function* fnGenerator() {
//   console.log("blok-A");
//   let a = yield 8;
//   console.log("blok-B", a);
//   a = yield 6;
//   console.log("blok-C", a);
//   yield 4;
//   console.log("blok-D", a);
//   yield 2;
//   console.log("blok-E", a);
// }

// const gen = fnGenerator(7);
// console.log(gen); // Object [Generator] {}
// console.log(fnGenerator); // [GeneratorFunction: fnGenerator]
// gen.next("QWE"); // blok-A // Аргумент первого next() походу невозможно отловить???
// gen.next("ZXC"); // blok-B ZXC
// gen.next("ASD"); // blok-C ASD
// const b = gen.next(); // blok-D ASD
// const c = gen.next(); // blok-E ASD

// console.log(b); // { value: 2, done: false }
// console.log(c); // { value: undefined, done: true } // если в конце функции поставить return 1 то value: 1
//=============================================================
