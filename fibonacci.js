
// 0 1 1 2 3 5 8 13 21
function fibonacci(n) {
    let fib = 0;
    let next = 1;

    for (let i=1; i<=n; i++) {
        [fib, next] = [next, fib+next];
    }

    return fib;
}


const fib5 = fibonacci(5);
console.log(fib5);