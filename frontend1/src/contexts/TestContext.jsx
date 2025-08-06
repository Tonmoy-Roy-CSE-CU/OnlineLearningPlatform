// context/TestContext.js
import React, { createContext, useContext, useReducer } from 'react';

const TestContext = createContext();

// Test reducer for managing test state
const testReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_TEST':
      return {
        ...state,
        currentTest: action.payload
      };
    case 'SET_TEST_ANSWERS':
      return {
        ...state,
        answers: action.payload
      };
    case 'UPDATE_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.answer
        }
      };
    case 'SET_TIME_LEFT':
      return {
        ...state,
        timeLeft: action.payload
      };
    case 'SET_TEST_STARTED':
      return {
        ...state,
        testStarted: action.payload
      };
    case 'SET_TEST_SUBMITTED':
      return {
        ...state,
        testSubmitted: action.payload
      };
    case 'RESET_TEST':
      return {
        currentTest: null,
        answers: {},
        timeLeft: 0,
        testStarted: false,
        testSubmitted: false
      };
    default:
      return state;
  }
};

const initialTestState = {
  currentTest: null,
  answers: {},
  timeLeft: 0,
  testStarted: false,
  testSubmitted: false
};

export const TestProvider = ({ children }) => {
  const [state, dispatch] = useReducer(testReducer, initialTestState);

  const setCurrentTest = (test) => {
    dispatch({ type: 'SET_CURRENT_TEST', payload: test });
    dispatch({ type: 'SET_TIME_LEFT', payload: test.duration_minutes * 60 });
  };

  const updateAnswer = (questionId, answer) => {
    dispatch({ type: 'UPDATE_ANSWER', payload: { questionId, answer } });
  };

  const setTimeLeft = (time) => {
    dispatch({ type: 'SET_TIME_LEFT', payload: time });
  };

  const startTest = () => {
    dispatch({ type: 'SET_TEST_STARTED', payload: true });
  };

  const submitTest = () => {
    dispatch({ type: 'SET_TEST_SUBMITTED', payload: true });
  };

  const resetTest = () => {
    dispatch({ type: 'RESET_TEST' });
  };

  const value = {
    ...state,
    setCurrentTest,
    updateAnswer,
    setTimeLeft,
    startTest,
    submitTest,
    resetTest
  };

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};