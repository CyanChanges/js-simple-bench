import { Buffer } from 'node:buffer'

function readCode() {
  if (typeof Bun !== 'undefined') return Bun.file('./sha256.js').text()
  else if (typeof Deno !== 'undefined') return Deno.readTextFile('./sha256.js')
  else throw new Error("Runtime not supported")
}

async function go(engine_file: string, code: string) {
  if (typeof Bun !== 'undefined') {
    const { spawn } = await import('bun')

    await spawn([engine_file], { stdin: new Response(code), stdout: "inherit" })
  }  
  else if (typeof Deno !== 'undefined') { 
    const command = new Deno.Command(engine_file, {
      stdin: "piped",
      stdout: "inherit"
    })
    const child = command.spawn()
    const writer = child.stdin.getWriter()
    writer.write(Buffer.from(code, 'utf-8'))
    writer.close()
    await child.status
  } else throw new Error("Runtime not supported")
}

const engine = globalThis?.Deno?.args[0] ?? globalThis?.Bun?.argv?.[2]

console.log("Benchmarking for", engine)

let engine_file
switch (engine) {
  case 'jsc':
    engine_file = './jsc/target/release/jsc'
    break
  case 'v8':
    engine_file = './v8/target/release/v8'
    break
  default:
    throw new Error("Unknown Engine: ", engine)
}

console.log('Engine at', engine_file)

const code = await readCode()

await go(engine_file, code)

