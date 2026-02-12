import React, { createContext, useReducer, useContext } from 'react';
import { gameReducer, initialState } from './GameReducer';

const GameContext = createContext();

import { useMultiplayer } from './MultiplayerContext';
import { useEffect } from 'react';

export const GameProvider = ({ children }) => {
  const [state, localDispatch] = useReducer(gameReducer, initialState);
  const { roomId, updateRoomState, onlineState } = useMultiplayer();

  // Sync from Firestore to Local
  useEffect(() => {
    if (onlineState) {
      localDispatch({ type: 'SYNC', payload: onlineState });
    }
  }, [onlineState]);

  // Wrapper for dispatch to sync Local to Firestore
  const dispatch = (action) => {
    // 1. Update Local
    localDispatch(action);
    
    // 2. If Online, Update Firestore (Optimistic / Host-driven)
    // We need the *next* state. Since useReducer is async/closure, 
    // we can't get it easily here without running the reducer again or using a ref.
    // Simpler approach: Run reducer here to get next state, then push.
    if (roomId) {
      const nextState = gameReducer(state, action);
      updateRoomState(nextState);
    }
  };

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
