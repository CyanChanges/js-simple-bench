# Benchmarks

## Requirements
Have `bun` or `deno` installed,
Have Rust toolchains ready (`cargo`)

## Prepare

** Bun **
```shell
bun run compile
```

** Deno **
```shell
deno task compile
```

## Benchmarks

### **Engines Benchmark**

**V8** VS **JavaScriptCore**

```shell
# Deno
deno task bench:engines

# Bun
bun run bench:engines
```

### **Runtimes Benchmark**

**Deno** VS **Bun** VS **Node.js**

```shell
# Deno
deno task bench:runtimes

# Bun
bun run bench:runtimes
```
