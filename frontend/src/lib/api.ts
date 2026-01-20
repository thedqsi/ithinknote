const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Note {
  id: string;
  content: string;
  created_at: string;
  expires_at: string;
}

export async function createNote(): Promise<Note> {
  const response = await fetch(`${API_BASE}/note`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create note');
  }

  return response.json();
}

export async function getNote(id: string): Promise<Note> {
  const response = await fetch(`${API_BASE}/note/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Note not found or has expired');
    }
    throw new Error('Failed to fetch note');
  }

  return response.json();
}

export async function updateNote(id: string, content: string): Promise<Note> {
  const response = await fetch(`${API_BASE}/note/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Note not found or has expired');
    }
    throw new Error('Failed to update note');
  }

  return response.json();
}
