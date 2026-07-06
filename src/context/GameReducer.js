export const initialState = {
  players: [],
  teams: [
    { name: 'Équipe 1', score: 0, members: [], currentPlayerIndex: 0, playerStats: {} },
    { name: 'Équipe 2', score: 0, members: [], currentPlayerIndex: 0, playerStats: {} }
  ],
  deck: [], 
  waitingDeck: [],
  fullDeck: [],
  currentRound: 1, 
  currentTeam: 0, 
  gameState: 'HOME', 
  timer: 30,
  currentCard: null,
  playedCardsInTurn: [],
  settings: {
    mode: 'celebrities', 
    cardCount: 40,
    timerDuration: 30,
  }
};

export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'GO_TO_SETUP':
      return { ...state, gameState: 'SETUP' };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_TEAMS':
      const teamsWithStats = action.payload.map(t => ({ ...t, playerStats: {} }));
      return { ...state, teams: teamsWithStats };
    case 'START_GAME':
      const { deck, teams, timerDuration, mode, cardCount } = action.payload;
      const initializedTeams = teams.map(t => ({ ...t, playerStats: t.playerStats || {} }));
      
      return { 
        ...state, 
        gameState: 'PLAYING', 
        deck,
        waitingDeck: [],
        fullDeck: deck,
        teams: initializedTeams,
        settings: { mode, cardCount, timerDuration },
        currentRound: 1,
        currentTeam: 0,
        timer: timerDuration
      };
    case 'START_TURN':
      return { 
        ...state, 
        gameState: 'PLAYING',
        playedCardsInTurn: [] 
      };
    case 'PAUSE_GAME':
      return { ...state, gameState: 'PAUSED' };
    case 'NEXT_ROUND':
      if (state.currentRound >= 3) {
        return { ...state, gameState: 'GAME_OVER' };
      }
      
      const finishedTeamIdx = state.currentTeam;
      const nextRoundTeamIdx = (finishedTeamIdx + 1) % state.teams.length;

      const resetDeck = state.fullDeck.map(card => ({ ...card, guessed: false }));
      const shuffledDeck = resetDeck.sort(() => 0.5 - Math.random());
      
      return { 
        ...state, 
        currentRound: state.currentRound + 1, 
        deck: shuffledDeck,
        waitingDeck: [],
        gameState: 'PAUSED',
        currentTeam: nextRoundTeamIdx
      };
    case 'END_TURN':
      let updatedPlayedCards = state.playedCardsInTurn;
      let finalDeckEnd = state.deck;
      let finalWaitingDeckEnd = state.waitingDeck || [];
      
      if (action.payload) {
        const timeoutCardId = action.payload.id;
        const timeoutCard = state.deck.find(c => c.id === timeoutCardId);
        if (timeoutCard) {
          finalDeckEnd = state.deck.filter(c => c.id !== timeoutCardId);
          updatedPlayedCards = [...updatedPlayedCards, { ...timeoutCard, status: 'timeout' }];
          
          if (finalDeckEnd.length === 0 && finalWaitingDeckEnd.length > 0) {
            finalDeckEnd = [...finalWaitingDeckEnd].sort(() => 0.5 - Math.random());
            finalWaitingDeckEnd = [];
          }
        }
      }
      return { 
        ...state, 
        deck: finalDeckEnd,
        waitingDeck: finalWaitingDeckEnd,
        gameState: 'TURN_REVIEW', 
        playedCardsInTurn: updatedPlayedCards 
      };

    case 'VALIDATE_TURN':
      const invalidatedIds = action.payload || [];
      
      // Determine which played cards are validated vs invalidated
      const allPlayedIds = (state.playedCardsInTurn || []).map(c => c.id);
      const validatedIds = allPlayedIds.filter(id => !invalidatedIds.includes(id));
      
      const currentTeamIndex = state.currentTeam;
      const currentTeamVal = state.teams[currentTeamIndex];
      
      // Find cards that were actually guessed during the active turn (not skipped, taboo, or timeout)
      const guessedDuringTurnIds = (state.playedCardsInTurn || [])
        .filter(c => c.status !== 'timeout' && c.status !== 'skipped' && c.status !== 'taboo')
        .map(c => c.id);

      // The net change is: (validated cards) - (cards that already incremented the score during the turn)
      const netChange = validatedIds.length - guessedDuringTurnIds.length;

      const newScore = Math.max(0, currentTeamVal.score + netChange);
      
      const pIndex = currentTeamVal.currentPlayerIndex;
      const currentStats = currentTeamVal.playerStats[pIndex] || { guessed: 0, words: [] };
      let playerWords = [...(currentStats.words || [])];

      // Process each card played during this turn:
      // - If it was validated (not in invalidatedIds), make sure it is in playerWords
      // - If it was invalidated (in invalidatedIds), remove it from playerWords
      (state.playedCardsInTurn || []).forEach(card => {
        if (invalidatedIds.includes(card.id)) {
          playerWords = playerWords.filter(w => !(w.id === card.id && w.round === state.currentRound));
        } else {
          const exists = playerWords.some(w => w.id === card.id && w.round === state.currentRound);
          if (!exists) {
            playerWords.push({ word: card.word, round: state.currentRound, id: card.id });
          }
        }
      });

      const newPlayerStats = {
        ...currentTeamVal.playerStats,
        [pIndex]: {
          ...currentStats,
          guessed: playerWords.length,
          words: playerWords
        }
      };

      const newTeams = [...state.teams];
      newTeams[currentTeamIndex] = {
        ...currentTeamVal,
        score: newScore,
        playerStats: newPlayerStats
      };

      // Invalidated cards are marked as guessed: false and added to the waitingDeck
      const invalidatedCards = state.playedCardsInTurn
        .filter(c => invalidatedIds.includes(c.id))
        .map(c => ({ id: c.id, word: c.word, guessed: false }));
      
      const updatedWaitingDeck = [...(state.waitingDeck || []), ...invalidatedCards];

      let finalDeckVal = state.deck;
      let finalWaitingDeckVal = updatedWaitingDeck;
      
      if (finalDeckVal.length === 0 && finalWaitingDeckVal.length > 0) {
        finalDeckVal = [...finalWaitingDeckVal].sort(() => 0.5 - Math.random());
        finalWaitingDeckVal = [];
      }

      const team = newTeams[currentTeamIndex];
      const nextPlayerIndex = (team.currentPlayerIndex + 1) % (team.members.length || 1);
      newTeams[currentTeamIndex] = {
        ...team,
        currentPlayerIndex: nextPlayerIndex
      };

      const nextTeamIndex = (currentTeamIndex + 1) % state.teams.length;
      const isRoundOver = finalDeckVal.length === 0 && finalWaitingDeckVal.length === 0;

      return { 
        ...state, 
        deck: finalDeckVal,
        waitingDeck: finalWaitingDeckVal,
        teams: newTeams,
        gameState: isRoundOver ? 'PLAYING' : 'PAUSED', 
        currentTeam: isRoundOver ? state.currentTeam : nextTeamIndex,
        playedCardsInTurn: []
      };

    case 'SYNC':
      return action.payload;
    case 'PASS_CARD':
      const passCardId = action.payload;
      const passCard = state.deck.find(c => c.id === passCardId);
      if (!passCard) return state;
      
      const passUpdatedDeck = state.deck.filter(c => c.id !== passCardId);
      const passCardWithStatus = { ...passCard, status: 'skipped' };
      
      let finalDeckPass = passUpdatedDeck;
      let finalWaitingDeckPass = state.waitingDeck || [];
      if (finalDeckPass.length === 0 && finalWaitingDeckPass.length > 0) {
        finalDeckPass = [...finalWaitingDeckPass].sort(() => 0.5 - Math.random());
        finalWaitingDeckPass = [];
      }
      
      return {
        ...state,
        deck: finalDeckPass,
        waitingDeck: finalWaitingDeckPass,
        playedCardsInTurn: [...state.playedCardsInTurn, passCardWithStatus]
      };
    case 'TABOO_ERROR':
      const tabooCardId = action.payload;
      const tabooCard = state.deck.find(c => c.id === tabooCardId);
      if (!tabooCard) return state;
      
      const tabooUpdatedDeck = state.deck.filter(c => c.id !== tabooCardId);
      const tabooCardWithStatus = { ...tabooCard, status: 'taboo' };
      
      let finalDeckTaboo = tabooUpdatedDeck;
      let finalWaitingDeckTaboo = state.waitingDeck || [];
      if (finalDeckTaboo.length === 0 && finalWaitingDeckTaboo.length > 0) {
        finalDeckTaboo = [...finalWaitingDeckTaboo].sort(() => 0.5 - Math.random());
        finalWaitingDeckTaboo = [];
      }
      
      return { 
        ...state, 
        deck: finalDeckTaboo,
        waitingDeck: finalWaitingDeckTaboo,
        playedCardsInTurn: [...state.playedCardsInTurn, tabooCardWithStatus],
        gameState: 'TURN_REVIEW' 
      };

    case 'CARD_GUESSED':
      const cardId = action.payload;
      const updatedDeck = state.deck.filter(card => card.id !== cardId);
      const guessedCard = state.deck.find(c => c.id === cardId);
      if (!guessedCard) return state;
      
      const currentTeamIdx = state.currentTeam;
      const cTeam = state.teams[currentTeamIdx];
      const currentPlayerIdx = cTeam.currentPlayerIndex;
      
      const cStats = cTeam.playerStats[currentPlayerIdx] || { guessed: 0, words: [] };
      const newWordEntry = { word: guessedCard.word, round: state.currentRound, id: guessedCard.id };
      const updatedPlayerStats = {
        ...cTeam.playerStats,
        [currentPlayerIdx]: { 
          ...cStats, 
          guessed: (cStats.guessed || 0) + 1,
          words: [...(cStats.words || []), newWordEntry]
        }
      };

      const updatedTeams = [...state.teams];
      updatedTeams[currentTeamIdx] = {
        ...cTeam,
        score: cTeam.score + 1,
        playerStats: updatedPlayerStats
      };

      let finalDeckGuessed = updatedDeck;
      let finalWaitingDeckGuessed = state.waitingDeck || [];
      if (finalDeckGuessed.length === 0 && finalWaitingDeckGuessed.length > 0) {
        finalDeckGuessed = [...finalWaitingDeckGuessed].sort(() => 0.5 - Math.random());
        finalWaitingDeckGuessed = [];
      }
      
      return { 
        ...state, 
        deck: finalDeckGuessed, 
        waitingDeck: finalWaitingDeckGuessed,
        teams: updatedTeams,
        playedCardsInTurn: [...state.playedCardsInTurn, { ...guessedCard, guessed: true }]
      };
    default:
      return state;
  }
};
