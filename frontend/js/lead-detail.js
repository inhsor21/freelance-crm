const API = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

const params = new URLSearchParams(window.location.search);
const leadId = params.get('id');

async function fetchLead() {
  const res = await fetch(`${API}/leads/${leadId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const lead = await res.json();

  document.getElementById('leadName').textContent = lead.name;
  document.getElementById('leadEmail').textContent = lead.email;
  document.getElementById('leadPhone').textContent = lead.phone || '—';
  document.getElementById('leadService').textContent = lead.service || '—';
  document.getElementById('leadSource').textContent = lead.source || '—';
  document.getElementById('leadDate').textContent = new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  document.getElementById('statusSelect').value = lead.status;
  document.getElementById('leadStatusBadge').innerHTML = `<span class="badge ${lead.status}">${lead.status}</span>`;

  const notesList = document.getElementById('notesList');
  notesList.innerHTML = '';
  if (lead.notes.length === 0) {
    notesList.innerHTML = '<p style="font-size:13px;color:var(--text3);margin-bottom:1rem;">No notes yet.</p>';
  } else {
    lead.notes.slice().reverse().forEach(note => {
      const div = document.createElement('div');
      div.className = 'note-item';
      div.innerHTML = `
        <p class="note-text">${note.text}</p>
        <p class="note-date">${new Date(note.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      `;
      notesList.appendChild(div);
    });
  }
}

function toggleEdit() {
  const viewMode = document.getElementById('viewMode');
  const editMode = document.getElementById('editMode');
  const editBtn = document.getElementById('editBtn');

  if (editMode.style.display === 'none') {
    document.getElementById('editName').value = document.getElementById('leadName').textContent;
    document.getElementById('editEmail').value = document.getElementById('leadEmail').textContent;
    document.getElementById('editPhone').value = document.getElementById('leadPhone').textContent === '—' ? '' : document.getElementById('leadPhone').textContent;
    document.getElementById('editService').value = document.getElementById('leadService').textContent === '—' ? '' : document.getElementById('leadService').textContent;
    document.getElementById('editSource').value = document.getElementById('leadSource').textContent === '—' ? '' : document.getElementById('leadSource').textContent;

    viewMode.style.display = 'none';
    editMode.style.display = 'block';
    editBtn.textContent = 'Cancel';
  } else {
    viewMode.style.display = 'grid';
    editMode.style.display = 'none';
    editBtn.textContent = 'Edit Lead';
  }
}

async function saveEdit() {
  const updated = {
    name: document.getElementById('editName').value,
    email: document.getElementById('editEmail').value,
    phone: document.getElementById('editPhone').value,
    service: document.getElementById('editService').value,
    source: document.getElementById('editSource').value,
  };

  const res = await fetch(`${API}/leads/${leadId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(updated)
  });

  if (res.ok) {
    document.getElementById('editMsg').textContent = '✦ Lead updated successfully!';
    setTimeout(() => document.getElementById('editMsg').textContent = '', 3000);
    toggleEdit();
    fetchLead();
  }
}

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
    document.getElementById('statusMsg').textContent = '✦ Status updated successfully!';
    setTimeout(() => document.getElementById('statusMsg').textContent = '', 3000);
    fetchLead();
  }
}

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