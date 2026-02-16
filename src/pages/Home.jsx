import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import Button from '../components/UI/Button';
import { motion } from 'framer-motion';

const Home = () => {
  const { dispatch } = useGame();
  const { createRoom, joinRoom } = useMultiplayer();
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = async () => {
    const code = await createRoom({
      gameState: 'SETUP',
      teams: {
        team1: { name: 'Équipe 1', score: 0, members: [], currentPlayerIndex: 0 },
        team2: { name: 'Équipe 2', score: 0, members: [], currentPlayerIndex: 0 }
      },
      currentRound: 1,
      currentTeam: 'team1',
      deck: [],
      timer: 30
    });
    dispatch({ type: 'GO_TO_SETUP' });
  };

  const handleJoin = async () => {
    const success = await joinRoom(joinCode.toUpperCase());
    if (success) {
      dispatch({ type: 'GO_TO_SETUP' });
    } else {
      alert("Code invalide ou salle pleine !");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] w-full bg-yellow-50 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Floating Shapes */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-20 left-10 text-9xl opacity-20"
      >
        ⏳
      </motion.div>
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-20 right-10 text-9xl opacity-20"
      >
        🎭
      </motion.div>

      <motion.h1 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-7xl font-black text-slate-800 mb-2 tracking-tighter z-10"
      >
        Time's Up!
      </motion.h1>
      <p className="text-xl font-bold text-slate-500 mb-12 z-10">Le Jeu des Célébrités</p>

      <div className="flex flex-col gap-4 w-full max-w-xs z-10">
        {!showJoin ? (
          <>
            <Button 
              variant="primary"
              onClick={() => dispatch({ type: 'GO_TO_SETUP' })}
              className="w-full py-5 text-xl"
            >
              Partie Locale
            </Button>

            <Button 
              variant="purple"
              onClick={handleCreate}
              className="w-full py-5 text-xl"
            >
              Créer une Salle
            </Button>

            <Button 
              variant="blue"
              onClick={() => setShowJoin(true)}
              className="w-full py-5 text-xl"
            >
              Rejoindre
            </Button>
          </>
        ) : (
          <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">Code de la Salle</h2>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              maxLength={6}
              className="w-full p-4 text-center text-3xl font-black tracking-widest border-2 border-slate-200 rounded-xl mb-4 uppercase focus:border-blue-500 outline-none"
            />
            <div className="flex gap-2">
              <Button 
                variant="secondary"
                onClick={() => setShowJoin(false)}
                className="flex-1 py-3"
              >
                Retour
              </Button>
              <Button 
                variant="success"
                onClick={handleJoin}
                className="flex-1 py-3"
              >
                Go !
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
