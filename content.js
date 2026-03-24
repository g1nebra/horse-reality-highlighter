// Configuration State
let settings = { breed: "", coats: [] };

// settings are loaded from localStorage
try {
  const stored = localStorage.getItem("HR_HIGHLIGHTER_SETTINGS");
  if (stored) settings = JSON.parse(stored);
} catch (e) {
  console.error("Error loading settings:", e);
}

// UI for configuration
function createConfigWindow() {
  if (document.getElementById('hr-config-ui')) return;

  const ui = document.createElement('div');
  ui.id = 'hr-config-ui';
  ui.style.cssText = "position: fixed; top: 100px; right: 20px; background: white; border: 1px solid #ccc; padding: 15px; z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: sans-serif; width: 300px;";
  
  const breeds = [
    "Akhal-Teke", "Arabian", "Brabant", "Brumby", "Camargue", "Cleveland Bay",
    "Exmoor Pony", "Finnhorse", "Fjord", "Friesian", "Haflinger", "Icelandic",
    "Irish Cob", "Kathiawari", "Kladruber", "Knabstrupper", "Lipizzaner", "Lusitano",
    "Mongolian", "Mustang", "Namib Desert", "Noriker", "Norman Cob", "Oldenburg",
    "Pantaneiro", "Pura Raza Española", "Quarter", "Shetland Pony", "Shire", "Suffolk Punch",
    "Thoroughbred", "Trakehner", "Welsh Pony", "Appaloosa"
  ];
  const breedOptions = breeds.map(b => `<option value="${b}" ${settings.breed === b ? 'selected' : ''}>${b}</option>`).join('');

  ui.innerHTML = `
    <h4 style="margin-top:0;">Highlighter Settings</h4>
    <label style="display:block; font-size: 12px; margin-bottom: 5px;">Target Breed:</label>
    <select id="hr-breed-in" style="width: 100%; margin-bottom: 10px;">
      <option value="" ${settings.breed === "" ? "selected" : ""}>All Breeds</option>
      ${breedOptions}
    </select>
    
    <label style="display:block; font-size: 12px; margin-bottom: 5px;">Coat IDs (one per line):</label>
    <textarea id="hr-coats-in" rows="6" style="width: 100%; margin-bottom: 10px;">${settings.coats.join('\n')}</textarea>
    
    <div style="text-align: right;">
      <button id="hr-save-btn" style="cursor: pointer;">Save</button>
      <button id="hr-close-btn" style="cursor: pointer; margin-left: 5px;">Close</button>
    </div>
  `;

  document.body.appendChild(ui);

  document.getElementById('hr-save-btn').onclick = () => {
    const breedVal = document.getElementById('hr-breed-in').value.trim();
    const coatsVal = document.getElementById('hr-coats-in').value.split('\n').map(s => s.trim()).filter(s => s);
    settings = { breed: breedVal, coats: coatsVal };
    localStorage.setItem("HR_HIGHLIGHTER_SETTINGS", JSON.stringify(settings));
    ui.remove();
    highlightHorses();
  };

  document.getElementById('hr-close-btn').onclick = () => ui.remove();
}


const cfgBtn = document.createElement('button');
cfgBtn.innerText = "Config Highlighter";
cfgBtn.style.cssText = "position: fixed; bottom: 10px; left: 10px; z-index: 9999;";
cfgBtn.onclick = createConfigWindow;
document.body.appendChild(cfgBtn);

function highlightHorses() {
  const blocks = document.querySelectorAll('.adopt_blocks');

  blocks.forEach(block => {
    const breedText = block.querySelector('.adopt_blocktitle p')?.innerText || "";
    
    const imgElement = block.querySelector('.miniature img');
    const imgSrc = imgElement ? imgElement.src : "";

    const breedMatches = settings.breed ? breedText.includes(settings.breed) : true;
    const coatMatches = settings.coats.some(coatId => imgSrc.includes(coatId));

    if (breedMatches && coatMatches) {

      block.style.boxShadow = "inset 0 0 0 4px #ffca28";
      block.style.backgroundColor = "rgba(255, 202, 40, 0.2)"; // Subtle gold background

      const buyButton = block.querySelector('.buy_fhorse');

      if (buyButton) {
        buyButton.style.backgroundColor = "#ffca28";
        buyButton.style.borderColor = "#c79a00";
        buyButton.style.color = "#fff";
        buyButton.style.fontWeight = "bold";
      }
    } else {
      block.style.boxShadow = "";
      block.style.backgroundColor = "";
      const buyButton = block.querySelector('.buy_fhorse');
      if (buyButton) {
        buyButton.style.backgroundColor = "";
        buyButton.style.borderColor = "";
        buyButton.style.color = "";
        buyButton.style.fontWeight = "";
      }
    }
  });
}

highlightHorses();

// Optional: Reality uses dynamic loading/tabs, 
// so run it every few seconds just in case
setInterval(highlightHorses, 2000);