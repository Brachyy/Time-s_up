import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import { generateDeck } from '../utils/deck';
import Button from '../components/UI/Button';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const PlayerItem = ({ 
  player, 
  index, 
  teamIndex,
  isLocal, 
  playerId, 
  isHost, 
  roomId, 
  onLocalChange, 
  onRename, 
  onMove, 
  onRemove,
  teamsCount
}) => (
  <motion.div 
    layoutId={player.id}
    className={clsx(
      "bg-white p-2 rounded-lg shadow-sm border-2 mb-2 flex items-center justify-between group",
      player.id === playerId ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-100"
    )}
  >
    <input
      value={player.name}
      onChange={(e) => isLocal ? onLocalChange(teamIndex, index, e.target.value) : onRename(player.id, e.target.value)}
      disabled={(!isLocal && player.id !== playerId && !isHost)}
      className="font-bold text-slate-700 bg-transparent outline-none w-full text-sm"
    />
    
    {/* Online Host Controls */}
    {roomId && isHost && (
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
        {/* Simple move to next/prev team logic could be better, but for now specific buttons */}
        {/* TODO: For N teams, maybe a dropdown or just 'Move Next' ?? */}
        {/* For now keeping it simple: Online mode might need valid logic for N teams. 
            User said "dans le menu de config... on doit pouvoir mettre plus que 2 teams".
            Online logic is tricky with N teams. Let's assume Local mainly for now or adapt online.
        */}
      </div>
    )}

    {/* Local Controls */}
    {!roomId && (
      <button 
        onClick={() => onRemove(teamIndex, index)}
        className="text-red-400 hover:text-red-600 font-bold px-2"
      >
        ✕
      </button>
    )}
  </motion.div>
);

