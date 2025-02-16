// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __require = import.meta.require;

// node_modules/mitata/src/lib.mjs
var AsyncFunction = (async () => {
}).constructor;
var GeneratorFunction = function* () {
}.constructor;
var AsyncGeneratorFunction = async function* () {
}.constructor;
var $ = { _: null, __() {
  return print($._);
} };
async function measure(f, ...args) {
  return await {
    fn,
    iter,
    yield: generator,
    [undefined]() {
      throw new TypeError("expected iterator, generator or one-shot function");
    }
  }[kind(f)](f, ...args);
}
async function generator(gen, opts = {}) {
  const ctx = {
    get(name) {
      return opts.args?.[name];
    }
  };
  const g = gen(ctx);
  const n = await g.next();
  let $fn = n.value;
  if (!n.value?.heap && n.value?.heap != null)
    opts.heap = false;
  opts.concurrency ??= n.value?.concurrency ?? opts.args?.concurrency;
  if (!n.value?.counters && n.value?.counters != null)
    opts.$counters = false;
  if (n.done || kind($fn) !== "fn") {
    $fn = n.value?.bench || n.value?.manual;
    if (kind($fn, true) !== "fn")
      throw new TypeError("expected benchmarkable yield from generator");
    opts.params ??= {};
    const params = $fn.length;
    opts.manual = !n.value.manual ? false : n.value.budget !== "manual" ? "real" : "manual";
    for (let o = 0;o < params; o++) {
      opts.params[o] = n.value[o];
      if (kind(n.value[o]) !== "fn")
        throw new TypeError("expected function for benchmark parameter");
    }
  }
  const stats = await fn($fn, opts);
  if (!(await g.next()).done)
    throw new TypeError("expected generator to yield once");
  return {
    ...stats,
    kind: "yield"
  };
}
var print = (() => {
  if (globalThis.console?.log)
    return globalThis.console.log;
  if (globalThis.print && !globalThis.document)
    return globalThis.print;
  return () => {
    throw new Error("no print function available");
  };
})();
var gc = (() => {
  try {
    return Bun.gc(true), () => Bun.gc(true);
  } catch {
  }
  try {
    return globalThis.gc(), () => globalThis.gc();
  } catch {
  }
  try {
    return globalThis.__gc(), () => globalThis.__gc();
  } catch {
  }
  try {
    return globalThis.std.gc(), () => globalThis.std.gc();
  } catch {
  }
  try {
    return globalThis.$262.gc(), () => globalThis.$262.gc();
  } catch {
  }
  try {
    return globalThis.tjs.engine.gc.run(), () => globalThis.tjs.engine.gc.run();
  } catch {
  }
  return Object.assign(globalThis.Graal ? () => new Uint8Array(2 ** 29) : () => new Uint8Array(2 ** 30), { fallback: true });
})();
var now = (() => {
  try {
    Bun.nanoseconds();
    return Bun.nanoseconds;
  } catch {
  }
  try {
    $.agent.monotonicNow();
    return () => 1e6 * $.agent.monotonicNow();
  } catch {
  }
  try {
    $262.agent.monotonicNow();
    return () => 1e6 * $262.agent.monotonicNow();
  } catch {
  }
  try {
    const now2 = performance.now.bind(performance);
    now2();
    return () => 1e6 * now2();
  } catch {
    return () => 1e6 * Date.now();
  }
})();
function kind(fn, _ = false) {
  if (!(fn instanceof Function || fn instanceof AsyncFunction || fn instanceof GeneratorFunction || fn instanceof AsyncGeneratorFunction))
    return;
  if (fn instanceof GeneratorFunction || fn instanceof AsyncGeneratorFunction)
    return "yield";
  if ((_ ? true : fn.length === 0) && (fn instanceof Function || fn instanceof AsyncFunction))
    return "fn";
  if (fn.length !== 0 && (fn instanceof Function || fn instanceof AsyncFunction))
    return "iter";
}
var k_cpu_time_rescale_heap = 1.1;
var k_cpu_time_rescale_inner_gc = 2;
var k_concurrency = 1;
var k_min_samples = 12;
var k_batch_unroll = 4;
var k_max_samples = 1e9;
var k_warmup_samples = 2;
var k_batch_samples = 4096;
var k_samples_threshold = 12;
var k_batch_threshold = 65536;
var k_min_cpu_time = 642 * 1e6;
var k_warmup_threshold = 500000;
function defaults(opts) {
  opts.gc ??= gc;
  opts.now ??= now;
  opts.heap ??= null;
  opts.params ??= {};
  opts.manual ??= false;
  opts.inner_gc ??= false;
  opts.$counters ??= false;
  opts.concurrency ??= k_concurrency;
  opts.min_samples ??= k_min_samples;
  opts.max_samples ??= k_max_samples;
  opts.min_cpu_time ??= k_min_cpu_time;
  opts.batch_unroll ??= k_batch_unroll;
  opts.batch_samples ??= k_batch_samples;
  opts.warmup_samples ??= k_warmup_samples;
  opts.batch_threshold ??= k_batch_threshold;
  opts.warmup_threshold ??= k_warmup_threshold;
  opts.samples_threshold ??= k_samples_threshold;
  if (opts.heap)
    opts.min_cpu_time *= k_cpu_time_rescale_heap;
  if (opts.gc && opts.inner_gc)
    opts.min_cpu_time *= k_cpu_time_rescale_inner_gc;
}
async function fn(fn2, opts = {}) {
  defaults(opts);
  let async = false;
  let batch = false;
  const params = Object.keys(opts.params);
  warmup: {
    const $p = new Array(params.length);
    for (let o = 0;o < params.length; o++) {
      $p[o] = await opts.params[o]();
    }
    const t0 = now();
    const r = fn2(...$p);
    let t1 = now();
    if (async = r instanceof Promise)
      await r, t1 = now();
    if (t1 - t0 <= opts.warmup_threshold) {
      for (let o = 0;o < opts.warmup_samples; o++) {
        for (let oo = 0;oo < params.length; oo++) {
          $p[oo] = await opts.params[oo]();
        }
        const t02 = now();
        await fn2(...$p);
        const t12 = now();
        if (batch = t12 - t02 <= opts.batch_threshold)
          break;
      }
    }
  }
  if (opts.manual) {
    batch = false;
    opts.concurrency = 1;
  }
  const loop = new AsyncFunction("$fn", "$gc", "$now", "$heap", "$params", "$counters", `
    ${!opts.$counters ? "" : "let _hc = false;"}
    ${!opts.$counters ? "" : "try { $counters.init(); _hc = true; } catch {}"}

    let _ = 0; let t = 0;
    let samples = new Array(2 ** 20);
    ${!opts.heap ? "" : "const heap = { _: 0, total: 0, min: Infinity, max: -Infinity };"}
    ${!(opts.gc && opts.inner_gc && !opts.gc.fallback) ? "" : "const gc = { total: 0, min: Infinity, max: -Infinity };"}

    ${!params.length ? "" : Array.from({ length: params.length }, (_, o) => `
      ${Array.from({ length: opts.concurrency }, (_2, c) => `
        let param_${o}_${c} = ${!batch ? "null" : `new Array(${opts.batch_samples})`};
      `.trim()).join(" ")}
    `.trim()).join(`
`)}

    ${!opts.gc ? "" : `$gc();`}

    for (; _ < ${opts.max_samples}; _++) {
      if (_ >= ${opts.min_samples} && t >= ${opts.min_cpu_time}) break;

      ${!params.length ? "" : `
        ${!batch ? `
          ${Array.from({ length: params.length }, (_, o) => `
            ${Array.from({ length: opts.concurrency }, (_2, c) => `
              if ((param_${o}_${c} = $params[${o}]()) instanceof Promise) param_${o}_${c} = await param_${o}_${c};
            `.trim()).join(" ")}
          `.trim()).join(`
`)}
        ` : `
          for (let o = 0; o < ${opts.batch_samples}; o++) {
            ${Array.from({ length: params.length }, (_, o) => `
              ${Array.from({ length: opts.concurrency }, (_2, c) => `
                if ((param_${o}_${c}[o] = $params[${o}]()) instanceof Promise) param_${o}_${c}[o] = await param_${o}_${c}[o];
              `.trim()).join(" ")}
            `.trim()).join(`
`)}
          }
        `}
      `}

      ${!(opts.gc && opts.inner_gc) ? "" : `
        igc: {
          const t0 = $now();
          $gc(); t += $now() - t0;
        }
      `}

      ${!opts.manual ? "" : "let t2 = 0;"}
      ${!opts.heap ? "" : "const h0 = $heap();"}
      ${!opts.$counters ? "" : "if (_hc) try { $counters.before(); } catch {};"} const t0 = $now();

      ${!batch ? `
        ${!async ? "" : 1 >= opts.concurrency ? "" : "await Promise.all(["}
          ${Array.from({ length: opts.concurrency }, (_, c) => `
            ${!opts.manual ? "" : "t2 +="} ${!async ? "" : 1 < opts.concurrency ? "" : "await"} ${(!params.length ? `
              $fn()
            ` : `
              $fn(${Array.from({ length: params.length }, (_2, o) => `param_${o}_${c}`).join(", ")})
            `).trim()}${!async ? ";" : 1 < opts.concurrency ? "," : ";"}
          `.trim()).join(`
`)}
        ${!async ? "" : 1 >= opts.concurrency ? "" : `]);`}
      ` : `
        for (let o = 0; o < ${opts.batch_samples / opts.batch_unroll | 0}; o++) {
          ${!params.length ? "" : `const param_offset = o * ${opts.batch_unroll};`}

          ${Array.from({ length: opts.batch_unroll }, (_, u) => `
            ${!async ? "" : 1 >= opts.concurrency ? "" : "await Promise.all(["}
              ${Array.from({ length: opts.concurrency }, (_2, c) => `
                ${!async ? "" : 1 < opts.concurrency ? "" : "await"} ${(!params.length ? `
                  $fn()
                ` : `
                  $fn(${Array.from({ length: params.length }, (_3, o) => `param_${o}_${c}[${u === 0 ? "" : `${u} + `}param_offset]`).join(", ")})
                `).trim()}${!async ? ";" : 1 < opts.concurrency ? "," : ";"}
              `.trim()).join(" ")}
            ${!async ? "" : 1 >= opts.concurrency ? "" : "]);"}
          `.trim()).join(`
`)}
        }
      `}

      const t1 = $now();
      ${!opts.$counters ? "" : "if (_hc) try { $counters.after(); } catch {};"}

      ${!opts.heap ? "" : `
        heap: {
          const t0 = $now();
          const h1 = ($heap() - h0) ${!batch ? "" : `/ ${opts.batch_samples}`}; t += $now() - t0;

          if (0 <= h1) {
            heap._++;
            heap.total += h1;
            heap.min = Math.min(h1, heap.min);
            heap.max = Math.max(h1, heap.max);
          }
        }
      `}

      ${!(opts.gc && opts.inner_gc && !opts.gc.fallback) ? "" : `
        igc: {
          const t0 = $now();
          $gc(); const t1 = $now() - t0;

          t += t1;
          gc.total += t1;
          gc.min = Math.min(t1, gc.min);
          gc.max = Math.max(t1, gc.max);
        }
      `};

      const diff = ${opts.manual ? "t2" : "t1 - t0"};
      t += ${opts.manual === "manual" ? "t2" : "t1 - t0"};
      samples[_] = diff ${!batch ? "" : `/ ${opts.batch_samples}`};
    }

    samples.length = _;
    samples.sort((a, b) => a - b);
    if (samples.length > ${opts.samples_threshold}) samples = samples.slice(2, -2);

    return {
      samples,
      min: samples[0],
      max: samples[samples.length - 1],
      p25: samples[(.25 * (samples.length - 1)) | 0],
      p50: samples[(.50 * (samples.length - 1)) | 0],
      p75: samples[(.75 * (samples.length - 1)) | 0],
      p99: samples[(.99 * (samples.length - 1)) | 0],
      p999: samples[(.999 * (samples.length - 1)) | 0],
      avg: samples.reduce((a, v) => a + v, 0) / samples.length,
      ticks: samples.length ${!batch ? "" : `* ${opts.batch_samples}`},
      ${!opts.heap ? "" : "heap: { ...heap, avg: heap.total / heap._ },"}
      ${!(opts.gc && opts.inner_gc && !opts.gc.fallback) ? "" : "gc: { ...gc, avg: gc.total / _ },"}
      ${!opts.$counters ? "" : `...(!_hc ? {} : { counters: $counters.translate(${!batch ? 1 : opts.batch_samples}, _) }),`}
    };

    ${!opts.$counters ? "" : "if (_hc) try { $counters.deinit(); } catch {};"}
  `);
  return {
    kind: "fn",
    debug: loop.toString(),
    ...await loop(fn2, opts.gc, opts.now, opts.heap, opts.params, opts.$counters)
  };
}
async function iter(iter2, opts = {}) {
  const _ = {};
  defaults(opts);
  let samples = new Array(2 ** 20);
  const _i = { next() {
    return _.next();
  } };
  const ctx = {
    [Symbol.iterator]() {
      return _i;
    },
    [Symbol.asyncIterator]() {
      return _i;
    },
    get(name) {
      return opts.args?.[name];
    }
  };
  const gen = function* () {
    let batch = false;
    warmup: {
      const t0 = now();
      yield undefined;
      const t1 = now();
      if (t1 - t0 <= opts.warmup_threshold) {
        for (let o = 0;o < opts.warmup_samples; o++) {
          const t02 = now();
          yield undefined;
          const t12 = now();
          if (batch = t12 - t02 <= opts.batch_threshold)
            break;
        }
      }
    }
    const loop = new GeneratorFunction("$gc", "$now", "$samples", _.debug = `
      let _ = 0; let t = 0;

      ${!opts.gc ? "" : `$gc();`}

      for (; _ < ${opts.max_samples}; _++) {
        if (_ >= ${opts.min_samples} && t >= ${opts.min_cpu_time}) break;

        ${!(opts.gc && opts.inner_gc) ? "" : `
          let inner_gc_cost = 0;

          igc: {
            const t0 = $now(); $gc();
            inner_gc_cost = $now() - t0;
          }
        `}

        const t0 = $now();
        
        ${!batch ? "yield void 0;" : `
          for (let o = 0; o < ${opts.batch_samples / opts.batch_unroll | 0}; o++) {
            ${new Array(opts.batch_unroll).fill("yield void 0;").join(" ")}
          }
        `}

        const t1 = $now();
        const diff = t1 - t0;

        $samples[_] = diff ${!batch ? "" : `/ ${opts.batch_samples}`};
        t += diff ${!(opts.gc && opts.inner_gc) ? "" : "+ inner_gc_cost"};
      }

      $samples.length = _;
    `)(opts.gc, opts.now, samples);
    _.batch = batch;
    _.next = loop.next.bind(loop);
    yield undefined;
  }();
  await iter2((_.next = gen.next.bind(gen), ctx));
  if (samples.length < opts.min_samples)
    throw new TypeError(`expected at least ${opts.min_samples} samples from iterator`);
  samples.sort((a, b) => a - b);
  if (samples.length > opts.samples_threshold)
    samples = samples.slice(2, -2);
  return {
    samples,
    kind: "iter",
    debug: _.debug,
    min: samples[0],
    max: samples[samples.length - 1],
    p25: samples[0.25 * (samples.length - 1) | 0],
    p50: samples[0.5 * (samples.length - 1) | 0],
    p75: samples[0.75 * (samples.length - 1) | 0],
    p99: samples[0.99 * (samples.length - 1) | 0],
    p999: samples[0.999 * (samples.length - 1) | 0],
    avg: samples.reduce((a, v) => a + v, 0) / samples.length,
    ticks: samples.length * (!_.batch ? 1 : opts.batch_samples)
  };
}
// node_modules/mitata/src/main.mjs
var FLAGS = 0;
var $counters = null;
var COLLECTIONS = [{ id: 0, name: null, types: [], trials: [] }];
var flags = {
  compact: 1 << 0,
  baseline: 1 << 1
};

