import fs from "node:fs";
import commands from "./run.ts";
import { $, COLLECTIONS, defaults, mitata } from "./mitata_fmt.ts";

const ROOT = import.meta.dir + "/";
const TESTS = ROOT + "tests/";
const DIST = ROOT + "dist/";

if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });

await Bun.build({
  entrypoints: [
    ...new Bun.Glob("**/*.js").scanSync({
      cwd: TESTS,
      absolute: true,
    }),
  ],
  outdir: DIST,
  target: "bun",
});

const opts = {};
defaults(opts);

for (const test of new Bun.Glob("**/*.js").scanSync(DIST)) {
  console.log("*", test.substring(0, test.lastIndexOf(".")));

  let ctx;
  let benchmarks = [];
  for (const runtime in commands) {
    console.log("+", runtime);
    const { context: ctx_, benchmarks: bm } = await Bun.$`${{
      raw: commands[runtime],
    }} ${DIST + test}`
      .json();
    ctx = ctx_;
    benchmarks.push(...bm.map((x) => Object.assign(x, { runtime })));
  }

  const last = COLLECTIONS[COLLECTIONS.length - 1];
  COLLECTIONS.push({
    trials: [],
    name: last.name,
    id: COLLECTIONS.length,
    types: ["x", ...last.types],
  });
  COLLECTIONS.push({
    trials: [],
    name: last.name,
    id: COLLECTIONS.length,
    types: ["s", "x", ...last.types],
  });

  benchmarks.forEach((x) => {
    const { alias, runtime: runtime_ } = x;
    const runtime = runtime_.padEnd(4);
    const name = `[${runtime}] ${alias}`;
    x.alias = name;
    x.runs = x.runs.map((x) => ({
      ...x,
      name: `${$.cyan}[${runtime}]${$.reset} ${x.name}`,
    }));
    COLLECTIONS[COLLECTIONS.length - 1].trials.push({
      _name: name,
      flags: 0,
      run: () => x,
      _names: function* () {
        yield name;
      },
    });
  });

  await mitata(ctx, opts, benchmarks);
}
