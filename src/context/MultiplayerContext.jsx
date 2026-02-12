import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { generateDeck } from '../utils/deck';

const MultiplayerContext = createContext();

export const MultiplayerProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [onlineState, setOnlineState] = useState(null);

  useEffect(() => {
    // Generate a random player ID if not exists
    let pid = localStorage.getItem('timesup_pid');
    if (!pid) {
      pid = Math.random().toString(36).substring(7);
      localStorage.setItem('timesup_pid', pid);
    }
    setPlayerId(pid);
  }, []);

  const createRoom = async (initialGameState) => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const roomRef = doc(db, 'rooms', code);
      
      const hostPlayer = {
        id: playerId,
        name: 'Hôte',
        team: 'unassigned',
        isHost: true
      };

      // Initial room state
      const roomData = {
        hostId: playerId,
        players: [hostPlayer],
        settings: {
          mode: 'celebrities',
          cardCount: 40,
          timerDuration: 30,
          team1Name: 'Équipe 1',
          team2Name: 'Équipe 2'
        },
        gameState: 'SETUP',
        lastUpdated: Date.now()
      };

      await setDoc(roomRef, roomData);
      setRoomId(code);
      setIsHost(true);
      return code;
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Erreur lors de la création de la salle. Vérifiez votre connexion ou la configuration Firebase.\n" + error.message);
      return null;
    }
  };

  const joinRoom = async (code) => {
    try {
      const roomRef = doc(db, 'rooms', code);
      const docSnap = await getDoc(roomRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const existingPlayer = data.players.find(p => p.id === playerId);
        
        if (!existingPlayer) {
          const newPlayer = {
            id: playerId,
            name: `Joueur ${data.players.length + 1}`,
            team: 'unassigned',
            isHost: false
          };
          await updateDoc(roomRef, {
            players: [...data.players, newPlayer]
          });
        }
        
        setRoomId(code);
        setIsHost(data.hostId === playerId);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Erreur lors de la connexion à la salle.\n" + error.message);
      return false;
    }
  };

  const updateRoomData = async (updates) => {
    if (!roomId) return;
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      ...updates,
      lastUpdated: Date.now()
    });
  };

  const updateRoomState = async (newState) => {
    if (!roomId) return;
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      gameState: newState,
      lastUpdated: Date.now()
    });
  };

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setOnlineState(data); // Now contains full room data (players, settings, gameState)
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  return (
    <MultiplayerContext.Provider value={{ 
      roomId, 
      isHost, 
      playerId, 
      createRoom, 
      joinRoom, 
      updateRoomState,
      updateRoomData,
      onlineState 
    }}>
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => useContext(MultiplayerContext);
