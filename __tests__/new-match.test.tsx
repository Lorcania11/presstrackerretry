import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NewMatchScreen from '@/app/(tabs)/new-match';
import { MatchProvider } from '@/context/MatchContext';

describe('NewMatchScreen', () => {
  it('should initialize teams with default values', () => {
    const { getByPlaceholderText } = render(
      <MatchProvider>
        <NewMatchScreen />
      </MatchProvider>
    );

    const team1Input = getByPlaceholderText('Enter Team 1 name');
    const team2Input = getByPlaceholderText('Enter Team 2 name');

    expect(team1Input).toBeTruthy();
    expect(team2Input).toBeTruthy();
  });

  it('should validate unique team names', () => {
    const { getByText, getByPlaceholderText } = render(
      <MatchProvider>
        <NewMatchScreen />
      </MatchProvider>
    );

    const team1Input = getByPlaceholderText('Enter Team 1 name');
    const team2Input = getByPlaceholderText('Enter Team 2 name');
    const createButton = getByText('Create Match');

    fireEvent.changeText(team1Input, 'Team A');
    fireEvent.changeText(team2Input, 'Team A');
    fireEvent.press(createButton);

    expect(getByText('Each team must have a unique name')).toBeTruthy();
  });
});
