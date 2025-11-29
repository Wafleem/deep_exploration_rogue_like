import React, { useState } from 'react';
import { Droplet, Heart, ChevronRight, XCircle, RefreshCcw } from 'lucide-react';

// Game Constants
const SECTOR_COST = 5;
const INITIAL_RESOURCES = { oxygen: 80, shield: 50 };
const INITIAL_LOG = [{ message: "DEEP SEA EXPLORER SYSTEMS ONLINE! READY TO LAUNCH.", type: 'START' }];

const ENEMY_DRONE = { 
  name: 'Automated Drone', 
  damage: 10, 
  o2_loss: 3, 
  description: 'An old, automated drone patrol. Must be disabled.' 
};

function App() {
  const [resources, setResources] = useState(INITIAL_RESOURCES); 
  const [sector, setSector] = useState(1);
  const [log, setLog] = useState(INITIAL_LOG);

  const resetGame = () => {
    setResources(INITIAL_RESOURCES);
    setSector(1);
    setLog(INITIAL_LOG);
  };

  const handleEncounter = () => {
    const enemy = ENEMY_DRONE;
    let combatLog = [];
    let damageTaken = enemy.damage;
    let oxygenLost = enemy.o2_loss;

    const shieldRemaining = resources.shield - damageTaken;
    if (shieldRemaining >= 0) {
      setResources(prev => ({ ...prev, shield: shieldRemaining }));
      combatLog.push({ message: `ENCOUNTER: Detected hostile ${enemy.name}! The drone's attack was absorbed by your Shield. (-${damageTaken} Shield)`, type: 'COMBAT' });
      damageTaken = 0;
    } else {
      damageTaken = -shieldRemaining;
      setResources(prev => ({ ...prev, shield: 0 }));
      combatLog.push({ message: `ENCOUNTER: Hostile ${enemy.name} detected! Shield breached! (-${resources.shield} Shield)`, type: 'COMBAT' });
    }

    const newOxygen = resources.oxygen - damageTaken - oxygenLost;

    setResources(prev => ({
        ...prev,
        oxygen: newOxygen,
    }));

    if (damageTaken > 0) {
        combatLog.push({ message: `CRITICAL HIT! Hull damage taken. (-${damageTaken} Oxygen)`, type: 'COMBAT' });
    }
    combatLog.push({ message: `Drone disabled. Combat concluded. Additional O2 consumption during fight. (-${oxygenLost} Oxygen)`, type: 'COMBAT' });
    
    return combatLog;
  };

  const handleO2Discovery = () => {
    const o2Gain = Math.floor(Math.random() * 8) + 5;
    
    setResources(prev => ({ 
        ...prev, 
        oxygen: Math.min(100, prev.oxygen + o2Gain) 
    }));

    return [{ message: `RESOURCE: Detected and salvaged a damaged Oxygen Tank. (+${o2Gain} Oxygen)`, type: 'RESOURCE' }];
  };
  
  const exploreSector = () => {
    // Game Over Check 1: Already at 0 or less O2 
    if (resources.oxygen <= 0) {
      setLog(prevLog => [{ message: "OXYGEN DEPLETED. SUBMERSIBLE POWERING DOWN. GAME OVER.", type: 'DEATH' }, ...prevLog]);
      return; 
    }

    // NEW GAME OVER CHECK: Insufficient resources to advance (less than SECTOR_COST)
    if (resources.oxygen < SECTOR_COST) {
        // Force oxygen to 0 to trigger the UI's isGameOver message
        setResources(prev => ({ ...prev, oxygen: 0 }));
        setLog(prevLog => [{ 
            message: `FAILURE: Insufficient Oxygen (${resources.oxygen}) remaining to power propulsion systems for Sector Advancement (${SECTOR_COST}). Stranded. GAME OVER.`, 
            type: 'DEATH' 
        }, ...prevLog]);
        return;
    }

    // Successful Exploration
    const newOxygen = resources.oxygen - SECTOR_COST;
    setResources(prevResources => ({
      ...prevResources, 
      oxygen: newOxygen,
    }));
    
    const nextSector = sector + 1;
    setSector(nextSector);

    let newLog = [{ message: `[Sector ${nextSector}] Exploring... (-${SECTOR_COST} Oxygen)`, type: 'MOVE' }];

    // Randomly trigger an event
    const eventRoll = Math.random();
    let eventLogs = [];

    if (eventRoll < 0.25) { // 25% chance of Encounter
      eventLogs = handleEncounter();
    } else if (eventRoll < 0.50) { // 25% chance of O2 Discovery
      eventLogs = handleO2Discovery();
    } else { // 50% chance of Clear Passage
      eventLogs = [{ message: "AREA CLEAR: Safe passage through the sector. No events detected.", type: 'EVENT' }];
    }

    setLog(prevLog => [...eventLogs, ...newLog, ...prevLog].slice(0, 50));
  };

  const isGameOver = resources.oxygen <= 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-lime-300 p-4 font-mono">
      <div className="max-w-xl w-full">
        <h1 className="text-4xl font-bold text-lime-400 mb-6 text-center tracking-wider">
          DEEP EXPLORATION
        </h1>

        <div className="bg-slate-900 p-6 rounded-xl shadow-2xl mb-6 border border-slate-700">
          <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
            <h2 className="text-2xl text-white font-semibold">
              Current Sector: <span className="text-lime-300">{sector}</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Oxygen Card */}
            <div className="p-3 bg-slate-800 rounded-lg flex items-center shadow-inner">
              <Droplet className="w-6 h-6 text-cyan-400 mr-3" />
              <div>
                <p className="text-sm font-medium uppercase text-slate-400">Oxygen</p>
                <p className={`text-xl font-bold ${resources.oxygen <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{resources.oxygen}</p>
              </div>
            </div>

            {/* Shield Card */}
            <div className="p-3 bg-slate-800 rounded-lg flex items-center shadow-inner">
              <Heart className="w-6 h-6 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium uppercase text-slate-400">Shield</p>
                <p className="text-xl font-bold text-white">{resources.shield}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Game Over Message */}
        {isGameOver && (
          <div className="text-center bg-red-900/50 border-4 border-red-500 p-6 rounded-xl mb-8">
              <XCircle className="w-12 h-12 mx-auto text-red-400 mb-2 animate-bounce" />
              <h3 className="text-3xl font-extrabold text-red-400">MISSION ABORTED</h3>
              <p className="text-gray-300 mt-2">Oxygen is depleted. Your journey ends here.</p>
          </div>
        )}
        
        <div className="space-y-4">
            {/* Explore Button */}
            <button
            onClick={exploreSector}
            // Disable if game over OR if oxygen is less than the cost to move
            disabled={isGameOver || resources.oxygen < SECTOR_COST} 
            className={`w-full flex items-center justify-center px-6 py-3 rounded-xl text-lg font-bold transition-all duration-300 transform shadow-xl 
            ${isGameOver || resources.oxygen < SECTOR_COST
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-lime-600 hover:bg-lime-500 active:scale-[0.98] text-gray-900'
            }`}
            >
            <ChevronRight className="w-5 h-5 mr-2" />
            {isGameOver ? 'VESSEL DISABLED' : `Explore Next Sector (-${SECTOR_COST} Oxygen)`}
            </button>
            
            {/* Restart Button (only show if game over or already moved past sector 1) */}
            {(isGameOver || sector > 1) && (
                <button
                    onClick={resetGame}
                    className="w-full flex items-center justify-center px-6 py-3 rounded-xl text-lg font-bold transition-all duration-300 transform shadow-xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white"
                >
                    <RefreshCcw className="w-5 h-5 mr-2" />
                    Restart The Mission
                </button>
            )}
        </div>
        
        {/* Navigation Log */}
        <div className="bg-slate-900 p-6 rounded-xl shadow-2xl border border-slate-700 mt-6">
          <h2 className="text-xl text-white font-semibold mb-4 border-b border-slate-700 pb-2">
            Navigation Log
          </h2>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-2 text-sm text-lime-300">
            {log.map((entry, index) => (
              <p 
                key={index} 
                className={`log-message 
                  ${entry.type === 'DEATH' ? 'border-red-600 text-red-400' : 
                    entry.type === 'COMBAT' ? 'border-red-400 text-red-300' :
                    entry.type === 'RESOURCE' ? 'border-cyan-400 text-cyan-300' :
                    'border-lime-500'
                  }`}
              >
                {entry.message}
              </p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;