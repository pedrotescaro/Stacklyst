// habitats-front.png — short blades drawn in front of a creature's feet (72×48 each).
for (let variant = 0; variant < 3; variant++) {
  cell(variant * HABITAT_W, 0, HABITAT_W, 48);
  habitatFront(variant);
  outline();
}
