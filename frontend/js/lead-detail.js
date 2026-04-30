const API = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

// Get lead ID from URL
const params = new URLSearchParams(window.location.search);
const leadId = params.get('id');

// Fetch and display lead details
async function fetchLead() {
  const res = await fetch(`${API}/leads/${leadId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const lead = await res.json();

  document.getElementById('leadName').textContent = lead.name;
  document.getElementById('leadEmail').textContent = lead.email;
  document.getElementById('leadPhone').textContent = lead.phone || '-';
  document.getElementById('leadService').textContent = lead.service || '-';
  document.getElementById('leadSource').textContent = lead.source || '-';
  document.getElementById('leadDate').textContent = new Date(lead.createdAt).toLocaleDateString();
  document.getElementById('statusSelect').value = lead.status;

  // Display notes
  const notesList = document.getElementById('notesList');
  notesList.innerHTML = '';
  if (lead.notes.length === 0) {
    notesList.innerHTML = '<p>No notes yet.</p>';
  } else {
    lead.notes.forEach(note => {
      const div = document.createElement('div');
      div.innerHTML = `<p>📝 ${note.text} <small>(${new Date(note.createdAt).toLocaleDateString()})</small></p>`;
      notesList.appendChild(div);
    });
  }
}

// Update lead status
async function updateStatus() {
  const status = document.getElementById('statusSelect').value;
  const res = await fetch(`${API}/leads/${leadId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ status })
  });

  if (res.ok) {
    document.getElementById('statusMsg').textContent = '✅ Status updated!';
    setTimeout(() => document.getElementById('statusMsg').textContent = '', 3000);
  }
}

// Add a note
async function addNote() {
  const text = document.getElementById('newNote').value;
  if (!text) return;

  const res = await fetch(`${API}/leads/${leadId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ text })
  });

  if (res.ok) {
    document.getElementById('newNote').value = '';
    fetchLead();
  }
}

fetchLead();