class B {
  f = null;
  _args = {};
  _name = "";
  _group = 0;
  _gc = "once";
  flags = FLAGS;
  _highlight = false;
  constructor(name, f) {
    this.f = f;
    this.name(name);
    if (!kind(f))
      throw new TypeError("expected iterator, generator or one-shot function");
  }
  name(name, color = false) {
    return this._name = name, this.highlight(color), this;
  }
  gc(gc2 = "once") {
    if (![true, false, "once", "inner"].includes(gc2))
      throw new TypeError("invalid gc type");
    return this._gc = gc2, this;
  }
  highlight(color = false) {
    if (!color)
      return this._highlight = false, this;
    if (!$2.colors.includes(color))
      throw new TypeError("invalid highlight color");
    return this._highlight = color, this;
  }
  compact(bool = true) {
    if (bool)
      return this.flags |= flags.compact, this;
    if (!bool)
      return this.flags &= ~flags.compact, this;
  }
  baseline(bool = true) {
    if (bool)
      return this.flags |= flags.baseline, this;
    if (!bool)
      return this.flags &= ~flags.baseline, this;
  }
  range(name, s, e, m = 8) {
    const arr = [];
    for (let o = s;o <= e; o *= m)
      arr.push(Math.min(o, e));
    if (!arr.includes(e))
      arr.push(e);
    return this.args(name, arr);
  }
  dense_range(name, s, e, a = 1) {
    const arr = [];
    for (let o = s;o <= e; o += a)
      arr.push(o);
    if (!arr.includes(e))
      arr.push(e);
    return this.args(name, arr);
  }
  args(name, args) {
    if (name === null)
      return delete this._args.x, this;
    if (Array.isArray(name))
      return this._args.x = name, this;
    if (args === null && typeof name === "string")
      return delete this._args[name], this;
    if (Array.isArray(args) && typeof name === "string")
      return this._args[name] = args, this;
    if (name !== null && typeof name === "object") {
      for (const key in name) {
        const v = name[key];
        if (v == null)
          delete this._args[key];
        else if (Array.isArray(v))
          this._args[key] = v;
        else
          throw new TypeError("invalid arguments map value");
      }
      return this;
    }
    throw new TypeError("invalid arguments");
  }
  *_names() {
    const args = Object.keys(this._args);
    const kind2 = args.length === 0 ? "static" : args.length === 1 ? "args" : "multi-args";
    if (kind2 === "static") {
      yield this._name;
    } else {
      const offsets = new Array(args.length).fill(0);
      const runs = args.reduce((len, name) => len * this._args[name].length, 1);
      for (let o = 0;o < runs; o++) {
        {
          const _args = {};
          let _name = this._name;
          for (let oo = 0;oo < args.length; oo++)
            _args[args[oo]] = this._args[args[oo]][offsets[oo]];
          for (let oo = 0;oo < args.length; oo++)
            _name = _name.replaceAll(`$${args[oo]}`, _args[args[oo]]);
          yield _name;
        }
        let offset = 0;
        do {
          offsets[offset] = (1 + offsets[offset]) % this._args[args[offset]].length;
        } while (offsets[offset++] === 0 && offset < args.length);
      }
    }
  }
  async run(thrw = false) {
    const args = Object.keys(this._args);
    const kind2 = args.length === 0 ? "static" : args.length === 1 ? "args" : "multi-args";
    const tune = {
      $counters,
      inner_gc: this._gc === "inner",
      gc: !this._gc ? false : undefined,
      heap: await (async () => {
        if (globalThis.Bun) {
          const { memoryUsage } = await import("bun:jsc");
          return () => {
            const m = memoryUsage();
            return m.current;
          };
        }
        try {
          const { getHeapStatistics } = await import("v8");
          getHeapStatistics();
          return () => {
            const m = getHeapStatistics();
            return m.used_heap_size + m.malloced_memory;
          };
        } catch {
        }
      })()
    };
    if (kind2 === "static") {
      let stats, error;
      try {
        stats = await measure(this.f, tune);
      } catch (err) {
        error = err;
        if (thrw)
          throw err;
      }
      return {
        kind: kind2,
        args: this._args,
        alias: this._name,
        group: this._group,
        baseline: !!(this.flags & flags.baseline),
        runs: [{
          stats,
          error,
          args: {},
          name: this._name
        }],
        style: {
          highlight: this._highlight,
          compact: !!(this.flags & flags.compact)
        }
      };
    } else {
      const offsets = new Array(args.length).fill(0);
      const runs = new Array(args.reduce((len, name) => len * this._args[name].length, 1));
      for (let o = 0;o < runs.length; o++) {
        {
          let stats, error;
          const _args = {};
          let _name = this._name;
          for (let oo = 0;oo < args.length; oo++)
            _args[args[oo]] = this._args[args[oo]][offsets[oo]];
          for (let oo = 0;oo < args.length; oo++)
            _name = _name.replaceAll(`$${args[oo]}`, _args[args[oo]]);
          try {
            stats = await measure(this.f, { ...tune, args: _args });
          } catch (err) {
            error = err;
            if (thrw)
              throw err;
          }
          runs[o] = {
            stats,
            error,
            args: _args,
            name: _name
          };
        }
        let offset = 0;
        do {
          offsets[offset] = (1 + offsets[offset]) % this._args[args[offset]].length;
        } while (offsets[offset++] === 0 && offset < args.length);
      }
      return {
        runs,
        kind: kind2,
        args: this._args,
        alias: this._name,
        group: this._group,
        baseline: !!(this.flags & flags.baseline),
        style: {
          highlight: this._highlight,
          compact: !!(this.flags & flags.compact)
        }
      };
    }
  }
}
function bench(n, fn2) {
  if (typeof n === "function")
    fn2 = n, n = fn2.name || "anonymous";
  const collection = COLLECTIONS[COLLECTIONS.length - 1];
  const b = new B(n, fn2);
  b._group = collection.id;
  return collection.trials.push(b), b;
}
function colors() {
  return globalThis.tjs?.env?.FORCE_COLOR || globalThis.process?.env?.FORCE_COLOR || !globalThis.Deno?.noColor && !globalThis.tjs?.env?.NO_COLOR && !globalThis.process?.env?.NO_COLOR && !globalThis.process?.env?.NODE_DISABLE_COLORS;
}
async function cpu() {
  if (globalThis.process?.versions?.webcontainer)
    return null;
  try {
    let n;
    if (n = __require("os")?.cpus?.()?.[0]?.model)
      return n;
  } catch {
  }
  try {
    let n;
    if (n = __require("os")?.cpus?.()?.[0]?.model)
      return n;
  } catch {
  }
  try {
    let n;
    if (n = globalThis.tjs?.system?.cpus?.[0]?.model)
      return n;
  } catch {
  }
  try {
    let n;
    if (n = (await import("os"))?.cpus?.()?.[0]?.model)
      return n;
  } catch {
  }
  return null;
}
function version() {
  return {
    v8: () => globalThis.version?.(),
    bun: () => globalThis.Bun?.version,
    "txiki.js": () => globalThis.tjs?.version,
    deno: () => globalThis.Deno?.version?.deno,
    llrt: () => globalThis.process?.versions?.llrt,
    node: () => globalThis.process?.versions?.node,
    graaljs: () => globalThis.Graal?.versionGraalVM,
    webcontainer: () => globalThis.process?.versions?.webcontainer,
    "quickjs-ng": () => globalThis.navigator?.userAgent?.split?.("/")[1],
    hermes: () => globalThis.HermesInternal?.getRuntimeProperties?.()?.["OSS Release Version"]
  }[runtime()]?.() || null;
}
function runtime() {
  if (globalThis.d8)
    return "v8";
  if (globalThis.tjs)
    return "txiki.js";
  if (globalThis.Graal)
    return "graaljs";
  if (globalThis.process?.versions?.llrt)
    return "llrt";
  if (globalThis.process?.versions?.webcontainer)
    return "webcontainer";
  if (globalThis.inIon && globalThis.performance?.mozMemory)
    return "spidermonkey";
  if (globalThis.window && globalThis.netscape && globalThis.InternalError)
    return "firefox";
  if (globalThis.window && globalThis.navigator && Error.prepareStackTrace)
    return "chromium";
  if (globalThis.navigator?.userAgent?.toLowerCase?.()?.includes?.("quickjs-ng"))
    return "quickjs-ng";
  if (globalThis.$262 && globalThis.lockdown && globalThis.AsyncDisposableStack)
    return "XS Moddable";
  if (globalThis.$ && "IsHTMLDDA" in globalThis.$ && new Error().stack.includes("runtime@"))
    return "jsc";
  if (globalThis.window && globalThis.navigator && new Error().stack.includes("runtime@"))
    return "webkit";
  if (globalThis.os && globalThis.std)
    return "quickjs";
  if (globalThis.Bun)
    return "bun";
  if (globalThis.Deno)
    return "deno";
  if (globalThis.HermesInternal)
    return "hermes";
  if (globalThis.window && globalThis.navigator)
    return "browser";
  if (globalThis.process)
    return "node";
  else
    return null;
}
async function arch() {
  if (runtime() === "webcontainer")
    return "js + wasm";
  try {
    let n;
    if (n = Deno?.build?.target)
      return n;
  } catch {
  }
  try {
    const os = await import("os");
    return `${os.arch()}-${os.platform()}`;
  } catch {
  }
  if (globalThis.process?.arch && globalThis.process?.platform) {
    return `${globalThis.process.arch}-${globalThis.process.platform}`;
  }
  if (runtime() === "txiki.js") {
    return `${globalThis.tjs.system?.arch}-${globalThis.tjs.system?.platform}`;
  }
  if (runtime() === "spidermonkey") {
    try {
      const build = globalThis.getBuildConfiguration();
      const platforms = ["osx", "linux", "android", "windows"];
      const archs = ["arm", "x64", "x86", "wasi", "arm64", "mips32", "mips64", "loong64", "riscv64"];
      const arch2 = archs.find((k) => build[k]);
      const platform = platforms.find((k) => build[k]);
      if (arch2)
        return !platform ? arch2 : `${arch2}-${platform}`;
    } catch {
    }
    try {
      if (globalThis.isAvxPresent())
        return "x86_64";
    } catch {
    }
  }
  return null;
}
function defaults2(opts) {
  opts.print ??= print;
  opts.throw ??= false;
  opts.filter ??= /.*/;
  opts.format ??= "mitata";
  opts.colors ??= colors();
  opts.observe ??= (trial) => trial;
}
async function run(opts = {}) {
  defaults2(opts);
  const t = Date.now();
  const benchmarks = [];
  const noop = await measure(() => {
  });
  const _cpu = await measure(() => {
  }, { batch_unroll: 1 });
  const noop_inner_gc = await measure(() => {
  }, { inner_gc: true });
  const noop_iter = await measure((state) => {
    for (const _ of state)
      ;
  });
  const context = {
    now: t,
    arch: await arch(),
    version: version(),
    runtime: runtime(),
    cpu: {
      name: await cpu(),
      freq: 1 / _cpu.avg
    },
    noop: {
      fn: noop,
      iter: noop_iter,
      fn_gc: noop_inner_gc
    }
  };
  if (!$counters && context.arch?.includes?.("darwin") && ["bun", "node", "deno"].includes(context.runtime)) {
    try {
      $counters = await import("@mitata/counters");
      if (process.getuid() !== 0)
        throw $counters = false, 1;
    } catch {
    }
  }
  if (!$counters && context.arch?.includes?.("linux") && ["bun", "node", "deno"].includes(context.runtime)) {
    try {
      $counters = await import("@mitata/counters");
    } catch (err) {
      if (err?.message?.includes?.("PermissionDenied"))
        $counters = false;
    }
  }
  const layout = COLLECTIONS.map((c) => ({ name: c.name, types: c.types }));
  const format = typeof opts.format === "string" ? opts.format : Object.keys(opts.format)[0];
  await formats[format](context, { ...opts, format: opts.format[format] }, benchmarks, layout);
  return COLLECTIONS = [{ name: 0, types: [], trials: [] }], { layout, context, benchmarks };
}
var formats = {
  async quiet(_, opts, benchmarks) {
    for (const collection of COLLECTIONS) {
      for (const trial of collection.trials) {
        if (opts.filter.test(trial._name))
          benchmarks.push(opts.observe(await trial.run(opts.throw)));
      }
    }
  },
  async json(ctx, opts, benchmarks, layout) {
    const print2 = opts.print;
    const debug = opts.format?.debug ?? true;
    const samples = opts.format?.samples ?? true;
    for (const collection of COLLECTIONS) {
      for (const trial of collection.trials) {
        if (opts.filter.test(trial._name))
          benchmarks.push(opts.observe(await trial.run(opts.throw)));
      }
    }
    print2(JSON.stringify({
      layout,
      benchmarks,
      context: ctx
    }, (k, v) => {
      if (!debug && k === "debug")
        return "";
      if (!samples && k === "samples")
        return null;
      if (!(v instanceof Error))
        return v;
      return { message: String(v.message), stack: v.stack };
    }, 0));
  },
  async markdown(ctx, opts, benchmarks) {
    let first = true;
    const print2 = opts.print;
    print2(`clk: ~${ctx.cpu.freq.toFixed(2)} GHz`);
    print2(`cpu: ${ctx.cpu.name}`);
    print2(`runtime: ${ctx.runtime}${!ctx.version ? "" : ` ${ctx.version}`} (${ctx.arch})`);
    print2("");
    for (const collection of COLLECTIONS) {
      const trials = [];
      if (!collection.trials.length)
        continue;
      for (const trial of collection.trials) {
        if (opts.filter.test(trial._name)) {
          let bench2 = await trial.run(opts.throw);
          bench2 = opts.observe(bench2);
          trials.push(bench2);
          benchmarks.push(bench2);
        }
      }
      if (!trials.length)
        continue;
      if (!first)
        print2("");
      const name_len = trials.reduce((a, b) => Math.max(a, b.runs.reduce((a2, b2) => Math.max(a2, b2.name.length), 0)), 0);
      print2(`| ${(collection.name ? `\u2022 ${collection.name}` : !first ? "" : "benchmark").padEnd(name_len)} | ${"avg".padStart(16)} | ${"min".padStart(11)} | ${"p75".padStart(11)} | ${"p99".padStart(11)} | ${"max".padStart(11)} |`);
      print2(`| ${"-".repeat(name_len)} | ${"-".repeat(16)} | ${"-".repeat(11)} | ${"-".repeat(11)} | ${"-".repeat(11)} | ${"-".repeat(11)} |`);
      first = false;
      for (const trial of trials) {
        for (const run2 of trial.runs) {
          if (run2.error)
            print2(`| ${run2.name.padEnd(name_len)} | error: ${run2.error.message ?? run2.error} |`);
          else
            print2(`| ${run2.name.padEnd(name_len)} | \`${`${$2.time(run2.stats.avg)}/iter`.padStart(14)}\` | \`${$2.time(run2.stats.min).padStart(9)}\` | \`${$2.time(run2.stats.p75).padStart(9)}\` | \`${$2.time(run2.stats.p99).padStart(9)}\` | \`${$2.time(run2.stats.max).padStart(9)}\` |`);
        }
      }
    }
  },
  async mitata(ctx, opts, benchmarks) {
    const print2 = opts.print;
    let k_legend = opts.format?.name ?? "longest";
    if (k_legend === "fixed")
      k_legend = 28;
    else if (k_legend === "longest") {
      k_legend = 28;
      for (const collection of COLLECTIONS) {
        for (const trial of collection.trials) {
          if (opts.filter.test(trial._name)) {
            for (const name of trial._names()) {
              k_legend = Math.max(k_legend, name.length);
            }
          }
        }
      }
    }
    k_legend = Math.max(20, k_legend);
    if (!opts.colors)
      print2(`clk: ~${ctx.cpu.freq.toFixed(2)} GHz`);
    else
      print2($2.gray + `clk: ~${ctx.cpu.freq.toFixed(2)} GHz` + $2.reset);
    if (!opts.colors)
      print2(`cpu: ${ctx.cpu.name}`);
    else
      print2($2.gray + `cpu: ${ctx.cpu.name}` + $2.reset);
    if (!opts.colors)
      print2(`runtime: ${ctx.runtime}${!ctx.version ? "" : ` ${ctx.version}`} (${ctx.arch})`);
    else
      print2($2.gray + `runtime: ${ctx.runtime}${!ctx.version ? "" : ` ${ctx.version}`} (${ctx.arch})` + $2.reset);
    print2("");
    print2(`${"benchmark".padEnd(k_legend - 1)} avg (min \u2026 max) p75 / p99    (min \u2026 top 1%)`);
    print2("-".repeat(15 + k_legend) + " " + "-".repeat(31));
    let first = true;
    let optimized_out_warning = false;
    for (const collection of COLLECTIONS) {
      const trials = [];
      let prev_run_gap = false;
      if (!collection.trials.length)
        continue;
      const has_matches = collection.trials.some((trial) => opts.filter.test(trial._name));
      if (!has_matches)
        continue;
      else if (first) {
        first = false;
        if (collection.name) {
          print2(`\u2022 ${collection.name}`);
          if (!opts.colors)
            print2("-".repeat(15 + k_legend) + " " + "-".repeat(31));
          else
            print2($2.gray + "-".repeat(15 + k_legend) + " " + "-".repeat(31) + $2.reset);
        }
      } else {
        print2("");
        if (collection.name)
          print2(`\u2022 ${collection.name}`);
        if (!opts.colors)
          print2("-".repeat(15 + k_legend) + " " + "-".repeat(31));
        else
          print2($2.gray + "-".repeat(15 + k_legend) + " " + "-".repeat(31) + $2.reset);
      }
      for (const trial of collection.trials) {
        if (opts.filter.test(trial._name)) {
          let bench2 = await trial.run(opts.throw);
          bench2 = opts.observe(bench2);
          trials.push([trial, bench2]);
          benchmarks.push(bench2);
          if ($2.colors.indexOf(trial._highlight) === -1)
            trial._highlight = null;
          const _h = !opts.colors || !trial._highlight ? (x) => x : (x) => $2[trial._highlight] + x + $2.reset;
          for (const r of bench2.runs) {
            if (prev_run_gap)
              print2("");
            if (r.error) {
              if (!opts.colors)
                print2(`${_h($2.str(r.name, k_legend).padEnd(k_legend))} error: ${r.error.message ?? r.error}`);
              else
                print2(`${_h($2.str(r.name, k_legend).padEnd(k_legend))} ${$2.red + "error:" + $2.reset} ${r.error.message ?? r.error}`);
            } else {
              const compact = trial.flags & flags.compact;
              const noop = r.stats.kind === "iter" ? ctx.noop.iter : trial._gc !== "inner" ? ctx.noop.fn : ctx.noop.fn_gc;
              const optimized_out = r.stats.avg < 1.42 * noop.avg;
              optimized_out_warning = optimized_out_warning || optimized_out;
              if (compact) {
                let l = "";
                prev_run_gap = false;
                const avg = $2.time(r.stats.avg).padStart(9);
                const name = $2.str(r.name, k_legend).padEnd(k_legend);
                l += _h(name) + " ";
                if (!opts.colors)
                  l += avg + "/iter";
                else
                  l += $2.bold + $2.yellow + avg + $2.reset + $2.bold + "/iter" + $2.reset;
                const p75 = $2.time(r.stats.p75).padStart(9);
                const p99 = $2.time(r.stats.p99).padStart(9);
                const bins = $2.histogram.bins(r.stats, 11, 0.99);
                const histogram = $2.histogram.ascii(bins, 1, { colors: opts.colors });
                l += " ";
                if (!opts.colors)
                  l += p75 + " " + p99 + " " + histogram[0];
                else
                  l += $2.gray + p75 + " " + p99 + $2.reset + " " + histogram[0];
                if (optimized_out)
                  if (!opts.colors)
                    l += " !";
                  else
                    l += $2.red + " !" + $2.reset;
                print2(l);
              } else {
                let l = "";
                const avg = $2.time(r.stats.avg).padStart(9);
                const name = $2.str(r.name, k_legend).padEnd(k_legend);
                l += _h(name) + " ";
                const p75 = $2.time(r.stats.p75).padStart(9);
                const bins = $2.histogram.bins(r.stats, 21, 0.99);
                const histogram = $2.histogram.ascii(bins, r.stats.gc && r.stats.heap ? 2 : !(r.stats.gc || r.stats.heap) ? 2 : 3, { colors: opts.colors });
                if (!opts.colors)
                  l += avg + "/iter " + p75 + " " + histogram[0];
                else
                  l += $2.bold + $2.yellow + avg + $2.reset + $2.bold + "/iter" + $2.reset + " " + $2.gray + p75 + $2.reset + " " + histogram[0];
                if (optimized_out)
                  if (!opts.colors)
                    l += " !";
                  else
                    l += $2.red + " !" + $2.reset;
                print2(l);
                l = "";
                const min = $2.time(r.stats.min);
                const max = $2.time(r.stats.max);
                const p99 = $2.time(r.stats.p99).padStart(9);
                const diff = 18 - (min.length + max.length);
                l += " ".repeat(diff + k_legend - 8);
                if (!opts.colors)
                  l += "(" + min + " \u2026 " + max + ")";
                else
                  l += $2.gray + "(" + $2.reset + $2.cyan + min + $2.reset + $2.gray + " \u2026 " + $2.reset + $2.magenta + max + $2.reset + $2.gray + ")" + $2.reset;
                l += " ";
                if (!opts.colors)
                  l += p99 + " " + histogram[1];
                else
                  l += $2.gray + p99 + $2.reset + " " + histogram[1];
                print2(l);
                if (r.stats.gc) {
                  l = "";
                  prev_run_gap = true;
                  l += " ".repeat(k_legend - 10);
                  const gcm = $2.time(r.stats.gc.min).padStart(9);
                  const gcx = $2.time(r.stats.gc.max).padStart(9);
                  if (!opts.colors)
                    l += "gc(" + gcm + " \u2026 " + gcx + ")";
                  else
                    l += $2.gray + "gc(" + $2.reset + $2.blue + gcm + $2.reset + $2.gray + " \u2026 " + $2.reset + $2.blue + gcx + $2.reset + $2.gray + ")" + $2.reset;
                  if (r.stats.heap) {
                    l += " ";
                    const ha = $2.bytes(r.stats.heap.avg).padStart(9);
                    const hm = $2.bytes(r.stats.heap.min).padStart(9);
                    const hx = $2.bytes(r.stats.heap.max).padStart(9);
                    if (!opts.colors)
                      l += ha + " (" + hm + "\u2026" + hx + ")";
                    else
                      l += $2.yellow + ha + $2.reset + $2.gray + " (" + $2.reset + $2.yellow + hm + $2.reset + $2.gray + "\u2026" + $2.reset + $2.yellow + hx + $2.reset + $2.gray + ")" + $2.reset;
                  } else {
                    l += " ";
                    const gca = $2.time(r.stats.gc.avg).padStart(9);
                    if (!opts.colors)
                      l += gca + " " + histogram[2];
                    else
                      l += $2.blue + gca + $2.reset + " " + histogram[2];
                  }
                  print2(l);
                } else if (r.stats.heap) {
                  prev_run_gap = true;
                  l = " ".repeat(k_legend - 8);
                  const ha = $2.bytes(r.stats.heap.avg).padStart(9);
                  const hm = $2.bytes(r.stats.heap.min).padStart(9);
                  const hx = $2.bytes(r.stats.heap.max).padStart(9);
                  if (!opts.colors)
                    l += "(" + hm + " \u2026 " + hx + ") " + ha + " " + histogram[2];
                  else
                    l += $2.gray + "(" + $2.reset + $2.yellow + hm + $2.reset + $2.gray + " \u2026 " + $2.reset + $2.yellow + hx + $2.reset + $2.gray + ") " + $2.reset + $2.yellow + ha + $2.reset + " " + histogram[2];
                  print2(l);
                }
                if (r.stats.counters) {
                  l = "";
                  prev_run_gap = true;
                  if (ctx.arch.includes("linux")) {
                    const _bmispred = r.stats.counters._bmispred.avg;
                    const ipc = r.stats.counters.instructions.avg / r.stats.counters.cycles.avg;
                    const cache = 100 - Math.min(100, 100 * r.stats.counters.cache.misses.avg / r.stats.counters.cache.avg);
                    l += " ".repeat(k_legend - 12);
                    if (!opts.colors)
                      l += $2.amount(ipc).padStart(7) + " ipc";
                    else
                      l += $2.bold + $2.green + $2.amount(ipc).padStart(7) + $2.reset + $2.bold + " ipc" + $2.reset;
                    if (!opts.colors)
                      l += " (" + cache.toFixed(2).padStart(6) + "% cache)";
                    else
                      l += $2.gray + " (" + $2.reset + (50 > cache ? $2.red : 84 < cache ? $2.green : $2.yellow) + cache.toFixed(2).padStart(6) + "%" + $2.reset + " cache" + $2.gray + ")" + $2.reset;
                    if (!opts.colors)
                      l += " " + $2.amount(_bmispred).padStart(7) + " branch misses";
                    else
                      l += " " + $2.green + $2.amount(_bmispred).padStart(7) + $2.reset + " branch misses";
                    print2(l);
                    l = "";
                    l += " ".repeat(k_legend - 20);
                    if (opts.colors)
                      l += $2.gray;
                    l += $2.amount(r.stats.counters.cycles.avg).padStart(7) + " cycles";
                    l += " " + $2.amount(r.stats.counters.instructions.avg).padStart(7) + " instructions";
                    l += " " + $2.amount(r.stats.counters.cache.avg).padStart(7) + " c-refs";
                    l += " " + $2.amount(r.stats.counters.cache.misses.avg).padStart(7) + " c-misses";
                    if (opts.colors)
                      l += $2.reset;
                    print2(l);
                  }
                  if (ctx.arch.includes("darwin")) {
                    const ipc = r.stats.counters.instructions.avg / r.stats.counters.cycles.avg;
                    const stalls = 100 * r.stats.counters.cycles.stalls.avg / r.stats.counters.cycles.avg;
                    const ldst = 100 * r.stats.counters.instructions.loads_and_stores.avg / r.stats.counters.instructions.avg;
                    const cache = 100 - Math.min(100, 100 * (r.stats.counters.l1.miss_loads.avg + r.stats.counters.l1.miss_stores.avg) / r.stats.counters.instructions.loads_and_stores.avg);
                    l += " ".repeat(k_legend - 13);
                    if (!opts.colors)
                      l += $2.amount(ipc).padStart(7) + " ipc";
                    else
                      l += $2.bold + $2.green + $2.amount(ipc).padStart(7) + $2.reset + $2.bold + " ipc" + $2.reset;
                    if (!opts.colors)
                      l += " (" + stalls.toFixed(2).padStart(6) + "% stalls)";
                    else
                      l += $2.gray + " (" + $2.reset + (12 > stalls ? $2.green : 50 < stalls ? $2.red : $2.yellow) + stalls.toFixed(2).padStart(6) + "%" + $2.reset + " stalls" + $2.gray + ")" + $2.reset;
                    if (!opts.colors)
                      l += " " + cache.toFixed(2).padStart(6) + "% L1 data cache";
                    else
                      l += " " + (50 > cache ? $2.red : 84 < cache ? $2.green : $2.yellow) + cache.toFixed(2).padStart(6) + "%" + $2.reset + " L1 data cache";
                    print2(l);
                    l = "";
                    l += " ".repeat(k_legend - 20);
                    if (opts.colors)
                      l += $2.gray;
                    l += $2.amount(r.stats.counters.cycles.avg).padStart(7) + " cycles";
                    l += " " + $2.amount(r.stats.counters.instructions.avg).padStart(7) + " instructions";
                    l += " " + ldst.toFixed(2).padStart(6) + "% retired LD/ST (" + $2.amount(r.stats.counters.instructions.loads_and_stores.avg).padStart(7) + ")";
                    if (opts.colors)
                      l += $2.reset;
                    print2(l);
                  }
                }
              }
            }
          }
        }
      }
      if (collection.types.includes("b")) {
        const map = {};
        const colors2 = {};
        for (const [trial, bench2] of trials) {
          for (const r of bench2.runs) {
            if (r.error)
              continue;
            map[r.name] = r.stats.avg;
            colors2[r.name] = $2[trial._highlight];
          }
        }
        if (Object.keys(map).length) {
          print2("");
          $2.barplot.ascii(map, k_legend, 44, {
            steps: -10,
            colors: !opts.colors ? null : colors2
          }).forEach((l) => print2(l));
        }
      }
      if (collection.types.includes("x")) {
        const map = {};
        const colors2 = {};
        if (trials.length === 1) {
          for (const [trial, bench2] of trials) {
            for (const r of bench2.runs) {
              map[r.name] = r.stats;
              colors2[r.name] = $2[trial._highlight];
            }
          }
        } else {
          for (const [trial, bench2] of trials) {
            const runs = bench2.runs.filter((r) => r.stats);
            if (!runs.length)
              continue;
            if (runs.length === 1) {
              map[runs[0].name] = runs[0].stats;
              colors2[runs[0].name] = $2[trial._highlight];
            } else {
              const stats = {
                avg: 0,
                min: Infinity,
                p25: Infinity,
                p75: -Infinity,
                p99: -Infinity
              };
              for (const r of runs) {
                stats.avg += r.stats.avg;
                stats.min = Math.min(stats.min, r.stats.min);
                stats.p25 = Math.min(stats.p25, r.stats.p25);
                stats.p75 = Math.max(stats.p75, r.stats.p75);
                stats.p99 = Math.max(stats.p99, r.stats.p99);
              }
              map[bench2.alias] = stats;
              stats.avg /= runs.length;
              colors2[bench2.alias] = $2[trial._highlight];
            }
          }
        }
        if (Object.keys(map).length) {
          print2("");
          $2.boxplot.ascii(map, k_legend, 44, {
            colors: !opts.colors ? null : colors2
          }).forEach((l) => print2(l));
        }
      }
      if (collection.types.includes("l")) {
        const map = {};
        const extra = {};
        const colors2 = {};
        const labels = {};
        if (trials.length === 1) {
          for (const [trial, bench2] of trials) {
            const runs = bench2.runs.filter((r) => r.stats);
            if (!runs.length)
              continue;
            if (runs.length === 1) {
              const { min, max, avg, peak, bins } = $2.histogram.bins(runs[0].stats, 44, 0.99);
              extra.ymax = peak;
              colors2.xmin = $2.cyan;
              colors2.xmax = $2.magenta;
              extra.ymin = $2.min(bins);
              labels.xmin = $2.time(min);
              labels.xmax = $2.time(max);
              extra.xmax = bins.length - 1;
              colors2[runs[0].name] = $2[trial._highlight] || $2.bold;
              map[runs[0].name] = {
                y: bins,
                x: bins.map((_, o) => o),
                format(x, y, s) {
                  x = Math.round(x * 44);
                  if (!opts.colors)
                    return s;
                  if (x === avg)
                    return $2.yellow + s + $2.reset;
                  return (x < avg ? $2.cyan : $2.magenta) + s + $2.reset;
                }
              };
            } else {
              const avgs = runs.map((r) => r.stats.avg);
              colors2.ymin = $2.cyan;
              colors2.ymax = $2.magenta;
              extra.ymin = $2.min(avgs);
              extra.ymax = $2.max(avgs);
              extra.xmax = runs.length - 1;
              labels.ymin = $2.time(extra.ymin);
              labels.ymax = $2.time(extra.ymax);
              colors2[bench2.alias] = $2[trial._highlight];
              map[bench2.alias] = {
                y: avgs,
                x: avgs.map((_, o) => o)
              };
            }
          }
        } else {
          if (trials.every(([_, bench2]) => bench2.kind === "static")) {
            colors2.xmin = $2.cyan;
            colors2.xmax = $2.magenta;
            for (const [trial, bench2] of trials) {
              for (const r of bench2.runs) {
                if (r.error)
                  continue;
                const { bins, peak, steps } = $2.histogram.bins(r.stats, 44, 0.99);
                const y = bins.map((b) => b / peak);
                map[r.name] = { y, x: steps };
                colors2[r.name] = $2[trial._highlight];
                extra.ymin = Math.min($2.min(y), extra.ymin ?? Infinity);
                extra.ymax = Math.max($2.max(y), extra.ymax ?? -Infinity);
                extra.xmin = Math.min($2.min(steps), extra.xmin ?? Infinity);
                extra.xmax = Math.max($2.max(steps), extra.xmax ?? -Infinity);
                labels.xmin = $2.time(extra.xmin);
                labels.xmax = $2.time(extra.xmax);
              }
            }
          } else {
            let min = Infinity;
            let max = -Infinity;
            for (const [trial, bench2] of trials) {
              for (const r of bench2.runs) {
                if (r.error)
                  continue;
                min = Math.min(min, r.stats.avg);
                max = Math.max(max, r.stats.avg);
              }
            }
            colors2.ymin = $2.cyan;
            colors2.ymax = $2.magenta;
            labels.ymin = $2.time(min);
            labels.ymax = $2.time(max);
            for (const [trial, bench2] of trials) {
              const runs = bench2.runs.filter((r) => r.stats);
              if (!runs.length)
                continue;
              if (runs.length === 1) {
                const y = runs[0].stats.avg / max;
                colors2[runs[0].name] = $2[trial._highlight];
                map[runs[0].name] = { x: [0, 1], y: [y, y] };
                extra.ymin = Math.min(y, extra.ymin ?? Infinity);
                extra.ymax = Math.max(y, extra.ymax ?? -Infinity);
              } else {
                colors2[bench2.alias] = $2[trial._highlight];
                const y = runs.map((r) => r.stats.avg / max);
                extra.ymin = Math.min($2.min(y), extra.ymin ?? Infinity);
                extra.ymax = Math.max($2.max(y), extra.ymax ?? -Infinity);
                map[bench2.alias] = { y, x: runs.map((_, o) => o / (runs.length - 1)) };
              }
            }
          }
        }
        if (Object.keys(map).length) {
          print2("");
          $2.lineplot.ascii(map, {
            labels,
            ...extra,
            width: 44,
            height: 16,
            key: k_legend,
            colors: !opts.colors ? null : colors2
          }).forEach((l) => print2(l));
        }
      }
      if (collection.types.includes("s")) {
        trials.sort((a, b) => {
          const aa = a[1].runs.filter((r) => r.stats);
          const bb = b[1].runs.filter((r) => r.stats);
          if (aa.length === 0)
            return 1;
          if (bb.length === 0)
            return -1;
          const a_avg = aa.reduce((a2, r) => a2 + r.stats.avg, 0) / aa.length;
          const b_avg = bb.reduce((a2, r) => a2 + r.stats.avg, 0) / bb.length;
          return a_avg - b_avg;
        });
        if (trials.length === 1) {
          const runs = trials[0][1].runs.filter((r) => r.stats).sort((a, b) => a.stats.avg - b.stats.avg);
          if (1 < runs.length) {
            print2("");
            if (!opts.colors)
              print2("summary");
            else
              print2($2.bold + "summary" + $2.reset);
            if (!opts.colors)
              print2("  " + runs[0].name);
            else
              print2(" ".repeat(2) + $2.bold + $2.cyan + runs[0].name + $2.reset);
            for (let o = 1;o < runs.length; o++) {
              const r = runs[o];
              const baseline = runs[0];
              const faster = r.stats.avg >= baseline.stats.avg;
              const diff = !faster ? Number((1 / r.stats.avg * baseline.stats.avg).toFixed(2)) : Number((1 / baseline.stats.avg * r.stats.avg).toFixed(2));
              if (!opts.colors)
                print2(" ".repeat(3) + diff + `x ${faster ? "faster" : "slower"} than ${r.name}`);
              else
                print2(" ".repeat(3) + (!faster ? $2.red : $2.green) + diff + $2.reset + `x ${faster ? "faster" : "slower"} than ${$2.bold + $2.cyan + r.name + $2.reset}`);
            }
          }
        } else {
          let header = false;
          const baseline = trials.find(([trial, bench2]) => bench2.baseline && bench2.runs.some((r) => r.stats))?.[1] || trials[0][1];
          if (baseline) {
            const bruns = baseline.runs.filter((r) => !r.error).sort((a, b) => a.stats.avg - b.stats.avg);
            for (const [trial, bench2] of trials) {
              if (bench2 === baseline)
                continue;
              const runs = bench2.runs.filter((r) => !r.error).sort((a, b) => a.stats.avg - b.stats.avg);
              if (!runs.length)
                continue;
              if (!header) {
                print2("");
                header = true;
                if (!opts.colors)
                  print2("summary");
                else
                  print2($2.bold + "summary" + $2.reset);
                if (bruns.length !== 1) {
                  if (!opts.colors)
                    print2("  " + baseline.alias);
                  else
                    print2(" ".repeat(2) + $2.bold + $2.cyan + baseline.alias + $2.reset);
                } else {
                  if (!opts.colors)
                    print2("  " + bruns[0].name);
                  else
                    print2(" ".repeat(2) + $2.bold + $2.cyan + bruns[0].name + $2.reset);
                }
              }
              if (runs.length === 1 && bruns.length === 1) {
                const r = runs[0];
                const br = bruns[0];
                const faster = r.stats.avg >= br.stats.avg;
                const diff = !faster ? Number((1 / r.stats.avg * br.stats.avg).toFixed(2)) : Number((1 / br.stats.avg * r.stats.avg).toFixed(2));
                if (!opts.colors)
                  print2(" ".repeat(3) + diff + `x ${faster ? "faster" : "slower"} than ${r.name}`);
                else
                  print2(" ".repeat(3) + (!faster ? $2.red : $2.green) + diff + $2.reset + `x ${faster ? "faster" : "slower"} than ${$2.bold + $2.cyan + r.name + $2.reset}`);
              } else {
                const rf = runs[0];
                const bf = bruns[0];
                const rs = runs[runs.length - 1];
                const bs = bruns[bruns.length - 1];
                const ravg = runs.reduce((a, r) => a + r.stats.avg, 0) / runs.length;
                const bavg = bruns.reduce((a, r) => a + r.stats.avg, 0) / bruns.length;
                const faster = ravg >= bavg;
                const sfaster = rs.stats.avg >= bs.stats.avg;
                const ffaster = rf.stats.avg >= bf.stats.avg;
                const sdiff = !sfaster ? Number((1 / rs.stats.avg * bs.stats.avg).toFixed(2)) : Number((1 / bs.stats.avg * rs.stats.avg).toFixed(2));
                const fdiff = !ffaster ? Number((1 / rf.stats.avg * bf.stats.avg).toFixed(2)) : Number((1 / bf.stats.avg * rf.stats.avg).toFixed(2));
                if (!opts.colors)
                  print2(" ".repeat(3) + (sdiff === 1 ? sdiff : (sfaster ? "+" : "-") + sdiff) + "\u2026" + (fdiff === 1 ? fdiff : (ffaster ? "+" : "-") + fdiff) + `x ${faster ? "faster" : "slower"} than ${runs.length === 1 ? rf.name : bench2.alias}`);
                else
                  print2(" ".repeat(3) + (sdiff === 1 ? $2.gray + sdiff + $2.reset : !sfaster ? $2.red + "-" + sdiff + $2.reset : $2.green + "+" + sdiff + $2.reset) + "\u2026" + (fdiff === 1 ? $2.gray + fdiff + $2.reset : !ffaster ? $2.red + "-" + fdiff + $2.reset : $2.green + "+" + fdiff + $2.reset) + `x ${faster ? "faster" : "slower"} than ${$2.bold + $2.cyan + (runs.length === 1 ? rf.name : bench2.alias) + $2.reset}`);
              }
            }
          }
        }
      }
    }
    let nl = false;
    if ($counters === false)
      if (!opts.colors)
        print2(""), nl = true, print2("! = run with sudo to enable hardware counters");
      else
        print2(""), nl = true, print2($2.yellow + "!" + $2.reset + $2.gray + " = " + $2.reset + "run with sudo to enable hardware counters");
    if (optimized_out_warning)
      if (!opts.colors)
        nl || print2(""), print2(" ".repeat(k_legend - 13) + "benchmark was likely optimized out (dead code elimination) = !"), print2(" ".repeat(k_legend - 13) + "https://github.com/evanwashere/mitata#writing-good-benchmarks");
      else
        nl || print2(""), print2(" ".repeat(k_legend - 13) + "benchmark was likely optimized out " + $2.gray + "(dead code elimination)" + $2.reset + $2.gray + " = " + $2.reset + $2.red + "!" + $2.reset), print2(" ".repeat(k_legend - 13) + $2.gray + "https://github.com/evanwashere/mitata#writing-good-benchmarks" + $2.reset);
  }
};
var $2 = {
  bold: "\x1B[1m",
  reset: "\x1B[0m",
  red: "\x1B[31m",
  cyan: "\x1B[36m",
  blue: "\x1B[34m",
  gray: "\x1B[90m",
  white: "\x1B[37m",
  black: "\x1B[30m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  magenta: "\x1B[35m",
  colors: ["red", "cyan", "blue", "green", "yellow", "magenta", "gray", "white", "black"],
  clamp(m, v, x) {
    return v < m ? m : v > x ? x : v;
  },
  min(arr, s = Infinity) {
    return arr.reduce((x, v) => Math.min(x, v), s);
  },
  max(arr, s = -Infinity) {
    return arr.reduce((x, v) => Math.max(x, v), s);
  },
  str(s, len = 3) {
    if (len >= s.length)
      return s;
    return `${s.slice(0, len - 2)}..`;
  },
  amount(n) {
    if (Number.isNaN(n))
      return "NaN";
    if (n < 1000)
      return n.toFixed(2);
    n /= 1000;
    if (n < 1000)
      return `${n.toFixed(2)}k`;
    n /= 1000;
    if (n < 1000)
      return `${n.toFixed(2)}M`;
    n /= 1000;
    if (n < 1000)
      return `${n.toFixed(2)}G`;
    n /= 1000;
    if (n < 1000)
      return `${n.toFixed(2)}T`;
    n /= 1000;
    return `${n.toFixed(2)}P`;
  },
  bytes(b, pad = true) {
    if (Number.isNaN(b))
      return "NaN";
    if (b < 1000)
      return `${b.toFixed(2)} ${!pad ? "" : " "}b`;
    b /= 1024;
    if (b < 1000)
      return `${b.toFixed(2)} kb`;
    b /= 1024;
    if (b < 1000)
      return `${b.toFixed(2)} mb`;
    b /= 1024;
    if (b < 1000)
      return `${b.toFixed(2)} gb`;
    b /= 1024;
    if (b < 1000)
      return `${b.toFixed(2)} tb`;
    b /= 1024;
    return `${b.toFixed(2)} pb`;
  },
  time(ns) {
    if (ns < 1)
      return `${(ns * 1000).toFixed(2)} ps`;
    if (ns < 1000)
      return `${ns.toFixed(2)} ns`;
    ns /= 1000;
    if (ns < 1000)
      return `${ns.toFixed(2)} \xB5s`;
    ns /= 1000;
    if (ns < 1000)
      return `${ns.toFixed(2)} ms`;
    ns /= 1000;
    if (ns < 1000)
      return `${ns.toFixed(2)} s`;
    ns /= 60;
    if (ns < 1000)
      return `${ns.toFixed(2)} m`;
    ns /= 60;
    return `${ns.toFixed(2)} h`;
  },
  barplot: {
    symbols: {
      bar: "\u25A0",
      legend: "\u2524",
      tl: "\u250C",
      tr: "\u2510",
      bl: "\u2514",
      br: "\u2518"
    },
    ascii(map, key = 8, size = 14, { steps = 0, fmt = $2.time, colors: colors2 = true, symbols = $2.barplot.symbols } = {}) {
      const values = Object.values(map);
      const canvas = new Array(2 + values.length).fill("");
      steps += size;
      const min = $2.min(values);
      const max = $2.max(values);
      const step = (max - min) / steps;
      canvas[0] += " ".repeat(1 + key);
      canvas[0] += symbols.tl + " ".repeat(size) + symbols.tr;
      Object.keys(map).forEach((name, o) => {
        const value = map[name];
        const bars = Math.round((value - min) / step);
        if (colors2?.[name])
          canvas[o + 1] += colors2[name];
        canvas[o + 1] += $2.str(name, key).padStart(key);
        if (colors2?.[name])
          canvas[o + 1] += $2.reset;
        canvas[o + 1] += " " + symbols.legend;
        if (colors2)
          canvas[o + 1] += $2.gray;
        canvas[o + 1] += symbols.bar.repeat(bars);
        if (colors2)
          canvas[o + 1] += $2.reset;
        canvas[o + 1] += " ";
        if (colors2)
          canvas[o + 1] += $2.yellow;
        canvas[o + 1] += fmt(value);
        if (colors2)
          canvas[o + 1] += $2.reset;
      });
      canvas[canvas.length - 1] += " ".repeat(1 + key);
      canvas[canvas.length - 1] += symbols.bl + " ".repeat(size) + symbols.br;
      return canvas;
    }
  },
  canvas: {
    braille(width, height) {
      const vwidth = 2 * width;
      const vheight = 4 * height;
      const buffer = new Uint8Array(vwidth * vheight);
      const symbols = [
        10241,
        10242,
        10244,
        10304,
        10248,
        10256,
        10272,
        10368
      ];
      return {
        buffer,
        width,
        height,
        vwidth,
        vheight,
        set(x, y, tag = 1) {
          buffer[x + y * vwidth] = tag;
        },
        line(s, e, tag = 1) {
          s.x = Math.round(s.x);
          s.y = Math.round(s.y);
          e.x = Math.round(e.x);
          e.y = Math.round(e.y);
          const dx = Math.abs(e.x - s.x);
          const dy = Math.abs(e.y - s.y);
          let err = dx - dy;
          let x = s.x;
          let y = s.y;
          const sx = s.x < e.x ? 1 : -1;
          const sy = s.y < e.y ? 1 : -1;
          while (true) {
            buffer[x + y * vwidth] = tag;
            if (x === e.x && y === e.y)
              break;
            const e2 = 2 * err;
            if (e2 < dx)
              y += sy, err += dx;
            if (e2 > -dy)
              x += sx, err -= dy;
          }
        },
        toString({
          background = false,
          format = (x, y, s, tag, backgorund) => s
        } = {}) {
          const canvas = new Array(height).fill("");
          for (let y = 0;y < vheight; y += 4) {
            const y0 = y * vwidth;
            const y1 = y0 + vwidth;
            const y2 = y1 + vwidth;
            const y3 = y2 + vwidth;
            for (let x = 0;x < vwidth; x += 2) {
              let c = 10240;
              if (buffer[x + y0])
                c |= symbols[0];
              if (buffer[1 + x + y0])
                c |= symbols[4];
              if (buffer[x + y1])
                c |= symbols[1];
              if (buffer[1 + x + y1])
                c |= symbols[5];
              if (buffer[x + y2])
                c |= symbols[2];
              if (buffer[1 + x + y2])
                c |= symbols[6];
              if (buffer[x + y3])
                c |= symbols[3];
              if (buffer[1 + x + y3])
                c |= symbols[7];
              if (c === 10240 && !background)
                canvas[y / 4] += " ";
              else
                canvas[y / 4] += format(x / (vwidth - 1), y / (vheight - 1), String.fromCharCode(c), buffer[x + y0] || buffer[1 + x + y0] || buffer[x + y1] || buffer[1 + x + y1] || buffer[x + y2] || buffer[1 + x + y2] || buffer[x + y3] || buffer[1 + x + y3], c === 10240);
            }
          }
          return canvas;
        }
      };
    }
  },
  lineplot: {
    symbols: {
      tl: "\u250C",
      tr: "\u2510",
      bl: "\u2514",
      br: "\u2518"
    },
    ascii(map, {
      colors: colors2 = true,
      xmin = 0,
      xmax = 1,
      ymin = 0,
      ymax = 1,
      symbols = $2.lineplot.symbols,
      key = 8,
      width = 12,
      height = 12,
      labels = { xmin: null, xmax: null, ymin: null, ymax: null }
    } = {}) {
      const keys = Object.keys(map);
      const _canvas = $2.canvas.braille(width, height);
      const xs = (_canvas.vwidth - 1) / (xmax - xmin);
      const ys = (_canvas.vheight - 1) / (ymax - ymin);
      const colorsv = Object.entries(colors2).filter(([n]) => !Object.keys(labels).includes(n)).map(([_, v]) => v);
      const acolors = $2.colors.filter((n) => !colorsv.includes($2[n]));
      keys.forEach((name, k) => {
        const { x: xp, y: yp } = map[name];
        for (let o = 0;o < xp.length - 1; o++) {
          if (xp[o] == null || xp[o + 1] == null)
            continue;
          if (yp[o] == null || yp[o + 1] == null)
            continue;
          const s = { x: Math.round(xs * (xp[o] - xmin)), y: _canvas.vheight - 1 - Math.round(ys * (yp[o] - ymin)) };
          const e = { x: Math.round(xs * (xp[o + 1] - xmin)), y: _canvas.vheight - 1 - Math.round(ys * (yp[o + 1] - ymin)) };
          _canvas.line(s, e, 1 + k);
        }
      });
      const canvas = new Array(2 + _canvas.height).fill("");
      canvas[0] += " ".repeat(1 + key);
      canvas[0] += symbols.tl + " ".repeat(width) + symbols.tr;
      const lines = _canvas.toString({
        format(x, y, s, tag) {
          const name = keys[tag - 1];
          if (map[name].format)
            return map[name].format(x, y, s);
          else if (colors2?.[name])
            return colors2[name] + s + $2.reset;
          else
            return $2[acolors[(tag - 1) % acolors.length]] + s + $2.reset;
        }
      });
      const plabels = {
        0: !colors2?.ymax ? labels.ymax || "" : colors2.ymax + (labels.ymax || "") + $2.reset,
        [lines.length - 1]: !colors2?.ymin ? labels.ymin || "" : colors2.ymin + (labels.ymin || "") + $2.reset
      };
      const legends = keys.map((name, k) => {
        if (colors2?.[name])
          return colors2[name] + $2.str(name, key).padStart(key) + $2.reset;
        else
          return $2[acolors[k % acolors.length]] + $2.str(name, key).padStart(key) + $2.reset;
      });
      lines.forEach((l, o) => {
        canvas[o + 1] += legends[o] ?? " ".repeat(key);
        canvas[o + 1] += " ".repeat(2) + l + (!plabels[o] ? "" : " " + plabels[o]);
      });
      canvas[canvas.length - 1] += " ".repeat(1 + key);
      canvas[canvas.length - 1] += symbols.bl + " ".repeat(width) + symbols.br;
      if (labels.xmin || labels.xmax) {
        const xmin2 = labels.xmin || "";
        const xmax2 = labels.xmax || "";
        const gap = 2 + width - xmin2.length;
        canvas.push(" ".repeat(key) + " " + (!colors2?.xmin ? xmin2 : colors2.xmin + xmin2 + $2.reset) + (!colors2?.xmax ? xmax2.padStart(gap) : colors2.xmax + xmax2.padStart(gap) + $2.reset));
      }
      return canvas;
    }
  },
  histogram: {
    symbols: ["\u2581", "\u2582", "\u2583", "\u2584", "\u2585", "\u2586", "\u2587", "\u2588"],
    bins(stats, size = 6, percentile = 1) {
      const offset = percentile * (stats.samples.length - 1) | 0;
      let min = stats.min;
      const max = stats.samples[offset] || stats.max || 1;
      const steps = new Array(size);
      const bins = new Array(size).fill(0);
      const step = (max - min) / (size - 1);
      if (step === 0) {
        min = 0;
        for (let o = 0;o < size; o++)
          steps[o] = o * step;
        bins[$2.clamp(0, Math.round((stats.avg - min) / step), size - 1)] = 1;
      } else {
        for (let o = 0;o < size; o++)
          steps[o] = min + o * step;
        for (let o = 0;o <= offset; o++)
          bins[Math.round((stats.samples[o] - min) / step)]++;
      }
      return {
        min,
        max,
        step,
        bins,
        steps,
        peak: $2.max(bins),
        outliers: stats.samples.length - 1 - offset,
        avg: $2.clamp(0, Math.round((stats.avg - min) / step), size - 1)
      };
    },
    ascii(_bins, height = 1, { colors: colors2 = true, symbols = $2.histogram.symbols } = {}) {
      const canvas = new Array(height);
      const { avg, peak, bins } = _bins;
      const scale = (height * symbols.length - 1) / peak;
      for (let y = 0;y < height; y++) {
        let l = "";
        if (avg !== 0) {
          if (colors2)
            l += $2.cyan;
          for (let o = 0;o < avg; o++) {
            const b = bins[o];
            if (y === 0)
              l += symbols[$2.clamp(0, Math.round(b * scale), symbols.length - 1)];
            else {
              const min = y * symbols.length;
              const max = (y + 1) * symbols.length;
              const offset = Math.round(b * scale) | 0;
              if (min >= offset)
                l += " ";
              else if (max <= offset)
                l += symbols[symbols.length - 1];
              else
                l += symbols[$2.clamp(min, offset, max) % symbols.length];
            }
          }
          if (colors2)
            l += $2.reset;
        }
        {
          if (colors2)
            l += $2.yellow;
          const b = bins[avg];
          if (y === 0)
            l += symbols[$2.clamp(0, Math.round(b * scale), symbols.length - 1)];
          else {
            const min = y * symbols.length;
            const max = (y + 1) * symbols.length;
            const offset = Math.round(b * scale) | 0;
            if (min >= offset)
              l += " ";
            else if (max <= offset)
              l += symbols[symbols.length - 1];
            else
              l += symbols[$2.clamp(min, offset, max) % symbols.length];
          }
          if (colors2)
            l += $2.reset;
        }
        if (avg != bins.length - 1) {
          if (colors2)
            l += $2.magenta;
          for (let o = 1 + avg;o < bins.length; o++) {
            const b = bins[o];
            if (y === 0)
              l += symbols[$2.clamp(0, Math.round(b * scale), symbols.length - 1)];
            else {
              const min = y * symbols.length;
              const max = (y + 1) * symbols.length;
              const offset = Math.round(b * scale) | 0;
              if (min >= offset)
                l += " ";
              else if (max <= offset)
                l += symbols[symbols.length - 1];
              else
                l += symbols[$2.clamp(min, offset, max) % symbols.length];
            }
          }
          if (colors2)
            l += $2.reset;
        }
        canvas[y] = l;
      }
      return canvas.reverse();
    }
  },
  boxplot: {
    symbols: {
      v: "\u2502",
      h: "\u2500",
      tl: "\u250C",
      tr: "\u2510",
      bl: "\u2514",
      br: "\u2518",
      avg: {
        top: "\u252C",
        middle: "\u2502",
        bottom: "\u2534"
      },
      tail: {
        top: "\u2577",
        bottom: "\u2575",
        middle: ["\u251C", "\u2524"]
      }
    },
    ascii(map, key = 8, size = 14, { fmt = $2.time, colors: colors2 = true, symbols = $2.boxplot.symbols } = {}) {
      let tmin = Infinity;
      let tmax = -Infinity;
      const keys = Object.keys(map);
      const canvas = new Array(3 + 3 * keys.length).fill("");
      for (const name of keys) {
        const stats = map[name];
        if (tmin > stats.min)
          tmin = stats.min;
        const max = stats.p99 || stats.max || 1;
        if (max > tmax)
          tmax = max;
      }
      const steps = 2 + size;
      const step = (tmax - tmin) / (steps - 1);
      canvas[0] += " ".repeat(1 + key);
      canvas[0] += symbols.tl + " ".repeat(size) + symbols.tr;
      keys.forEach((name, o) => {
        o *= 3;
        const stats = map[name];
        const min = stats.min;
        const avg = stats.avg;
        const p25 = stats.p25;
        const p75 = stats.p75;
        const max = stats.p99 || stats.max || 1;
        const min_offset = 1 + Math.min(steps - 1, Math.round((min - tmin) / step));
        const max_offset = 1 + Math.min(steps - 1, Math.round((max - tmin) / step));
        const avg_offset = 1 + Math.min(steps - 1, Math.round((avg - tmin) / step));
        const p25_offset = 1 + Math.min(steps - 1, Math.round((p25 - tmin) / step));
        const p75_offset = 1 + Math.min(steps - 1, Math.round((p75 - tmin) / step));
        const u = new Array(2 + steps).fill(" ");
        const m = new Array(2 + steps).fill(" ");
        const l = new Array(2 + steps).fill(" ");
        u[0] = !colors2 ? "" : $2.cyan;
        m[0] = !colors2 ? "" : $2.cyan;
        l[0] = !colors2 ? "" : $2.cyan;
        if (min_offset < p25_offset) {
          u[min_offset] = symbols.tail.top;
          l[min_offset] = symbols.tail.bottom;
          m[min_offset] = symbols.tail.middle[0];
          for (let o2 = 1 + min_offset;o2 < p25_offset; o2++)
            m[o2] = symbols.h;
        }
        if (avg_offset > p25_offset) {
          u[p25_offset] = symbols.tl;
          l[p25_offset] = symbols.bl;
          m[p25_offset] = min_offset === p25_offset ? symbols.v : symbols.tail.middle[1];
          for (let o2 = 1 + p25_offset;o2 < avg_offset; o2++)
            u[o2] = l[o2] = symbols.h;
        }
        u[avg_offset] = !colors2 ? symbols.avg.top : $2.reset + $2.yellow + symbols.avg.top + $2.reset + $2.magenta;
        l[avg_offset] = !colors2 ? symbols.avg.bottom : $2.reset + $2.yellow + symbols.avg.bottom + $2.reset + $2.magenta;
        m[avg_offset] = !colors2 ? symbols.avg.middle : $2.reset + $2.yellow + symbols.avg.middle + $2.reset + $2.magenta;
        if (avg_offset < p75_offset) {
          u[p75_offset] = symbols.tr;
          l[p75_offset] = symbols.br;
          m[p75_offset] = max_offset === p75_offset ? symbols.v : symbols.tail.middle[0];
          for (let o2 = 1 + avg_offset;o2 < p75_offset; o2++)
            u[o2] = l[o2] = symbols.h;
        }
        if (max_offset > p75_offset) {
          u[max_offset] = symbols.tail.top;
          l[max_offset] = symbols.tail.bottom;
          m[max_offset] = symbols.tail.middle[1];
          for (let o2 = 1 + Math.max(avg_offset, p75_offset);o2 < max_offset; o2++)
            m[o2] = symbols.h;
        }
        canvas[o + 1] = " ".repeat(1 + key) + u.join("").trimEnd() + (!colors2 ? "" : $2.reset);
        if (colors2?.[name])
          canvas[o + 2] += colors2[name];
        canvas[o + 2] += $2.str(name, key).padStart(key);
        if (colors2?.[name])
          canvas[o + 2] += $2.reset;
        canvas[o + 2] += " " + m.join("").trimEnd() + (!colors2 ? "" : $2.reset);
        canvas[o + 3] = " ".repeat(1 + key) + l.join("").trimEnd() + (!colors2 ? "" : $2.reset);
      });
      canvas[canvas.length - 2] += " ".repeat(1 + key);
      canvas[canvas.length - 2] += symbols.bl + " ".repeat(size) + symbols.br;
      const rmin = fmt(tmin);
      const rmax = fmt(tmax);
      const rmid = fmt((tmin + tmax) / 2);
      const gap = (size - rmin.length - rmid.length - rmax.length) / 2;
      canvas[canvas.length - 1] += " ".repeat(1 + key);
      canvas[canvas.length - 1] += !colors2 ? rmin : $2.cyan + rmin + $2.reset;
      canvas[canvas.length - 1] += " ".repeat(1 + gap | 0);
      canvas[canvas.length - 1] += !colors2 ? rmid : $2.gray + rmid + $2.reset;
      canvas[canvas.length - 1] += " ".repeat(1 + Math.ceil(gap));
      canvas[canvas.length - 1] += !colors2 ? rmax : $2.magenta + rmax + $2.reset;
      return canvas;
    }
  }
};

// tests/sha256.js
var Sha256 = {};
Sha256.hash = function(numArray) {
  let msg = numArray;
  let K = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ];
  let H = [
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ];
  msg += String.fromCharCode(128);
  let l = msg.length / 4 + 2;
  let N = Math.ceil(l / 16);
  let M = new Array(N);
  for (let i = 0;i < N; i++) {
    M[i] = new Array(16);
    for (let j = 0;j < 16; j++) {
      M[i][j] = msg.charCodeAt(i * 64 + j * 4) << 24 | msg.charCodeAt(i * 64 + j * 4 + 1) << 16 | msg.charCodeAt(i * 64 + j * 4 + 2) << 8 | msg.charCodeAt(i * 64 + j * 4 + 3);
    }
  }
  M[N - 1][14] = (msg.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (msg.length - 1) * 8 & 4294967295;
  let W = new Array(64);
  let a, b, c, d, e, f, g, h;
  for (let i = 0;i < N; i++) {
    for (let t = 0;t < 16; t++)
      W[t] = M[i][t];
    for (let t = 16;t < 64; t++) {
      W[t] = Sha256.\u{3c3}1(W[t - 2]) + W[t - 7] + Sha256.\u{3c3}0(W[t - 15]) + W[t - 16] & 4294967295;
    }
    a = H[0];
    b = H[1];
    c = H[2];
    d = H[3];
    e = H[4];
    f = H[5];
    g = H[6];
    h = H[7];
    for (let t = 0;t < 64; t++) {
      let T1 = h + Sha256.\u{3a3}1(e) + Sha256.Ch(e, f, g) + K[t] + W[t];
      let T2 = Sha256.\u{3a3}0(a) + Sha256.Maj(a, b, c);
      h = g;
      g = f;
      f = e;
      e = d + T1 & 4294967295;
      d = c;
      c = b;
      b = a;
      a = T1 + T2 & 4294967295;
    }
    H[0] = H[0] + a & 4294967295;
    H[1] = H[1] + b & 4294967295;
    H[2] = H[2] + c & 4294967295;
    H[3] = H[3] + d & 4294967295;
    H[4] = H[4] + e & 4294967295;
    H[5] = H[5] + f & 4294967295;
    H[6] = H[6] + g & 4294967295;
    H[7] = H[7] + h & 4294967295;
  }
  return Sha256.toHexStr(H[0]) + Sha256.toHexStr(H[1]) + Sha256.toHexStr(H[2]) + Sha256.toHexStr(H[3]) + Sha256.toHexStr(H[4]) + Sha256.toHexStr(H[5]) + Sha256.toHexStr(H[6]) + Sha256.toHexStr(H[7]);
};
Sha256.ROTR = function(n, x) {
  return x >>> n | x << 32 - n;
};
Sha256.\u{3a3}0 = function(x) {
  return Sha256.ROTR(2, x) ^ Sha256.ROTR(13, x) ^ Sha256.ROTR(22, x);
};
Sha256.\u{3a3}1 = function(x) {
  return Sha256.ROTR(6, x) ^ Sha256.ROTR(11, x) ^ Sha256.ROTR(25, x);
};
Sha256.\u{3c3}0 = function(x) {
  return Sha256.ROTR(7, x) ^ Sha256.ROTR(18, x) ^ x >>> 3;
};
Sha256.\u{3c3}1 = function(x) {
  return Sha256.ROTR(17, x) ^ Sha256.ROTR(19, x) ^ x >>> 10;
};
Sha256.Ch = function(x, y, z) {
  return x & y ^ ~x & z;
};
Sha256.Maj = function(x, y, z) {
  return x & y ^ x & z ^ y & z;
};
Sha256.toHexStr = function(n) {
  let s = "", v;
  for (let i = 7;i >= 0; i--) {
    v = n >>> i * 4 & 15;
    s += v.toString(16);
  }
  return s;
};
bench("sha256", () => {
  const arr = [];
  for (const key of [12345, 678910, 114514, 1919810]) {
    const r = Sha256.hash(Array.from(Array(1e5).keys(), (i, _) => i ^ key));
    arr.push(r);
  }
});
await run({
  format: "json"
});
