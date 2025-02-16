import fs from "node:fs";
import commands from "./run.ts";
import {
  $,
  COLLECTIONS,
  defaults,
  mitata,
  reset_collections,
} from "./mitata_fmt.ts";
import process from "node:process";

const ROOT = import.meta.dir + "/";
const TESTS = ROOT + "tests/";
const DIST = ROOT + "dist/";
let bannerLayer = 0;

if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });

function log(content: string, sym: string = "*") {
  const x = `${$.green}${sym}${$.cyan} ${content}`;
  if (bannerLayer) {
    bannerContent(x);
  } else console.log(x);
}

function bannerHeader(header: string) {
  bannerLayer++;
  const def = (process.stdout.columns ?? 20) - 2 - 9 - Bun.stringWidth(header);
  const mid = Math.floor(
    def / 2,
  );
  console.log(
    $.yellow +
      $.boxplot.symbols.tl +
      $.boxplot.symbols.h.repeat(mid - 2) +
      "[ " + $.reset + header + $.yellow + " ]" +
      $.yellow +
      $.boxplot.symbols.h.repeat(def - mid - 2) +
      $.boxplot.symbols.tr,
  );
}

function bannerContent(content: string) {
  const border = $.yellow + $.boxplot.symbols.v + $.reset;

  const lines = content.split("\n")
    .map((line) =>
      (border + line).padEnd((process.stdout.columns ?? 20) - 1) + border
    )
    .join("\n");

  console.log(lines);
}

function bannerFooter() {
  bannerLayer--;
  console.log(
    $.yellow +
      $.boxplot.symbols.bl +
      $.boxplot.symbols.h.repeat((process.stdout.columns ?? 20) - 2) +
      $.boxplot.symbols.br,
  );
}

log("Bundling files...");

await Bun.build({
  entrypoints: await Array.fromAsync(
    new Bun.Glob("**/*.js").scan({
      cwd: TESTS,
      absolute: true,
    }),
  ),
  outdir: DIST,
  target: "bun",
});

const opts = {
  print(x) {
    bannerContent(x);
  },
};
defaults(opts);

log("Starting Benchmark...");

for await (const test of new Bun.Glob("**/*.js").scan(DIST)) {
  bannerHeader();

  log(test.substring(0, test.lastIndexOf(".")), "@");

  let ctx;
  let benchmarks = [];
  for (const runtime in commands) {
    log(runtime, "+");
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

  reset_collections();

  bannerFooter();
}
