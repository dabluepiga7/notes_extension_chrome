document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get('notes', function(data) {
    if (data.notes) {
      var notes = data.notes.split('\n');
      notes.forEach(function(note) {
        if (note.trim() !== '') {
          createNoteElement(note);
        }
      });
    }
  });

  document.getElementById('saveButton').addEventListener('click', saveNote);
  document.getElementById('noteInput').addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'Enter') {
      saveNote();
    }
  });
});

function saveNote() {
  var noteText = document.getElementById('noteInput').value.trim();
  if (noteText !== '') {
    createNoteElement(noteText);
    saveNoteToStorage(noteText);
    document.getElementById('noteInput').value = '';
  }
}

function createNoteElement(noteText) {
  var noteElement = document.createElement('div');
  noteElement.classList.add('note');

  var closeButton = document.createElement('button');
  closeButton.classList.add('closeButton');
  closeButton.innerHTML = '<i class="fas fa-times"></i>';
  closeButton.addEventListener('click', function() {
    removeNoteElement(noteElement, noteText);
  });

  var noteContent = document.createElement('div');
  noteContent.classList.add('note-content');
  noteContent.textContent = noteText;

  var copyButton = document.createElement('button');
  copyButton.classList.add('copyButton');
  copyButton.innerHTML = '<i class="fas fa-copy"></i>';
  copyButton.addEventListener('click', function() {
    copyToClipboard(noteText);
  });

  noteElement.appendChild(closeButton);
  noteElement.appendChild(copyButton);
  noteElement.appendChild(noteContent);

  document.getElementById('noteContainer').appendChild(noteElement);
}

function removeNoteElement(noteElement, noteText) {
  noteElement.remove();
  removeNoteFromStorage(noteText);
}

function removeNoteFromStorage(noteText) {
  chrome.storage.sync.get('notes', function(data) {
    var existingNotes = data.notes || '';
    var updatedNotes = existingNotes.split('\n').filter(function(note) {
      return note.trim() !== noteText.trim();
    }).join('\n');
    chrome.storage.sync.set({ 'notes': updatedNotes });
  });
}

function saveNoteToStorage(noteText) {
  chrome.storage.sync.get('notes', function(data) {
    var existingNotes = data.notes || '';
    var updatedNotes = existingNotes + '\n' + noteText;
    chrome.storage.sync.set({ 'notes': updatedNotes });
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(function() {
      showNotification('Note copied to clipboard!');
    })
    .catch(function(err) {
      console.error('Failed to copy note: ', err);
    });
}

function showNotification(message) {
  var notificationElement = document.getElementById('notification');
  notificationElement.textContent = message;
  notificationElement.style.display = 'block';
  setTimeout(function() {
    notificationElement.style.display = 'none';
  }, 2000); // Hide the notification after 2 seconds
}
