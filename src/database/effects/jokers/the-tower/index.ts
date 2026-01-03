import { effects as EclipseSaber } from './eclipse-saber';
import { effects as TowerExecute } from './tower-execute';
import { effects as ChevalierDuke } from './chevalier-duke';

export const JokerName = {
  EclipseSaber: '秘技・エクリプスセイバー',
  TowerExecute: '奥義・タワーエグゼクト',
  ChevalierDuke: '極意・シュヴァリエドゥーク',
};

export const Tower = {
  [JokerName.EclipseSaber]: EclipseSaber,
  [JokerName.TowerExecute]: TowerExecute,
  [JokerName.ChevalierDuke]: ChevalierDuke,
};
