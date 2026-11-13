// habitats-back.png — 3 tall-grass clumps (72×48 each) behind hiding creatures.
for (let variant = 0; variant < 3; variant++) {
  cell(variant * HABITAT_W, 0, HABITAT_W, 48);
  habitatBack(variant);
  outline();
}
