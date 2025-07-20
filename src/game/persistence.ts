import type { SavedGame } from './types';

// Save game to localStorage
export function saveToPersistence(save: SavedGame, key: string): boolean {
  try {
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage not available');
      return false;
    }
    
    const serialized = JSON.stringify(save);
    localStorage.setItem(key, serialized);
    
    // Also save a backup with timestamp
    const backupKey = `${key}-backup-${save.timestamp}`;
    localStorage.setItem(backupKey, serialized);
    
    // Keep only last 3 backups
    cleanupBackups(key);
    
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

// Load game from localStorage
export function loadFromPersistence(key: string): SavedGame | null {
  try {
    if (typeof localStorage === 'undefined') {
      return undefined;
    }
    
    const serialized = localStorage.getItem(key);
    if (!serialized) {
      return undefined;
    }
    
    const save = JSON.parse(serialized) as SavedGame;
    
    // Validate save format
    if (!isValidSave(save)) {
      console.warn('Invalid save format');
      return undefined;
    }
    
    return save;
  } catch (error) {
    console.error('Failed to load game:', error);
    return undefined;
  }
}

// List all available saves
export function listSaves(baseKey: string): Array<{ key: string; save: SavedGame }> {
  const saves: Array<{ key: string; save: SavedGame }> = [];
  
  try {
    if (typeof localStorage === 'undefined') {
      return saves;
    }
    
    // Get main save
    const mainSave = loadFromPersistence(baseKey);
    if (mainSave) {
      saves.push({ key: baseKey, save: mainSave });
    }
    
    // Get backups
    const backupPrefix = `${baseKey}-backup-`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(backupPrefix)) {
        const save = loadFromPersistence(key);
        if (save) {
          saves.push({ key, save });
        }
      }
    }
    
    // Sort by timestamp, newest first
    saves.sort((a, b) => b.save.timestamp - a.save.timestamp);
    
    return saves;
  } catch (error) {
    console.error('Failed to list saves:', error);
    return saves;
  }
}

// Delete a save
export function deleteSave(key: string): boolean {
  try {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to delete save:', error);
    return false;
  }
}

// Export save as JSON file
export function exportSave(save: SavedGame, filename?: string): void {
  try {
    const serialized = JSON.stringify(save, null, 2);
    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `tetraspore-save-${save.timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export save:', error);
  }
}

// Import save from JSON file
export function importSave(file: File): Promise<SavedGame | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const save = JSON.parse(content) as SavedGame;
        
        if (isValidSave(save)) {
          resolve(save);
        } else {
          console.warn('Invalid save file format');
          resolve(null);
        }
      } catch (error) {
        console.error('Failed to parse save file:', error);
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      console.error('Failed to read save file');
      resolve(null);
    };
    
    reader.readAsText(file);
  });
}

// Validate save format
function isValidSave(save: any): save is SavedGame {
  return (
    save &&
    typeof save === 'object' &&
    'state' in save &&
    'actionHistory' in save &&
    'timestamp' in save &&
    'version' in save &&
    typeof save.state === 'object' &&
    Array.isArray(save.actionHistory) &&
    typeof save.timestamp === 'number' &&
    typeof save.version === 'string'
  );
}

// Clean up old backups, keeping only the most recent ones
function cleanupBackups(baseKey: string, maxBackups = 3): void {
  try {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    const backupPrefix = `${baseKey}-backup-`;
    const backups: Array<{ key: string; timestamp: number }> = [];
    
    // Find all backups
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(backupPrefix)) {
        const timestamp = parseInt(key.replace(backupPrefix, ''), 10);
        if (!isNaN(timestamp)) {
          backups.push({ key, timestamp });
        }
      }
    }
    
    // Sort by timestamp, newest first
    backups.sort((a, b) => b.timestamp - a.timestamp);
    
    // Remove old backups
    for (let i = maxBackups; i < backups.length; i++) {
      localStorage.removeItem(backups[i].key);
    }
  } catch (error) {
    console.error('Failed to cleanup backups:', error);
  }
}

// Get save statistics
export function getSaveStats(save: SavedGame): {
  turnsPlayed: number;
  totalSpecies: number;
  aliveSpecies: number;
  extinctSpecies: number;
  totalActions: number;
  playTime?: string;
} {
  const aliveSpecies = save.state.species.filter(s => !s.extinction_turn).length;
  const extinctSpecies = save.state.species.filter(s => s.extinction_turn).length;
  
  return {
    turnsPlayed: save.state.turn,
    totalSpecies: save.state.species.length,
    aliveSpecies,
    extinctSpecies,
    totalActions: save.actionHistory.length
  };
}