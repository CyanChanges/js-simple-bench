import { bench, run } from "mitata";

bench("for-of loop", () => {
  let acc = 0;

  for (const el of Array.from({ length: 10000 }, () => Math.random())) {
    acc += el;
  }
});

await run({ format: "json" });
