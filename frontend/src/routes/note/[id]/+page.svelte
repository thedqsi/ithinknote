<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getNote, updateNote, createNote, type Note } from '$lib/api';

  const STORAGE_KEY = 'ithinknote_id';

  let note: Note | null = $state(null);
  let content = $state('');
  let error = $state('');
  let saveStatus = $state<'saved' | 'saving' | 'error' | ''>('');
  let timeRemaining = $state('');

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  let countdownInterval: ReturnType<typeof setInterval> | null = null;

  function updateCountdown() {
    if (!note) return;

    const now = new Date();
    const expiresAt = new Date(note.expires_at);
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) {
      timeRemaining = 'Expired';
      error = 'This note has expired. Create a new one?';
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      timeRemaining = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      timeRemaining = `${minutes}m ${seconds}s`;
    } else {
      timeRemaining = `${seconds}s`;
    }
  }

  async function loadNote(id: string) {
    try {
      note = await getNote(id);
      content = note.content;
      updateCountdown();
      countdownInterval = setInterval(updateCountdown, 1000);
    } catch (e) {
      error = 'Note not found or has expired';
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  async function save() {
    if (!note) return;

    saveStatus = 'saving';
    try {
      await updateNote(note.id, content);
      saveStatus = 'saved';
      setTimeout(() => {
        if (saveStatus === 'saved') saveStatus = '';
      }, 2000);
    } catch (e) {
      saveStatus = 'error';
      if (String(e).includes('expired')) {
        error = 'Note has expired';
      }
    }
  }

  function handleInput() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(save, 500);
  }

  async function createNewNote() {
    try {
      const newNote = await createNote();
      localStorage.setItem(STORAGE_KEY, newNote.id);
      goto(`/note/${newNote.id}`);
      window.location.reload();
    } catch (e) {
      console.error('Failed to create new note:', e);
    }
  }

  onMount(() => {
    const id = $page.params.id;
    loadNote(id);
  });

  onDestroy(() => {
    if (saveTimeout) clearTimeout(saveTimeout);
    if (countdownInterval) clearInterval(countdownInterval);
  });
</script>

<svelte:head>
  <title>iThinkNote</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</svelte:head>

<div class="container">
  {#if error}
    <div class="error-container">
      <p class="error-message">{error}</p>
      <button class="new-note-btn" onclick={createNewNote}>
        Create New Note
      </button>
    </div>
  {:else if note}
    <header>
      <h1>iThinkNote</h1>
      <div class="status">
        {#if timeRemaining}
          <span class="expiry">expires in {timeRemaining}</span>
        {/if}
        {#if saveStatus === 'saving'}
          <span class="save-indicator saving">saving...</span>
        {:else if saveStatus === 'saved'}
          <span class="save-indicator saved">saved</span>
        {:else if saveStatus === 'error'}
          <span class="save-indicator error">save failed</span>
        {/if}
      </div>
    </header>
    <main>
      <textarea
        bind:value={content}
        oninput={handleInput}
        placeholder="Start writing your thoughts..."
        spellcheck="false"
      ></textarea>
    </main>
  {:else}
    <div class="loading">
      <p>Loading...</p>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #f5f0e6;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23d4c4a8' fill-opacity='0.15'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    box-sizing: border-box;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0 20px;
    border-bottom: 1px dashed #c4b49a;
    margin-bottom: 20px;
  }

  h1 {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 1.2rem;
    font-weight: 500;
    color: #5c4a3d;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 0.75rem;
  }

  .expiry {
    color: #8b7355;
  }

  .save-indicator {
    padding: 2px 8px;
    border-radius: 3px;
    transition: opacity 0.3s ease;
  }

  .save-indicator.saving {
    color: #8b7355;
  }

  .save-indicator.saved {
    color: #5a7247;
  }

  .save-indicator.error {
    color: #a35454;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  textarea {
    flex: 1;
    min-height: calc(100vh - 150px);
    width: 100%;
    padding: 20px;
    border: none;
    outline: none;
    resize: none;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 1rem;
    line-height: 1.8;
    color: #3d3229;
    background: transparent;
    box-sizing: border-box;
  }

  textarea::placeholder {
    color: #b3a18a;
    font-style: italic;
  }

  .loading, .error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    color: #5c4a3d;
  }

  .error-message {
    color: #6b5344;
    margin-bottom: 20px;
    text-align: center;
  }

  .new-note-btn {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 0.9rem;
    padding: 12px 24px;
    background: #5c4a3d;
    color: #f5f0e6;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .new-note-btn:hover {
    background: #4a3b30;
  }

  @media (max-width: 600px) {
    .container {
      padding: 15px;
    }

    header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    textarea {
      padding: 15px 0;
      min-height: calc(100vh - 180px);
    }
  }
</style>
