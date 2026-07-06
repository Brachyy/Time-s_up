import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/UI/Button';
import clsx from 'clsx';

const Results = () => {
  const { state } = useGame();
  const teams = state.teams; // Array of teams
  const [expandedPlayerIndex, setExpandedPlayerIndex] = useState(null);

  // Sort teams by score descending
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winnerTeam = sortedTeams[0];
  const isTie = sortedTeams.length > 1 && sortedTeams[0].score === sortedTeams[1].score;
  const winnerName = isTie ? "Égalité !" : winnerTeam.name;

  // Calculate Player Stats
  const allPlayers = [];
  teams.forEach((team) => {
    team.members.forEach((member, mIndex) => {
      const stats = team.playerStats && team.playerStats[mIndex] ? team.playerStats[mIndex] : { guessed: 0, words: [] };
      allPlayers.push({
        name: member,
        teamName: team.name,
        score: stats.guessed || 0,
        words: stats.words || []
      });
    });
  });
  const topPlayers = allPlayers.sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] w-full bg-yellow-50 p-4 overflow-hidden relative">
      {/* Confetti Background (Simulated with dots) */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -100, x: Math.random() * window.innerWidth }}
          animate={{ y: window.innerHeight + 100, rotate: 360 }}
          transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, ease: "linear" }}
          className={`absolute w-4 h-4 rounded-full ${['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400'][Math.floor(Math.random() * 4)]}`}
        />
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] border-4 border-slate-100 max-w-5xl w-full text-center z-10 flex flex-col max-h-[95vh]"
      >
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tighter shrink-0">
          Partie Terminée !
        </h1>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-8 mb-4 scrollbar-thin scrollbar-thumb-slate-200">
          
          {/* TEAMS SECTION */}
          <div>
            <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">Classement Équipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTeams.map((team, index) => (
                  <div 
                    key={index} 
                    className={clsx(
                      "p-4 rounded-2xl border-2 flex flex-col items-center justify-center relative",
                      index === 0 && !isTie ? "bg-yellow-50 border-yellow-200 order-first md:col-span-2 lg:col-span-1 shadow-sm" : "bg-slate-50 border-slate-100"
                    )}
                  >
                    {index === 0 && !isTie && (
                      <span className="absolute -top-3 bg-yellow-400 text-white font-black px-3 py-1 rounded-full text-xs shadow-sm uppercase tracking-wide">
                        Vainqueurs 🏆
                      </span>
                    )}
                    <h3 className={clsx("text-lg font-bold mb-1 truncate max-w-full", index === 0 && !isTie ? "text-yellow-700" : "text-slate-500")}>
                      {team.name}
                    </h3>
                    <p className="text-4xl font-black text-slate-800">{team.score} <span className="text-sm text-slate-400 font-bold">pts</span></p>
                  </div>
              ))}
            </div>
          </div>

          {/* PLAYERS SECTION */}
          <div>
            <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-2">Classement Joueurs</h2>
            <p className="text-xs text-slate-400 font-bold mb-4 italic">(Cliquez sur un joueur pour voir ses mots devinés)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {topPlayers.map((player, i) => {
                 const isExpanded = expandedPlayerIndex === i;
                 const wordsByRound = { 1: [], 2: [], 3: [] };
                 if (player.words) {
                   player.words.forEach(w => {
                     if (wordsByRound[w.round]) {
                       wordsByRound[w.round].push(w.word);
                     }
                   });
                 }

                 return (
                   <div key={i} className="flex flex-col gap-2">
                     <div 
                       onClick={() => setExpandedPlayerIndex(isExpanded ? null : i)}
                       className={clsx(
                         "flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm hover:border-blue-200 transition-all cursor-pointer select-none active:scale-98",
                         isExpanded ? "border-blue-400 ring-2 ring-blue-50" : "border-slate-100"
                       )}
                     >
                        <span className={clsx(
                          "w-8 h-8 flex items-center justify-center rounded-full font-black text-white shrink-0",
                          i === 0 ? "bg-yellow-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-400" : "bg-slate-100 text-slate-400"
                        )}>
                          {i + 1}
                        </span>
                        <div className="text-left min-w-0 flex-1">
                          <p className="font-bold text-slate-700 truncate">{player.name}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase truncate">{player.teamName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-blue-500">{player.score} {player.score > 1 ? 'mots' : 'mot'}</span>
                          <span className="text-slate-400 font-bold text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                     </div>

                     <AnimatePresence>
                       {isExpanded && (
                         <motion.div
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: 'auto', opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           className="overflow-hidden bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-left space-y-3"
                         >
                           <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                             Détail des mots devinés :
                           </h4>
                           {[1, 2, 3].map(roundNum => {
                             const roundWords = wordsByRound[roundNum];
                             if (roundWords.length === 0) return null;
                             return (
                               <div key={roundNum} className="flex flex-col gap-1">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase">
                                   Manche {roundNum} :
                                 </span>
                                 <div className="flex flex-wrap gap-1.5">
                                   {roundWords.map((word, wIdx) => (
                                     <span 
                                       key={wIdx} 
                                       className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-xs font-medium text-slate-700 shadow-sm"
                                     >
                                       {word}
                                     </span>
                                   ))}
                                 </div>
                               </div>
                             );
                           })}
                           {player.score === 0 && (
                             <p className="text-xs text-slate-400 italic">Aucun mot deviné pendant la partie 😢</p>
                           )}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="shrink-0 pt-4 pb-4 border-t-2 border-slate-50"
        >
          <Button 
            variant="primary"
            onClick={() => window.location.reload()} 
            className="w-full py-4 text-xl"
          >
            Rejouer
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Results;
