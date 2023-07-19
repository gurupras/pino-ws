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

  return build(async (source) => {
    for await (const obj of source) {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(obj))
      }
    }
  })
}
