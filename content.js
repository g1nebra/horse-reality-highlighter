// specific URLs for the new foal bases
const TARGET_COATS = [
    // W8 icelandic
  "mxsi6xn7n5cjjmqo7einfzvzkoaiae332l6i7agcutzadgusqdmjgg5vwvat7bmfr4jdg22jrn6wq.png",
  // GENERIC COAT FOR DEBUG
  "c6qajgteybe3xcib3fotvjmjnt77dlnl63avcir34ya4fjnz6hopamksa2fecufl74x5ufzyfrira.png"

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
      block.style.border = "5px solid #2ecc71";
      block.style.backgroundColor = "rgba(46, 204, 113, 0.1)";
      block.style.borderRadius = "10px";
    }
  });
}

highlightHorses();

// Optional: Horse Reality uses dynamic loading/tabs, 
// so run it every few seconds just in case
setInterval(highlightHorses, 2000);