import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { bench, boxplot, run, summary } from "mitata";

function readCode() {
  if (typeof Bun !== "undefined") return Bun.file("./sha256.js").text();
  else if (typeof Deno !== "undefined") return Deno.readTextFile("./sha256.js");
  else return readFile("./sha256.js", "utf-8");
}

async function go(engine_file: string, code: string) {
  if (typeof Bun !== "undefined") {
    const { spawn } = await import("bun");

    const proc = await spawn([engine_file], {
      stdin: new Response(code),
      stdout: null,
    });
    await proc.exited;
  } else if (typeof Deno !== "undefined") {
    const command = new Deno.Command(engine_file, {
      stdin: "piped",
      stdout: "piped", // piped but ignored
    });
    const child = command.spawn();
    const writer = child.stdin.getWriter();
    writer.write(Buffer.from(code, "utf-8"));
    writer.close();
    await child.status;
  } else {
    return new Promise<void>((res, rej) => {
      const child = spawn(engine_file, [], {
        stdio: ["pipe", "ignore", "ignore"],
      });
      child.stdin.write(code);
      child.stdin.end();
      child.on("error", rej);
      child.on("exit", (code) => code ? rej(code) : res());
    });
  }
}

const code = await readCode();

boxplot(() => {
  summary(() => {
    bench("jsc", function* () {
      yield () => go("./jsc/target/release/jsc", code);
    });
    bench("v8", function* () {
      yield () => go("./v8/target/release/v8", code);
    });
  });
});

await run();
