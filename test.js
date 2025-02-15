import crypto from 'node:crypto'
import {readFile} from 'node:fs/promises'

console.log('start hashing')

const digest = crypto.createHash('sha256').update(await readFile('/tmp/bench/10m-binary')).digest('base64')

console.log(digest)