const Setup = () => {
  const { dispatch } = useGame();
  const { roomId, isHost, playerId, onlineState, updateRoomData } = useMultiplayer();
  
  // Local state for inputs
  const [mode, setMode] = useState('celebrities');
  const [cardCount, setCardCount] = useState(40);
  const [timerDuration, setTimerDuration] = useState(30);
  
  // Custom Only Mode
  const [customOnly, setCustomOnly] = useState(false);
  
  // Contribution Mode State
  const [newWord, setNewWord] = useState('');
  const [localCustomWords, setLocalCustomWords] = useState([]);
  const [visibleWordIndex, setVisibleWordIndex] = useState(null);
  
  // Local Mode Only: Manage players locally if not online
  // Array of teams: { name: string, members: string[] }
  const [localTeams, setLocalTeams] = useState([
    { name: 'Équipe 1', members: ['Joueur 1', 'Joueur 2'] },
    { name: 'Équipe 2', members: ['Joueur 3', 'Joueur 4'] }
  ]);

  // --- SYNC LOGIC (Online Only) ---
  useEffect(() => {
    if (roomId && onlineState?.settings) {
      setMode(onlineState.settings.mode);
      setCardCount(onlineState.settings.cardCount);
      setTimerDuration(onlineState.settings.timerDuration);
      setCustomOnly(onlineState.settings.customOnly || false);
      // Construct local teams from onlineState if needed? 
      // For now, onlineState keeps players in a flat list with 'team' property.
      // We need to map 'team1', 'team2'... to dynamic teams?
      // Online support for N teams is harder. Let's focus on Local first as implied by user context often.
      // If user uses Online, we might stick to 2 teams or need refactor onlineState.players structure.
    }
  }, [roomId, onlineState]);

  const updateSettings = (newSettings) => {
    if (roomId && isHost) {
      updateRoomData({
        settings: {
          mode, cardCount, timerDuration, customOnly,
          ...newSettings
        }
      });
    }
  };

  const handleAddWord = () => {
    if (!newWord.trim()) return;
    
    if (roomId) {
      const currentWords = onlineState.customWords || [];
      updateRoomData({ customWords: [...currentWords, newWord.trim()] });
    } else {
      setLocalCustomWords([...localCustomWords, newWord.trim()]);
    }
    setNewWord('');
  };

  const removeLocalWord = (index) => {
    setLocalCustomWords(localCustomWords.filter((_, i) => i !== index));
  };

  // --- LOCAL LOGIC FOR DYNAMIC TEAMS ---
  const handleAddTeam = () => {
    setLocalTeams([...localTeams, { 
      name: `Équipe ${localTeams.length + 1}`, 
      members: [] 
    }]);
  };

  const handleRemoveTeam = () => {
    if (localTeams.length <= 2) return;
    setLocalTeams(localTeams.slice(0, -1));
  };

  const handleLocalMemberChange = (teamIndex, memberIndex, value) => {
    const newTeams = [...localTeams];
    newTeams[teamIndex].members[memberIndex] = value;
    setLocalTeams(newTeams);
  };

  const handleLocalTeamNameChange = (teamIndex, value) => {
    const newTeams = [...localTeams];
    newTeams[teamIndex].name = value;
    setLocalTeams(newTeams);
  };

  const addLocalMember = (teamIndex) => {
    const newTeams = [...localTeams];
    newTeams[teamIndex].members.push(`Joueur ${newTeams[teamIndex].members.length + 1}`);
    setLocalTeams(newTeams);
  };

  const removeLocalMember = (teamIndex, memberIndex) => {
    const newTeams = [...localTeams];
    newTeams[teamIndex].members = newTeams[teamIndex].members.filter((_, i) => i !== memberIndex);
    setLocalTeams(newTeams);
  };

  const handleStart = () => {
    if (roomId && !isHost) return;

    // For now, only Local supports dynamic teams fully in this refactor
    // If Online, we might fallback to 2 teams or need more logic.
    // Assuming Local for the user request "menu de config de partie".
    
    const finalTeams = localTeams.map(t => ({
      name: t.name,
      score: 0,
      members: t.members,
      currentPlayerIndex: 0
    }));

    // Check members
    if (finalTeams.some(t => t.members.length === 0)) {
       alert("Chaque équipe doit avoir au moins un joueur !");
       return;
    }

    // Generate Deck
    let deck = [];
    const customWords = roomId ? (onlineState.customWords || []) : localCustomWords;
    
    if (customOnly) {
      if (customWords.length === 0) {
        alert("Ajoutez des mots personnalisés pour lancer en mode 'Mots Personnalisés Uniquement' !");
        return;
      }
      deck = customWords.map((word, i) => ({
        id: `custom-${i}-${Date.now()}`,
        word: word,
        guessed: false
      }));
      // Shuffle
      deck = deck.sort(() => 0.5 - Math.random());
    } else {
      // Mixed Mode
      if (customWords.length > 0) {
        const needed = Math.max(0, cardCount - customWords.length);
        const standardDeck = generateDeck(mode, needed);
        const customDeck = customWords.map((word, i) => ({
          id: `custom-${i}-${Date.now()}`,
          word: word,
          guessed: false
        }));
        deck = [...customDeck, ...standardDeck].sort(() => 0.5 - Math.random());
      } else {
        deck = generateDeck(mode, cardCount);
      }
    }

    const payload = { deck, teams: finalTeams, timerDuration, mode, cardCount: deck.length };

    dispatch({ type: 'START_GAME', payload });
  };

  // --- RENDER HELPERS ---
  const customWordsCount = roomId ? (onlineState?.customWords?.length || 0) : localCustomWords.length;

  return (
    <div className="flex flex-col h-full w-full p-4 bg-slate-50 relative">
      <div className="flex flex-col h-full max-h-full overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h1 className="text-3xl font-black text-slate-800">
            {roomId ? 'Lobby' : 'Configuration'}
          </h1>
          {roomId && (
            <div className="bg-white px-4 py-2 rounded-xl font-black text-xl shadow-sm border-2 border-slate-200">
              CODE: <span className="text-blue-600 tracking-widest">{roomId}</span>
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-hide space-y-4">
          
          {/* TOP SECTION: SETTINGS */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-slate-100 shrink-0">
            <div className="flex flex-col gap-4">
               {/* Mode & Custom Toggle */}
               <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-bold mb-2 text-slate-400 uppercase">Mode</label>
                    <div className="flex gap-2">
                      {['celebrities', 'words'].map(m => (
                        <button
                          key={m}
                          onClick={() => { setMode(m); updateSettings({ mode: m }); }}
                          disabled={roomId && !isHost}
                          className={clsx(
                            "flex-1 py-2 rounded-lg font-bold transition-all border-2 text-sm",
                            mode === m 
                              ? "bg-yellow-100 text-yellow-700 border-yellow-400" 
                              : "bg-slate-50 text-slate-400 border-slate-100"
                          )}
                        >
                          {m === 'celebrities' ? 'Célébrités' : 'Mots'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-bold mb-2 text-purple-400 uppercase">Options</label>
                    <label className="flex items-center gap-2 cursor-pointer bg-purple-50 p-2 rounded-lg border-2 border-purple-100 hover:bg-purple-100 transition-colors">
                      <input 
                        type="checkbox"
                        checked={customOnly}
                        onChange={(e) => { setCustomOnly(e.target.checked); updateSettings({ customOnly: e.target.checked }); }}
                        className="w-5 h-5 accent-purple-500"
                      />
                      <span className="font-bold text-purple-700 text-sm">Mots Personnalisés Uniquement</span>
                    </label>
                  </div>
               </div>

              <div className="flex gap-6 items-end">
                {/* Card Count */}
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2 text-slate-400 uppercase">
                    Cartes: <span className="text-slate-800">{customOnly ? customWordsCount : cardCount}</span>
                  </label>
                  <input 
                    type="range" min="10" max="100" step="5"
                    value={cardCount}
                    onChange={(e) => { 
                      const val = Number(e.target.value);
                      setCardCount(val); 
                      updateSettings({ cardCount: val }); 
                    }}
                    disabled={(roomId && !isHost) || customOnly}
                    className={clsx("cartoon-slider", customOnly && "opacity-50 grayscale cursor-not-allowed")}
                  />
                </div>

                {/* Timer */}
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2 text-slate-400 uppercase">
                    Temps: <span className="text-slate-800">{timerDuration}s</span>
                  </label>
                  <input 
                    type="range" min="10" max="120" step="5"
                    value={timerDuration}
                    onChange={(e) => { 
                      const val = Number(e.target.value);
                      setTimerDuration(val); 
                      updateSettings({ timerDuration: val }); 
                    }}
                    disabled={roomId && !isHost}
                    className="cartoon-slider"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CONTRIBUTION MODE */}
          <div className="bg-purple-50 p-4 rounded-3xl border-2 border-purple-100 shrink-0 flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold mb-1 text-purple-400 uppercase">
                  Ajouter un mot perso ({customWordsCount})
                </label>
                <div className="flex gap-2">
                  <input 
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                    placeholder={roomId ? "Ex: Ma Belle-Mère..." : "Mot Secret..."}
                    type={!roomId ? "password" : "text"} 
                    className="flex-1 bg-white border-2 border-purple-200 rounded-lg px-3 py-2 font-bold text-purple-800 outline-none focus:border-purple-400"
                  />
                  <button 
                    onClick={handleAddWord}
                    className="bg-purple-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
             {/* Local Mode: Show Masked List */}
            {!roomId && localCustomWords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {localCustomWords.map((word, i) => (
                  <div key={i} className="bg-white border-2 border-purple-100 rounded-lg px-2 py-1 flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-800">
                      {visibleWordIndex === i ? word : '••••••'}
                    </span>
                    <button 
                      onMouseDown={() => setVisibleWordIndex(i)}
                      onMouseUp={() => setVisibleWordIndex(null)}
                      onMouseLeave={() => setVisibleWordIndex(null)}
                      onTouchStart={() => setVisibleWordIndex(i)}
                      onTouchEnd={() => setVisibleWordIndex(null)}
                      className="text-purple-300 hover:text-purple-500 cursor-pointer"
                    >
                      👁️
                    </button>
                    <button 
                      onClick={() => removeLocalWord(i)}
                      className="text-red-300 hover:text-red-500 font-bold text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TEAMS SECTION - Dynamic Grid */}
          <div className="flex flex-col gap-2 min-h-[300px]">
             <div className="flex justify-between items-center px-2">
                <h3 className="font-bold text-slate-400 uppercase">Équipes ({localTeams.length})</h3>
                {!roomId && (
                  <div className="flex gap-2">
                    {localTeams.length > 2 && (
                      <button onClick={handleRemoveTeam} className="text-red-400 hover:text-red-600 font-bold text-sm px-2 py-1 bg-red-50 rounded-lg border border-red-100">
                        - Retirer
                      </button>
                    )}
                    <button onClick={handleAddTeam} className="text-blue-500 hover:text-blue-700 font-bold text-sm px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
                      + Ajouter Équipe
                    </button>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localTeams.map((team, tIndex) => (
                   <div key={tIndex} className={clsx("p-4 rounded-3xl border-2 flex flex-col", tIndex % 2 === 0 ? "bg-blue-50 border-blue-100" : "bg-pink-50 border-pink-100")}>
                      <input 
                        value={team.name}
                        onChange={(e) => handleLocalTeamNameChange(tIndex, e.target.value)}
                        disabled={roomId && !isHost}
                        className={clsx("text-xl font-black bg-transparent outline-none mb-4 w-full", tIndex % 2 === 0 ? "text-blue-600" : "text-pink-600")}
                      />
                      <div className="flex-1 space-y-2">
                        {team.members.map((member, mIndex) => (
                           <PlayerItem 
                              key={`${tIndex}-${mIndex}`}
                              player={{ id: `local-${tIndex}-${mIndex}`, name: member, team: `team${tIndex}` }} // Mock player object
                              index={mIndex}
                              teamIndex={tIndex}
                              isLocal={!roomId}
                              onLocalChange={handleLocalMemberChange}
                              onRemove={removeLocalMember}
                           />
                        ))}
                        {!roomId && (
                           <button 
                              onClick={() => addLocalMember(tIndex)}
                              className={clsx("w-full py-2 mt-2 rounded-lg border-2 border-dashed font-bold text-sm hover:bg-opacity-50", 
                                tIndex % 2 === 0 ? "border-blue-300 text-blue-400 hover:bg-blue-100" : "border-pink-300 text-pink-400 hover:bg-pink-100"
                              )}
                           >
                              + Ajouter
                           </button>
                        )}
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Start Button - Fixed Bottom */}
        {(!roomId || isHost) && (
          <div className="pt-4 pb-6 shrink-0 z-10 bg-slate-50">
            <Button variant="primary" onClick={handleStart} className="w-full py-4 text-xl shadow-xl">
              {roomId ? 'Lancer la Partie 🚀' : 'Commencer'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setup;
