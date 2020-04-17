/**
 * aaa
 */
const generator = () => {
  for (let i = 0; i < 50000; i++) {
    console.log(`${10000000 + i};${(i % 3) + 1};FAMILIA ${i};${10000000000 + i};01/01/1985;1;MÃE ${i}`);
  }
};

generator();
