import { load } from 'js-yaml'
import type { Rule } from './submodule/suit/types'

const file = Bun.file('./config.yaml')
const yaml = await file.text()

interface Config {
  server: {
    port: number | undefined
  }
  game: Rule
}

export const config = load(yaml) as Config
