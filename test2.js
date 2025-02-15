import crypto from 'node:crypto'

console.log('start hashing')

const digest = crypto.createHash('sha256').update('a'.repeat(1024*1024)).digest('base64')

console.log(digest)

