<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { createNote } from '$lib/api';

  const STORAGE_KEY = 'ithinknote_id';

  onMount(async () => {
    // Check if user already has a note ID stored
    const existingId = localStorage.getItem(STORAGE_KEY);

    if (existingId) {
      // Redirect to existing note
      goto(`/note/${existingId}`);
      return;
    }

    // Create a new note
    try {
      const note = await createNote();
      localStorage.setItem(STORAGE_KEY, note.id);
      goto(`/note/${note.id}`);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  });
</script>

<div class="loading">
  <p>Loading your note...</p>
</div>

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-family: 'Courier New', Courier, monospace;
    color: #5c4a3d;
    background-color: #f5f0e6;
  }
</style>
