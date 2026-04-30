const API = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
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
  document.getElementById('conversionRate').textContent = data.conversionRate;
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
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${lead.name}</td>
      <td>${lead.email}</td>
      <td>${lead.service || '-'}</td>
      <td>${lead.source || '-'}</td>
      <td>${lead.status}</td>
      <td>${new Date(lead.createdAt).toLocaleDateString()}</td>
      <td><a href="lead-detail.html?id=${lead._id}">View</a></td>
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
    fetchLeads();
    fetchAnalytics();
  }
}

// Load on page start
fetchLeads();
fetchAnalytics();