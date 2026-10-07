// Configurazione dell'ascensore: modifica qui piani e tempi.
const CONFIG = {
  // Piani dal più basso al più alto. "label" è ciò che appare sul tasto e sul display.
  floors: [
    { label: "T", name: "Piano terra" },
    { label: "1", name: "Primo piano" },
    { label: "2", name: "Secondo piano" },
    { label: "3", name: "Terzo piano" },
    { label: "4", name: "Quarto piano" },
    { label: "5", name: "Quinto piano" },
    { label: "6", name: "Sesto piano" },
    { label: "7", name: "Settimo piano" },
  ],

  // Indice (nell'array sopra) del piano di partenza. 0 = "T".
  startFloorIndex: 0,

  // Secondi impiegati per attraversare un piano.
  secondsPerFloor: 1.5,

  // Suono "ding" all'arrivo.
  chime: true,
};
