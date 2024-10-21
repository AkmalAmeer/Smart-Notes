document.addEventListener('DOMContentLoaded', function() {
    const noteInput = document.getElementById('noteInput');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const notesContainer = document.getElementById('notesContainer');
    const colorPicker = document.getElementById('colorPicker');
    const searchInput = document.getElementById('searchInput');
    const wikiSearchBtn = document.getElementById('wikiSearchBtn');
    const imageSearchBtn = document.getElementById('imageSearchBtn');
    const webSearchResults = document.getElementById('webSearchResults');

    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    function renderNotes() {
        notesContainer.innerHTML = '';
        const searchQuery = searchInput.value.toLowerCase();
        notes.forEach((note, index) => {
            if (note.content.toLowerCase().includes(searchQuery)) {
                const noteDiv = document.createElement('div');
                noteDiv.classList.add('note');
                noteDiv.style.backgroundColor = note.color;
                noteDiv.setAttribute('draggable', true);

                const noteText = document.createElement('p');
                noteText.innerText = note.content;

                const deleteBtn = document.createElement('button');
                deleteBtn.innerText = 'X';
                deleteBtn.classList.add('delete-btn');
                deleteBtn.addEventListener('click', () => deleteNote(index));

                noteDiv.appendChild(noteText);
                noteDiv.appendChild(deleteBtn);
                notesContainer.appendChild(noteDiv);

                makeDraggable(noteDiv);
            }
        });
    }

    function addNote() {
        const noteContent = noteInput.value;
        const noteColor = colorPicker.value;

        if (noteContent === '') return;

        const newNote = {
            content: noteContent,
            color: noteColor
        };

        notes.push(newNote);
        localStorage.setItem('notes', JSON.stringify(notes));
        noteInput.value = '';
        webSearchResults.innerHTML = '';
        renderNotes();
    }

    function deleteNote(index) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
    }

    function makeDraggable(noteElement) {
        noteElement.addEventListener('dragstart', dragStart);
        noteElement.addEventListener('dragend', dragEnd);
    }

    function dragStart(e) {
        e.target.classList.add('dragging');
    }

    function dragEnd(e) {
        e.target.classList.remove('dragging');
    }

    async function searchWikipedia(query) {
        const url = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=extracts&exintro&explaintext&titles=${query}`;
        const response = await fetch(url);
        const data = await response.json();
        const pages = data.query.pages;
        const page = pages[Object.keys(pages)[0]];
        return page.extract ? page.extract : 'No content found';
    }

    async function searchImages(query) {
        const apiKey = 'VCQSgO4mYeuV0C1hIDGyAbHafvIZ1zRUwD2QXK6-EIA';
        const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    }

    wikiSearchBtn.addEventListener('click', async () => {
        const query = noteInput.value;
        if (query === '') return;
        const summary = await searchWikipedia(query);
        webSearchResults.innerHTML = `<div class="web-result"><p class="copy-content">${summary}</p></div>`;

        document.querySelector('.copy-content').addEventListener('click', function() {
            noteInput.value += `\n${this.innerText}`;
        });
    });

    imageSearchBtn.addEventListener('click', async () => {
        const query = noteInput.value;
        if (query === '') return;
        const images = await searchImages(query);
        webSearchResults.innerHTML = images.map(image => `
            <div class="web-result">
                <img src="${image.urls.small}" alt="${query}" class="copy-image">
            </div>
        `).join('');

        document.querySelectorAll('.copy-image').forEach(img => {
            img.addEventListener('click', function() {
                noteInput.value += `\n${this.src}`;
            });
        });
    });

    noteInput.addEventListener('input', function() {
        if (this.value === '') {
            webSearchResults.innerHTML = '';
        }
    });

    addNoteBtn.addEventListener('click', addNote);
    searchInput.addEventListener('input', renderNotes);
    renderNotes();
});