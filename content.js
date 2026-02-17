// specific URLs for the new foal bases
const TARGET_COATS = [
    // W8 icelandic
  "mxsi6xn7n5cjjmqo7einfzvzkoaiae332l6i7agcutzadgusqdmjgg5vwvat7bmfr4jdg22jrn6wq.png",
  
  // GENERIC COAT FOR DEBUG
  // "c6qajgteybe3xcib3fotvjmjnt77dlnl63avcir34ya4fjnz6hopamksa2fecufl74x5ufzyfrira.png",
  // "77q6gyxcbnf6njmfhjwfv5mox5y3clguvp2iensztpngntxz7qax242gqdefdidteievzmjgwrofy.png",
  // "un67ffxfpfcbzg57h4xd4x6h6f2ea3y3z65fqiliuxczuppysks53sgf3vt32zkuaf6s5tn2pficy.png",
  // "p6bpdv2ombez7ofqoidd5x5c467e4z2umpmuyx4rj7ivlja3p5bpmhzmnvtsj5p7vv4wgiu55wdns.png",
  // "usbgkqfvzvgfvhwfhvbu326ljrpcalsgn7q744kuxqb6fpzyjjo42czu3eah64j7uw44p6fxaptla.png"
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