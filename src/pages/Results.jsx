import React from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import Button from '../components/UI/Button';
import clsx from 'clsx';

const Results = () => {
  const { state } = useGame();
  const teams = state.teams; // Array of teams

  // Sort teams by score descending
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winnerTeam = sortedTeams[0];
  const isTie = sortedTeams.length > 1 && sortedTeams[0].score === sortedTeams[1].score;
  const winnerName = isTie ? "Égalité !" : winnerTeam.name;

  // Calculate Player Stats
  const allPlayers = [];
  teams.forEach((team) => {
    team.members.forEach((member, mIndex) => {
      const stats = team.playerStats && team.playerStats[mIndex] ? team.playerStats[mIndex].guessed : 0;
      allPlayers.push({
        name: member,
        teamName: team.name,
        score: stats
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
            <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">Classement Joueurs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
               {topPlayers.map((player, i) => (
                 <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-100 transition-colors">
                    <span className={clsx(
                      "w-8 h-8 flex items-center justify-center rounded-full font-black text-white shrink-0",
                      i === 0 ? "bg-yellow-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-400" : "bg-slate-100 text-slate-400"
                    )}>
                      {i + 1}
                    </span>
                    <div className="text-left min-w-0">
                      <p className="font-bold text-slate-700 truncate">{player.name}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase truncate">{player.teamName}</p>
                    </div>
                    <div className="ml-auto font-black text-blue-500">{player.score}</div>
                 </div>
               ))}
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
