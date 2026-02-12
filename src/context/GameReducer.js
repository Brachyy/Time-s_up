export const initialState = {
  players: [],
  teams: [
    { name: 'Équipe 1', score: 0, members: [], currentPlayerIndex: 0, playerStats: {} },
    { name: 'Équipe 2', score: 0, members: [], currentPlayerIndex: 0, playerStats: {} }
  ],
  deck: [], 
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
      const finishedTeam = state.teams[finishedTeamIdx];
      
      // Update finished team's player index
      const nextRoundTeams = [...state.teams];
      nextRoundTeams[finishedTeamIdx] = {
        ...finishedTeam,
        currentPlayerIndex: (finishedTeam.currentPlayerIndex + 1) % (finishedTeam.members.length || 1)
      };

      const nextRoundTeamIdx = (finishedTeamIdx + 1) % state.teams.length;

      const resetDeck = state.deck.map(card => ({ ...card, guessed: false }));
      const shuffledDeck = resetDeck.sort(() => 0.5 - Math.random());
      
      return { 
        ...state, 
        currentRound: state.currentRound + 1, 
        deck: shuffledDeck,
        gameState: 'PAUSED',
        currentTeam: nextRoundTeamIdx,
        teams: nextRoundTeams
      };
    case 'END_TURN':
      return { ...state, gameState: 'TURN_REVIEW' };

    case 'VALIDATE_TURN':
      const invalidatedIds = action.payload || [];
      
      const currentTeamIndex = state.currentTeam;
      const currentTeamVal = state.teams[currentTeamIndex];
      
      const newScore = Math.max(0, currentTeamVal.score - invalidatedIds.length);
      
      const pIndex = currentTeamVal.currentPlayerIndex;
      const currentStats = currentTeamVal.playerStats[pIndex] || { guessed: 0 };
      const newGuessedCount = Math.max(0, (currentStats.guessed || 0) - invalidatedIds.length);
      
      const newPlayerStats = {
        ...currentTeamVal.playerStats,
        [pIndex]: { ...currentStats, guessed: newGuessedCount }
      };

      const newTeams = [...state.teams];
      newTeams[currentTeamIndex] = {
        ...currentTeamVal,
        score: newScore,
        playerStats: newPlayerStats
      };

      const revertDeck = state.deck.map(card => 
        invalidatedIds.includes(card.id) ? { ...card, guessed: false } : card
      );

      const team = newTeams[currentTeamIndex];
      const nextPlayerIndex = (team.currentPlayerIndex + 1) % (team.members.length || 1);
      newTeams[currentTeamIndex] = {
        ...team,
        currentPlayerIndex: nextPlayerIndex
      };

      const nextTeamIndex = (currentTeamIndex + 1) % state.teams.length;

      return { 
        ...state, 
        deck: revertDeck,
        teams: newTeams,
        gameState: 'PAUSED', 
        currentTeam: nextTeamIndex,
        playedCardsInTurn: []
      };

    case 'SYNC':
      return action.payload;
    case 'PASS_CARD':
      const passCardId = action.payload;
      const passCard = state.deck.find(c => c.id === passCardId);
      const passOtherCards = state.deck.filter(c => c.id !== passCardId);
      return {
        ...state,
        deck: [...passOtherCards, passCard]
      };
    case 'TABOO_ERROR':
      const tabooCardId = action.payload;
      const cardToMove = state.deck.find(c => c.id === tabooCardId);
      const otherCards = state.deck.filter(c => c.id !== tabooCardId);
      const newDeckOrder = [...otherCards, cardToMove];

      return { 
        ...state, 
        deck: newDeckOrder,
        gameState: 'TURN_REVIEW' 
      };

    case 'CARD_GUESSED':
      const cardId = action.payload;
      const updatedDeck = state.deck.map(card => 
        card.id === cardId ? { ...card, guessed: true } : card
      );
      const guessedCard = state.deck.find(c => c.id === cardId);
      
      const currentTeamIdx = state.currentTeam;
      const cTeam = state.teams[currentTeamIdx];
      const currentPlayerIdx = cTeam.currentPlayerIndex;
      
      const cStats = cTeam.playerStats[currentPlayerIdx] || { guessed: 0 };
      const updatedPlayerStats = {
        ...cTeam.playerStats,
        [currentPlayerIdx]: { ...cStats, guessed: (cStats.guessed || 0) + 1 }
      };

      const updatedTeams = [...state.teams];
      updatedTeams[currentTeamIdx] = {
        ...cTeam,
        score: cTeam.score + 1,
        playerStats: updatedPlayerStats
      };
      
      return { 
        ...state, 
        deck: updatedDeck, 
        teams: updatedTeams,
        playedCardsInTurn: [...state.playedCardsInTurn, guessedCard]
      };
    default:
      return state;
  }
};
