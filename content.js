// specific URLs for the new foal bases
const TARGET_COATS = [
    // W8 icelandic
  "mxsi6xn7n5cjjmqo7einfzvzkoaiae332l6i7agcutzadgusqdmjgg5vwvat7bmfr4jdg22jrn6wq.png",
  "rtnjzvjfojfzreregldc24eks3d65dwaoyoah3vj5tdkbxufn47ocwaqsaq2u4vfglqbgrhkgm7dg.png",
  "3f4bmehwjnhx5egc55pjer7lckwx7bg6iwhsnng5i4b7yjx234ycuhfkb3nzpg6fk4eah3bpn6gqy.png",
  "46l2wiq7e5be3n246dexcfxhow37c3psgnq4dtj4tkxkpw5qvbugabw2wl34ja2olvof5qtvxyfoe.png",
  "2riz763rtzenddwk75gkambidzn5k5b5zrhkdwlbqtjulxsm4prifte4rm5a7asx2tqr4k3auvc64.png",
  "zusimh4e4jg2nmwwdh3xxaxbwryr6avw7fsofnaemrtjeq2mbjhqqetqv6oq3gqk2dgjund4ltmtc.png",
  "6hs4rs2oo5evhbojsperqud63q2wudwycl2jzs57h3icnd3hapn6yfg5mdtxq3uaygzevlwaopcse.png"

];

const TARGET_BREED = "Icelandic Horse";

function highlightHorses() {
  const blocks = document.querySelectorAll('.adopt_blocks');

  blocks.forEach(block => {
    const breedText = block.querySelector('.adopt_blocktitle p')?.innerText || "";
    
    const imgElement = block.querySelector('.miniature img');
    const imgSrc = imgElement ? imgElement.src : "";

    const breedMatches = breedText.includes(TARGET_BREED);
    const coatMatches = TARGET_COATS.some(coatId => imgSrc.includes(coatId));

    if (breedMatches && coatMatches) {
      block.style.backgroundColor = " #ff0000";

      const buyButton = block.querySelector('.buy_fhorse');

      if (buyButton) {
        buyButton.style.height = "55px";
        buyButton.style.fontWeight = "bold";
      }
    }
  });
}

highlightHorses();

// Optional: Horse Reality uses dynamic loading/tabs, 
// so run it every few seconds just in case
setInterval(highlightHorses, 2000);