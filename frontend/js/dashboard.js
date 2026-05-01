const API = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

function toggleAddForm() {
  const form = document.getElementById('addForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Fetch and display analytics
async function fetchAnalytics() {
  const res = await fetch(`${API}/leads/analytics`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  document.getElementById('total').textContent = data.total;
  document.getElementById('newLeads').textContent = data.newLeads;
  document.getElementById('contacted').textContent = data.contacted;
  document.getElementById('converted').textContent = data.converted;
  document.getElementById('conversionRate').textContent = data.conversionRate + '% rate';
}

// Fetch and display leads
async function fetchLeads() {
  const search = document.getElementById('search').value;
  const status = document.getElementById('statusFilter').value;

  let url = `${API}/leads?`;
  if (search) url += `search=${search}&`;
  if (status) url += `status=${status}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const leads = await res.json();

  const tbody = document.getElementById('leadsBody');
  tbody.innerHTML = '';

  leads.forEach(lead => {
    const initials = lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const avatarColors = {
      new: 'background:#D8D0EE;color:#7B6BAF;',
      contacted: 'background:#F0DFE7;color:#9A5068;',
      converted: 'background:#DFF0DF;color:#4A7A4A;'
    };
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="name-cell">
          <div class="avatar" style="${avatarColors[lead.status]}">${initials}</div>
          ${lead.name}
        </div>
      </td>
      <td>${lead.email}</td>
      <td>${lead.service || '—'}</td>
      <td>${lead.source || '—'}</td>
      <td><span class="badge ${lead.status}">${lead.status}</span></td>
      <td>${new Date(lead.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</td>
      <td><a class="view-link" href="lead-detail.html?id=${lead._id}">View →</a></td>
    `;
    tbody.appendChild(row);
  });
}

// Add a new lead
async function addLead() {
  const lead = {
    name: document.getElementById('newName').value,
    email: document.getElementById('newEmail').value,
    phone: document.getElementById('newPhone').value,
    service: document.getElementById('newService').value,
    source: document.getElementById('newSource').value,
  };

  const res = await fetch(`${API}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(lead)
  });

  if (res.ok) {
    document.getElementById('addForm').style.display = 'none';
    fetchLeads();
    fetchAnalytics();
  }
}

// Load on page start
fetchLeads();
fetchAnalytics();