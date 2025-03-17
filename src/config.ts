import { load } from "js-yaml";

const file = Bun.file('./config.yaml')
const yaml = await file.text();

interface Config {
  server: {
    port: number | undefined
  },
  game: {
    system: {
      round: number
      draw: {
        top: number
        override: number
      }
      handicap: {
        draw: boolean
        cp: boolean
      }
      cp: {
        init: number
        increase: number
      }
    }
    player: {
      max: {
        life: number
        hand: number
        trigger: number
        field: number
        cp: number
      }
    }
  }
}

export const config = load(yaml) as Config