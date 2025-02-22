# Benchmarks

> [!WARNING]
> These benchmarks may not represent a real-world scenario.
>

Simple JavaScript Benchmarks.
For Engines (V8, JavaScriptCore), and Runtimes (Deno, Bun, Node.js)

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

### **Engines Benchmark (Inside)**

**V8** VS **JavaScriptCore**

```shell
bun run bench:engines

# todo: Deno support
```

### **Engines Benchmark (Inside)**

**V8** VS **JavaScriptCore**

```shell
# Deno
deno task bench:engines:out

# Bun
bun run bench:engines:out
```

### **Runtimes Benchmark**

**Deno** VS **Bun** VS **Node.js**

```shell
# Deno
deno task bench:runtimes

# Bun
bun run bench:runtimes
```

#### Benchmark node:crypto hasher

```shell
# Deno
deno task bench:runtimes:hash

# Bun
bun run bench:runtimes:hash
```
