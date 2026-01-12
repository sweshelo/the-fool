import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
    //■ドッカーンッ！
    //このユニットがオーバークロックした時、対戦相手の全てのユニットに3000ダメージを与える。

    onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
        const owner = stack.processing.owner;
        const enemyUnits = owner.opponent.field;

        if (enemyUnits.length === 0) {
            return;
        }
        await System.show(stack, 'ドッカーンッ！', '敵全体に2000ダメージ');

        enemyUnits.forEach((unit) => {
            Effect.damage(stack, stack.processing, unit, 2000);
        });
    }

};