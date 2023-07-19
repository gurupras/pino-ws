import build from 'pino-abstract-transport'
import WebSocket from 'ws'

export interface Options {
  url: string
  reconnect?: boolean
}

interface Log {
  level: number
  [key: string]: any
}

export default async function (options: Options) {
  const { url } = options
  if (!url) {
    throw new Error('Must provide URL')
  }

  const buffer: Log[] = []

  const ws = new WebSocket(url)

  let wsClosed = false

  const flushBuffer = () => {
    for (const entry of buffer) {
      ws.send(JSON.stringify(entry))
    }
  }
  ws.on('open', () => {
    flushBuffer()
  })
  ws.on('error', () => {
    wsClosed = true
  })
  ws.on('close', () => {
    wsClosed = true
  })

  return build(async (source) => {
    for await (const obj of source) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(obj))
      } else if (!wsClosed) {
        buffer.push(obj)
      }
    }
  }, {
    close (_, cb) {
      if (ws.readyState === WebSocket.OPEN) {
        flushBuffer()
      }
      ws.on('close', () => cb())
      ws.close()
    }
  })
}
