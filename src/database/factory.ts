import type { Core } from '@/package/core/core';
import type { Catalog, ICard } from '../submodule/suit/types/game/card';
import type { Stack } from '@/package/core/class/stack';
import { EffectTemplate } from './effects';
import { Color } from '@/submodule/suit/constant/color';

export interface HandlerFunction {
  (stack: Stack, card: ICard, core: Core): Promise<void>
}

export interface CatalogWithHandler extends Catalog {
  onDrive?: HandlerFunction
  onDriveSelf?: HandlerFunction
  onBreak?: HandlerFunction
  onDamage?: HandlerFunction
  onDraw?: HandlerFunction
  onOverclock?: HandlerFunction
  onOverclockSelf?: HandlerFunction
  [key: string]: unknown
}

export function effectFactory(catalog: CatalogWithHandler): void {
  switch (catalog.id) {
    // ハッパ
    case '1-0-040': {
      catalog.onDriveSelf = async (stack: Stack, card: ICard, core: Core) => {
        await stack.displayEffect(core, 'ドロー', 'カードを1枚引く')
        EffectTemplate.draw(stack, card, core)
      }
      break;
    }

    // タコ
    case '1-1-001':
    case 'SP-001': {
      catalog.onDriveSelf = async (stack: Stack, card: ICard, core: Core) => {
        await stack.displayEffect(core, '孤独との別れ', '赤属性ユニットを1枚引く')
        EffectTemplate.reinforcements(stack, card, core, { color: Color.RED })
      }
      break;
    }

    // カパエル
    case '1-1-007':
    case 'SP-005': {
      catalog.onDriveSelf = async (stack: Stack, card: ICard, core: Core) => {
        await stack.displayEffect(core, '援軍／黄', '黄属性ユニットを1枚引く')
        EffectTemplate.reinforcements(stack, card, core, { color: Color.YELLOW })
      }
      break;
    }

    // ブロナ
    case '1-1-018':
    case 'SP-016': {
      catalog.onDriveSelf = async (stack: Stack, card: ICard, core: Core) => {
        await stack.displayEffect(core, '援軍／緑', '緑属性ユニットを1枚引く')
        EffectTemplate.reinforcements(stack, card, core, { color: Color.GREEN })
      }
      break;
    }

    // ニャザード
    case '2-0-025': {
      catalog.onDriveSelf = async (stack: Stack, card: ICard, core: Core) => {
        await stack.displayEffect(core, '援軍／紫', '紫属性ユニットを1枚引く')
        EffectTemplate.reinforcements(stack, card, core, { color: Color.PURPLE })
      }
      break;
    }

    // カパじい
    case '2-0-121': {
      catalog.onOverclockSelf = async (stack: Stack, card: ICard, core: Core) => {
        await stack.displayEffect(core, 'この指とーまれい', '【珍獣】ユニットを2枚引く');
        [...Array(2)].forEach(() => EffectTemplate.reinforcements(stack, card, core, { species: '珍獣' }));
      }
    }
  }
}