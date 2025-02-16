import { bench, do_not_optimize, run } from "mitata";

bench("for-of loop", () => {
  let acc = 0;

  for (const el of Array.from({ length: 1000000 }, (i) => i)) {
    acc += el;
  }

  do_not_optimize(acc);
});

await run({ format: "json" });
