import data from './src/submodule/suit/catalog/catalog.json';

data
  .filter(card => card.originality === 1)
  .forEach(card => {
    console.log(card.id, card.name, card.ability);
  });
