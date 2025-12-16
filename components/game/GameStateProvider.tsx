'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { GameState } from '@/types/game';
import { GameEngine } from '@/lib/gameEngine';
import { createInitialGameState, InitialGameConfig } from '@/lib/gameState';

interface GameContextType {
  gameState: GameState;
  gameEngine: GameEngine;
  setPaused: (paused: boolean) => void;
  setGameSpeed: (speed: number) => void;
  hireEmployee: (candidateId: string) => boolean;
  fireEmployee: (employeeId: string) => void;
  prioritizeFeature: (featureId: string, priority: number) => void;
  startFundraising: (roundType: 'seed' | 'seriesA' | 'seriesB' | 'seriesC' | 'seriesD') => boolean;
  acceptFundingOffer: (offerId: string) => boolean;
  respondToEvent: (eventId: string, optionId: string) => void;
  purchaseOffice: (tier: 'coworking' | 'small' | 'medium' | 'large') => boolean;
  selectProduct: (productId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameStateProvider({ 
  children,
  initialConfig = { startingMoney: 100000, difficulty: 'medium' }
}: { 
  children: React.ReactNode;
  initialConfig?: InitialGameConfig;
}) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialState = createInitialGameState(initialConfig);
    return initialState;
  });
  
  const gameEngineRef = useRef<GameEngine | null>(null);
  
  if (!gameEngineRef.current) {
    gameEngineRef.current = new GameEngine(gameState);
  }

  const gameEngine = gameEngineRef.current;

  // Game loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (deltaTime > 0) {
        gameEngine.tick(deltaTime);
        setGameState(gameEngine.getState());
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const setPaused = (paused: boolean) => {
    gameEngine.setPaused(paused);
    setGameState(gameEngine.getState());
  };

  const setGameSpeed = (speed: number) => {
    gameEngine.setGameSpeed(speed);
    setGameState(gameEngine.getState());
  };

  const hireEmployee = (candidateId: string) => {
    const success = gameEngine.hireEmployee(candidateId);
    setGameState(gameEngine.getState());
    return success;
  };

  const fireEmployee = (employeeId: string) => {
    gameEngine.fireEmployee(employeeId);
    setGameState(gameEngine.getState());
  };

  const prioritizeFeature = (featureId: string, priority: number) => {
    gameEngine.prioritizeFeature(featureId, priority);
    setGameState(gameEngine.getState());
  };

  const startFundraising = (roundType: 'seed' | 'seriesA' | 'seriesB' | 'seriesC' | 'seriesD') => {
    const success = gameEngine.startFundraising(roundType);
    setGameState(gameEngine.getState());
    return success;
  };

  const acceptFundingOffer = (offerId: string) => {
    const success = gameEngine.acceptFundingOffer(offerId);
    setGameState(gameEngine.getState());
    return success;
  };

  const respondToEvent = (eventId: string, optionId: string) => {
    gameEngine.respondToEvent(eventId, optionId);
    setGameState(gameEngine.getState());
  };

  const purchaseOffice = (tier: 'coworking' | 'small' | 'medium' | 'large') => {
    const success = gameEngine.purchaseOffice(tier);
    setGameState(gameEngine.getState());
    return success;
  };

  const selectProduct = (productId: string) => {
    gameEngine.setProductFromTemplate(productId);
    setGameState(gameEngine.getState());
  };

  return (
    <GameContext.Provider
          value={{
            gameState,
            gameEngine,
            setPaused,
            setGameSpeed,
            hireEmployee,
            fireEmployee,
            prioritizeFeature,
            startFundraising,
            acceptFundingOffer,
            respondToEvent,
            purchaseOffice,
            selectProduct,
          }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
