// ============================================================
// PICKLESPOT PH - MAIN APPLICATION
// ============================================================

let allCourts = [...COURTS_DATA];
let filteredCourts = [...COURTS_DATA];
let currentView = 'map';
let sidebarCollapsed = false;
let mainAddCourtMap = null;
let mainAddCourtMarker = null;
let mainAddCourtMapInitialized = false;

// ============================================================
// ADD COURT MAP PICKER
// ============================================================
function initMainAddCourtMap() {
  if (mainAddCourtMapInitialized) {
    setTimeout(() => mainAddCourtMap?.invalidateSize(), 100);
    return;
  }

  const container = document.getElementById('addCourtMap');
  if (!container) return;

  mainAddCourtMap = L.map('addCourtMap', { zoomControl: true }).setView([12.8797, 121.7740], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(mainAddCourtMap);

  mainAddCourtMap.on('click', function (e) {
    placeMainMarker(e.latlng.lat, e.latlng.lng);
  });

  mainAddCourtMapInitialized = true;
  setTimeout(() => mainAddCourtMap.invalidateSize(), 200);
}

function placeMainMarker(lat, lng) {
  document.getElementById('courtLat').value = lat.toFixed(4);
  document.getElementById('courtLng').value = lng.toFixed(4);

  if (mainAddCourtMarker) {
    mainAddCourtMarker.setLatLng([lat, lng]);
  } else {
    mainAddCourtMarker = L.marker([lat, lng], { draggable: true }).addTo(mainAddCourtMap);
    mainAddCourtMarker.on('dragend', function () {
      const pos = mainAddCourtMarker.getLatLng();
      document.getElementById('courtLat').value = pos.lat.toFixed(4);
      document.getElementById('courtLng').value = pos.lng.toFixed(4);
    });
  }

  mainAddCourtMap.setView([lat, lng], Math.max(mainAddCourtMap.getZoom(), 12));
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderMarkers(allCourts);
  renderSidebarList(allCourts);
  updateStats(allCourts);
  setupEventListeners();
  showView('map');
  initCustomerChatWidget();
  loadFirestoreCourts();
});

async function loadFirestoreCourts() {
  try {
    if (typeof PickleCourts === 'undefined') return;
    const firestoreCourts = await PickleCourts.getAll();
    if (!firestoreCourts.length) return;
    for (const fc of firestoreCourts) {
      if (!allCourts.find(c => c.id === fc.id)) {
        allCourts.push(fc);
      }
    }
    filteredCourts = [...allCourts];
    renderMarkers(allCourts);
    renderSidebarList(allCourts);
    updateStats(allCourts);
  } catch {}
}

// ============================================================
// VIEW MANAGEMENT
// ============================================================
function showView(view) {
  currentView = view;

  const mapContainer = document.querySelector('.app-container');
  const listView = document.getElementById('listView');
  const aboutView = document.getElementById('aboutView');
  const footer = document.getElementById('siteFooter');

  // Hide all
  mapContainer.style.display = 'none';
  listView.style.display = 'none';
  aboutView.style.display = 'none';
  footer.style.display = 'none';

  // Update nav active state
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.view === view) link.classList.add('active');
  });

  switch (view) {
    case 'map':
      mapContainer.style.display = 'flex';
      setTimeout(() => map.invalidateSize(), 100);
      break;
    case 'list':
      listView.style.display = 'block';
      footer.style.display = 'block';
      renderCourtsList(filteredCourts);
      break;
    case 'about':
      aboutView.style.display = 'block';
      footer.style.display = 'block';
      break;
  }
}

// ============================================================
// SIDEBAR
// ============================================================
function renderSidebarList(courts) {
  const container = document.getElementById('sidebarCourtList');
  document.getElementById('resultsCount').textContent = courts.length;

  if (courts.length === 0) {
    container.innerHTML = `
      <div style="padding:24px;text-align:center;color:#999">
        <i class="fas fa-search" style="font-size:32px;margin-bottom:12px;display:block"></i>
        <p>No courts found.<br>Try adjusting your filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = courts.map(court => `
    <div class="sidebar-court-item" data-id="${court.id}"
         onclick="handleSidebarCourtClick('${court.id}')">
      <div class="court-item-name">
        ${court.name}
        ${court.verified ? '<i class="fas fa-check-circle" style="color:var(--primary);font-size:12px" title="Verified"></i>' : ''}
        ${court.featured ? '<span style="font-size:9px;background:var(--accent);color:white;padding:1px 6px;border-radius:8px;margin-left:4px">★</span>' : ''}
      </div>
      <div class="court-item-location">
        <i class="fas fa-map-marker-alt" style="font-size:10px"></i>
        ${court.city}, ${court.region}
      </div>
      <div class="court-item-tags">
        <span class="tag tag-${court.type.toLowerCase()}">${court.type}</span>
        <span class="tag ${
          court.access === 'Free' ? 'tag-free' :
          court.access === 'Paid' ? 'tag-paid' : 'tag-members'
        }">
          ${court.access}
        </span>
        <span class="tag" style="background:#f5f5f5;color:#555">
          ${court.courts} court${court.courts > 1 ? 's' : ''}
        </span>
        ${court.rate ? `
        <span class="tag" style="background:#fff3e0;color:#e65100;border:1px solid #ffe0b2">
          ${court.rate}
        </span>` : ''}
      </div>
    </div>
  `).join('');
}

function handleSidebarCourtClick(courtId) {
  flyToMarker(courtId);
  highlightSidebarItem(courtId);
}

// ============================================================
// COURTS LIST VIEW
// ============================================================
function renderCourtsList(courts) {
  const container = document.getElementById('courtsGrid');
  const countEl = document.getElementById('listCourtCount');
  if (countEl) countEl.textContent = courts.length;

  if (courts.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;padding:48px;text-align:center;color:#999">
        <i class="fas fa-search" style="font-size:48px;margin-bottom:16px;display:block"></i>
        <h3>No courts found</h3>
        <p>Try a different search term</p>
      </div>
    `;
    return;
  }

  container.innerHTML = courts.map((court, idx) => {
    const amenityBadges = court.amenities.map(a => {
      const info = AMENITY_ICONS[a];
      return info ? `
        <span class="amenity-badge">
          <i class="fas ${info.icon}"></i> ${info.label}
        </span>
      ` : '';
    }).join('');

    const accessClass =
      court.access === 'Free' ? 'tag-free' :
      court.access === 'Paid' ? 'tag-paid' : 'tag-members';

    return `
      <div class="court-card" onclick="openCourtModal('${court.id}')">
        <div class="court-card-header">
          <div class="court-number">${String(idx + 1).padStart(2, '0')}</div>
          <div class="court-card-name">
            ${court.name}
            ${court.verified ? '<i class="fas fa-check-circle" style="color:#FFD700;font-size:14px" title="Verified"></i>' : ''}
          </div>
          ${court.featured ? '<div style="position:absolute;top:12px;left:12px;background:var(--accent);color:white;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">★ Featured</div>' : ''}
          <div class="court-card-location">
            <i class="fas fa-map-marker-alt" style="font-size:11px"></i>
            ${court.city}, ${court.province}
          </div>
        </div>
        <div class="court-card-body">
          <div class="court-detail-row">
            <i class="fas fa-table-tennis-paddle-ball"></i>
            <span>${court.courts} Pickleball Court${court.courts > 1 ? 's' : ''}</span>
          </div>
          ${court.rate ? `
          <div class="court-detail-row">
            <i class="fas fa-tag"></i>
            <span>${court.rate}</span>
          </div>` : ''}
          <div class="court-detail-row">
            <i class="fas fa-clock"></i>
            <span>${court.hours}</span>
          </div>
          ${court.contact ? `
          <div class="court-detail-row">
            <i class="fas fa-phone"></i>
            <span>${court.contact}</span>
          </div>
          ` : ''}
          <div class="court-card-tags">
            <span class="tag tag-${court.type.toLowerCase()}">${court.type}</span>
            <span class="tag ${accessClass}">${court.access}</span>
            ${court.verified
              ? '<span class="tag" style="background:#e3f2fd;color:#1565c0">✓ Verified</span>'
              : ''}
          </div>
          ${court.amenities.length > 0 ? `
          <div class="court-amenities">${amenityBadges}</div>
          ` : ''}
          ${court.photos && court.photos.length > 0 ? `
          <div style="display:flex;gap:4px;margin-top:8px">
            ${court.photos.slice(0, 3).map(url => `
              <img src="${url}" alt="" style="width:60px;height:50px;object-fit:cover;border-radius:4px"/>
            `).join('')}
            ${court.photos.length > 3 ? `<span style="font-size:11px;color:var(--text-muted);display:flex;align-items:center">+${court.photos.length - 3}</span>` : ''}
          </div>` : ''}
        </div>
        <div class="court-card-footer">
          <button class="btn-view-map"
            onclick="event.stopPropagation(); viewOnMap(${court.id})">
            <i class="fas fa-map-marked-alt"></i> View on Map
          </button>
          <button class="btn-directions"
            onclick="event.stopPropagation(); openDirections(${court.lat}, ${court.lng})">
            <i class="fas fa-directions"></i> Directions
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// COURT MODAL
// ============================================================
window.openCourtModal = function(courtId) {
  const court = allCourts.find(c => c.id == courtId);
  if (!court) return;

  const modal = document.getElementById('courtModal');
  const header = document.getElementById('modalHeader');
  const body = document.getElementById('modalBody');
  const footer = document.getElementById('modalFooter');

  const accessClass =
    court.access === 'Free' ? 'tag-free' :
    court.access === 'Paid' ? 'tag-paid' : 'tag-members';

  header.innerHTML = `
    <div style="padding:24px">
      <div style="display:flex;align-items:flex-start;gap:12px">
        <div style="background:rgba(255,255,255,0.2);border-radius:10px;
                    padding:10px;font-size:24px">
          ${court.type === 'Indoor' ? '🏢' : court.type === 'Covered' ? '🏗️' : '🌿'}
        </div>
        <div>
          <h2 style="font-size:18px;font-weight:700;color:white;margin-bottom:4px">
            ${court.name}
            ${court.verified ? '<i class="fas fa-check-circle" style="color:#FFD700;font-size:16px" title="Verified"></i>' : ''}
            ${court.featured ? '<span style="font-size:12px;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:10px;margin-left:4px">★ Featured</span>' : ''}
          </h2>
          <p style="font-size:13px;color:rgba(255,255,255,0.85)">
            <i class="fas fa-map-marker-alt"></i>
            ${court.city}, ${court.province} · ${court.region}
          </p>
          <div style="display:flex;gap:6px;margin-top:8px">
            <span class="tag tag-${court.type.toLowerCase()}">${court.type}</span>
            <span class="tag ${accessClass}">${court.access}</span>
            ${court.verified
              ? '<span class="tag" style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.4)">✓ Verified</span>'
              : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  const photosHtml = court.photos && court.photos.length > 0 ? `
    <div class="court-detail-section">
      <h3>Photos</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">
        ${court.photos.map(url => `
          <img src="${url}" alt="Court photo" style="width:100%;height:120px;object-fit:cover;border-radius:8px;cursor:pointer" onclick="window.open('${url}','_blank')"/>
        `).join('')}
      </div>
    </div>
  ` : '';

  const amenityChips = court.amenities.map(a => {
    const info = AMENITY_ICONS[a];
    return info ? `
      <span class="amenity-chip">
        <i class="fas ${info.icon}"></i> ${info.label}
      </span>
    ` : '';
  }).join('');

  body.innerHTML = `
    <div class="court-detail-section">
      <h3>Court Information</h3>
      <div class="detail-item">
        <i class="fas fa-table-tennis-paddle-ball"></i>
        <span><strong>${court.courts}</strong> Pickleball Court${court.courts > 1 ? 's' : ''}</span>
      </div>
      <div class="detail-item">
        <i class="fas fa-building"></i>
        <span>${court.type} Court</span>
      </div>
      <div class="detail-item">
        <i class="fas fa-lock-open"></i>
        <span>Access: ${court.access}</span>
      </div>
      ${court.rate ? `
      <div class="detail-item">
        <i class="fas fa-tag"></i>
        <span>Rate: ${court.rate}</span>
      </div>` : ''}
    </div>

    <div class="court-detail-section">
      <h3>Location & Schedule</h3>
      <div class="detail-item">
        <i class="fas fa-location-dot"></i>
        <span>${court.address}</span>
      </div>
      <div class="detail-item">
        <i class="fas fa-clock"></i>
        <span>${court.hours}</span>
      </div>
      ${court.contact ? `
      <div class="detail-item">
        <i class="fas fa-phone"></i>
        <span>${court.contact}</span>
      </div>
      ` : ''}
    </div>

    ${court.amenities.length > 0 ? `
    <div class="court-detail-section">
      <h3>Amenities</h3>
      <div class="amenities-list">${amenityChips}</div>
    </div>
    ` : ''}

    ${photosHtml}

    ${court.notes ? `
    <div class="court-detail-section">
      <h3>Notes</h3>
      <p style="font-size:13px;color:#555;line-height:1.6">${court.notes}</p>
    </div>
    ` : ''}

    <div class="court-detail-section" style="margin-bottom:0">
      <p style="font-size:11px;color:#999">
        Added on PickleSpot PH:
        ${new Date(court.dateAdded).toLocaleDateString('en-PH', {
          year: 'numeric', month: 'long', day: 'numeric'
        })}
      </p>
    </div>
  `;

  footer.innerHTML = `
    <div class="modal-action-btns">
      <button class="btn-modal-map" onclick="viewOnMap('${court.id}')">
        <i class="fas fa-map-marked-alt"></i> View on Map
      </button>
      ${court.lat && court.lng ? `
      <button class="btn-modal-directions"
        onclick="openDirections(${court.lat}, ${court.lng})">
        <i class="fas fa-directions"></i> Get Directions
      </button>
      ` : ''}
    </div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn-submit" style="flex:1" onclick="openBookingModal('${court.id}')">
        <i class="fas fa-calendar-check"></i> Book / Inquire
      </button>
      <button class="btn-submit" style="flex:1;background:var(--accent)" onclick="openReviewModal('${court.id}')">
        <i class="fas fa-star"></i> Write Review
      </button>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

function viewOnMap(courtId) {
  closeModal('courtModal');
  showView('map');
  setTimeout(() => {
    flyToMarker(courtId);
    highlightSidebarItem(courtId);
  }, 400);
}

function openDirections(lat, lng) {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    '_blank'
  );
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  document.body.style.overflow = '';
}

// ============================================================
// BOOKING MODAL
// ============================================================
let bookingCourtId = null;

window.openBookingModal = function(courtId) {
  const court = allCourts.find(c => c.id == courtId);
  if (!court) return;
  bookingCourtId = courtId;
  document.getElementById('bookingCourtName').textContent = `Send a booking request to ${court.name}`;
  document.getElementById('bookingModal').style.display = 'flex';
  document.getElementById('bookingForm').reset();
  document.getElementById('slotPickerGroup').style.display = 'none';
};

// Load available time slots when date changes
const bookingDateInput = document.getElementById('bookingDate');
bookingDateInput.addEventListener('change', loadAvailableSlots);
bookingDateInput.addEventListener('blur', loadAvailableSlots);
bookingDateInput.addEventListener('input', loadAvailableSlots);

async function loadAvailableSlots() {
  const dateVal = document.getElementById('bookingDate').value;
  const slotGroup = document.getElementById('slotPickerGroup');
  const slotGrid = document.getElementById('slotGrid');
  const slotStatus = document.getElementById('slotStatus');

  if (!dateVal || !bookingCourtId) {
    slotGrid.innerHTML = '';
    if (slotStatus) slotStatus.textContent = 'Select a date to see available times';
    return;
  }

  const court = allCourts.find(c => c.id === bookingCourtId);
  if (!court) {
    slotGrid.innerHTML = '';
    if (slotStatus) slotStatus.textContent = 'Court not found';
    return;
  }

  // Check court availability (default to 6AM-10PM if not set)
  let dayAvail;
  if (court.availability) {
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(dateVal).getDay()];
    dayAvail = court.availability[dayName];
  }

  if (!dayAvail || !dayAvail.enabled) {
    dayAvail = { start: '06:00', end: '22:00' };
  }

  // Generate 1-hour slots
  const slots = [];
  const [startH, startM] = dayAvail.start.split(':').map(Number);
  const [endH, endM] = dayAvail.end.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let m = startMinutes; m + 60 <= endMinutes; m += 60) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(
      `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    );
  }

  if (slotStatus) slotStatus.textContent = '';

  if (slots.length === 0) {
    slotGrid.innerHTML = '<p style="font-size:12px;color:var(--text-muted);grid-column:1/-1">No available slots for this day.</p>';
    return;
  }

  // Check for already-booked (confirmed) slots
  let taken = new Set();
  try {
    if (typeof PickleBookings !== 'undefined') {
      const existing = await PickleBookings.getByCourt(bookingCourtId);
      taken = new Set(
        existing.filter(b => b.status === 'confirmed' && b.date === dateVal).map(b => b.time)
      );
    }
  } catch {}

  slotGrid.innerHTML = slots.map(s => `
    <div class="slot-btn ${taken.has(s) ? 'taken' : ''}" data-slot="${s}" onclick="${taken.has(s) ? '' : `selectSlot('${s}')`}">
      ${s}
    </div>
  `).join('');
}

window.selectSlot = function(slot) {
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.slot-btn[data-slot="${slot}"]`).classList.add('selected');
  document.getElementById('bookingTime').value = slot;
};

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!bookingCourtId) return;

  const court = allCourts.find(c => c.id === bookingCourtId);
  if (!court) return;

  const customerName = document.getElementById('bookingName').value;
  const customerContact = document.getElementById('bookingContact').value;
  const customerEmail = document.getElementById('bookingEmail').value;

  const bookingDate = document.getElementById('bookingDate').value;
  const bookingTime = document.getElementById('bookingTime').value;

  const bookingData = {
    courtId: bookingCourtId,
    name: customerName,
    contact: customerContact,
    email: customerEmail,
    date: bookingDate,
    time: bookingTime,
    players: document.getElementById('bookingPlayers').value,
    message: document.getElementById('bookingMessage').value,
    status: 'pending'
  };

  // Double-booking check: look for confirmed bookings on same court + date + time
  if (bookingDate && typeof PickleBookings !== 'undefined') {
    try {
      const existing = await PickleBookings.getByCourt(bookingCourtId);
      const conflict = existing.find(b =>
        b.status === 'confirmed' &&
        b.date === bookingDate &&
        b.time === bookingTime
      );
      if (conflict) {
        showToast('⚠️ This time slot is already booked. Please choose a different date or time.', 5000);
        return;
      }
    } catch {}
  }

  let chatId = null;

  try {
    if (typeof PickleChat !== 'undefined') {
      // Create chat room
      chatId = await PickleChat.createRoom({
        courtId: bookingCourtId,
        courtName: court.name,
        ownerId: court.ownerId || 'unknown',
        customerName,
        customerContact,
        customerEmail,
        lastMessage: bookingData.message || 'Inquiry sent',
        lastSender: customerName
      });

      // Send the first message
      if (bookingData.message) {
        await PickleChat.sendMessage(chatId, 'customer', customerName, bookingData.message);
      }

      // Create booking with chat reference
      bookingData.chatId = chatId;
      await PickleBookings.create(bookingData);
    }
  } catch {}

  // Store chat access in localStorage for the customer
  if (chatId) {
    const chats = JSON.parse(localStorage.getItem('psp_chats') || '[]');
    if (!chats.find(c => c.id == chatId)) {
      chats.push({ id: chatId, name: court.name, customerName, customerContact });
      localStorage.setItem('psp_chats', JSON.stringify(chats));
    }
    // Show chat widget immediately
    document.getElementById('customerChatWidget').style.display = 'block';
    renderChatThreadsList();
  }

  // Notify the court owner via email
  try {
    if (typeof PickleNotifications !== 'undefined' && court.ownerId) {
      await PickleNotifications.notifyOwnerNewBooking(court.ownerId, bookingData, court.name);
    }
  } catch {}

  showToast('✅ Inquiry sent! Check your Messages below to chat with the owner.');
  document.getElementById('bookingForm').reset();
  closeModal('bookingModal');
});

document.getElementById('bookingCancelBtn').addEventListener('click', () => closeModal('bookingModal'));
document.getElementById('bookingModalClose').addEventListener('click', () => closeModal('bookingModal'));

// ============================================================
// REVIEW MODAL
// ============================================================
let reviewCourtId = null;
let selectedRating = 0;

window.openReviewModal = function(courtId) {
  const court = allCourts.find(c => c.id == courtId);
  if (!court) return;
  reviewCourtId = courtId;
  selectedRating = 0;
  document.getElementById('reviewCourtName').textContent = court.name;
  document.getElementById('reviewForm').reset();
  updateStarDisplay();
  document.getElementById('reviewModal').style.display = 'flex';
};

function updateStarDisplay() {
  const stars = document.querySelectorAll('#starRating span');
  stars.forEach(span => {
    const val = parseInt(span.dataset.star);
    span.textContent = val <= selectedRating ? '★' : '☆';
  });
}

document.getElementById('starRating').addEventListener('click', (e) => {
  if (e.target.dataset.star) {
    selectedRating = parseInt(e.target.dataset.star);
    updateStarDisplay();
  }
});

document.getElementById('reviewForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!reviewCourtId || selectedRating === 0) {
    showToast('Please select a rating.');
    return;
  }

  const reviewData = {
    courtId: reviewCourtId,
    rating: selectedRating,
    userName: document.getElementById('reviewName').value || 'Anonymous',
    comment: document.getElementById('reviewComment').value
  };

  try {
    if (typeof PickleReviews !== 'undefined') {
      await PickleReviews.add(reviewData);
    }
  } catch {}

  showToast('⭐ Review submitted! Salamat!');
  document.getElementById('reviewForm').reset();
  closeModal('reviewModal');
});

document.getElementById('reviewCancelBtn').addEventListener('click', () => closeModal('reviewModal'));
document.getElementById('reviewModalClose').addEventListener('click', () => closeModal('reviewModal'));

// ============================================================
// FILTERS
// ============================================================
function getActiveFilters() {
  const search = document.getElementById('searchInput').value.trim();
  const region = document.getElementById('regionFilter').value;

  const types = [...document.querySelectorAll('.type-filter:checked')]
    .map(cb => cb.value);
  const access = [...document.querySelectorAll('.access-filter:checked')]
    .map(cb => cb.value);
  const amenities = [...document.querySelectorAll('.amenity-filter:checked')]
    .map(cb => cb.value);

  return { search, region, types, access, amenities };
}

function applyFilters() {
  const filters = getActiveFilters();
  filteredCourts = filterCourts(allCourts, filters);
  renderMarkers(filteredCourts);
  renderSidebarList(filteredCourts);

  if (currentView === 'list') {
    const sortBy = document.getElementById('sortSelect')?.value || 'name';
    renderCourtsList(sortCourts(filteredCourts, sortBy));
  }
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('regionFilter').value = '';
  document.getElementById('clearSearch').style.display = 'none';

  document.querySelectorAll('.type-filter, .access-filter')
    .forEach(cb => { cb.checked = true; });
  document.querySelectorAll('.amenity-filter')
    .forEach(cb => { cb.checked = false; });

  applyFilters();
  showToast('✅ Filters reset');
}

// ============================================================
// STATS
// ============================================================
function updateStats(courts) {
  document.getElementById('totalCourts').textContent = courts.length;
  document.getElementById('totalCities').textContent =
    getUniqueCities(courts).length;
  document.getElementById('totalRegions').textContent =
    getUniqueRegions(courts).length;

  // Hero stats
  const heroCourts = document.getElementById('statCourts');
  if (heroCourts) heroCourts.textContent = courts.length;
}

// ============================================================
// ADD COURT FORM
// ============================================================
function submitCourtForm(e) {
  e.preventDefault();

  const amenities = [...document.querySelectorAll('.court-amenity:checked')]
    .map(cb => cb.value);

  const newCourt = {
    id: allCourts.length + 1,
    name: document.getElementById('courtName').value,
    city: document.getElementById('courtCity').value,
    province: document.getElementById('courtRegion').value,
    region: document.getElementById('courtRegion').value,
    type: document.getElementById('courtType').value,
    access: document.getElementById('courtAccess').value,
    rate: document.getElementById('courtRate').value,
    courts: parseInt(document.getElementById('courtCount').value) || 1,
    address: document.getElementById('courtAddress').value,
    hours: document.getElementById('courtHours').value,
    contact: document.getElementById('courtContact').value,
    lat: parseFloat(document.getElementById('courtLat').value) || null,
    lng: parseFloat(document.getElementById('courtLng').value) || null,
    amenities,
    notes: document.getElementById('courtNotes').value,
    verified: false,
    dateAdded: new Date().toISOString().split('T')[0]
  };

  allCourts.push(newCourt);
  filteredCourts = [...allCourts];

  renderMarkers(filteredCourts);
  renderSidebarList(filteredCourts);
  updateStats(allCourts);

  if (newCourt.lat && newCourt.lng) {
    flyToMarker(newCourt.id);
  }

  closeModal('addCourtModal');
  document.getElementById('addCourtForm').reset();
  showToast('🎉 Court added to PickleSpot PH! Salamat! 🇵🇭');
}

// ============================================================
// TOAST
// ============================================================
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function setupEventListeners() {
  // Nav links
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    if (link.dataset.view) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showView(link.dataset.view);
        document.getElementById('mobileMenu').classList.remove('open');
      });
    }
  });

  // Hamburger menu
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('open');
  });

  // Sidebar search
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');

  searchInput.addEventListener('input', () => {
    clearSearch.style.display = searchInput.value ? 'block' : 'none';
    applyFilters();
  });

  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.style.display = 'none';
    applyFilters();
  });

  // Filters
  document.getElementById('regionFilter').addEventListener('change', applyFilters);
  document.querySelectorAll('.type-filter, .access-filter, .amenity-filter')
    .forEach(cb => cb.addEventListener('change', applyFilters));
  document.getElementById('resetFilters').addEventListener('click', resetFilters);

  // Map buttons
  document.getElementById('locateMe').addEventListener('click', locateUser);
  document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);
  document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);

  // Add court
  document.getElementById('addCourtBtn').addEventListener('click', openAddCourtModal);
  document.getElementById('heroAddBtn').addEventListener('click', openAddCourtModal);

  function openAddCourtModal() {
    document.getElementById('addCourtModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    initMainAddCourtMap();
  }

  document.getElementById('mobileAddCourt').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('addCourtModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('mobileMenu').classList.remove('open');
    initMainAddCourtMap();
  });

  // Close modals
  document.getElementById('modalClose')
    .addEventListener('click', () => closeModal('courtModal'));
  document.getElementById('addModalClose')
    .addEventListener('click', () => closeModal('addCourtModal'));
  document.getElementById('cancelAdd')
    .addEventListener('click', () => closeModal('addCourtModal'));

  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Form submit
  document.getElementById('addCourtForm')
    .addEventListener('submit', submitCourtForm);

  // List search
  document.getElementById('listSearchInput')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = allCourts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.province.toLowerCase().includes(q)
    );
    renderCourtsList(filtered);
  });

  // Sort
  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    renderCourtsList(sortCourts(filteredCourts, e.target.value));
  });

  // ESC key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay')
        .forEach(m => { m.style.display = 'none'; });
      document.body.style.overflow = '';
    }
  });
}

// ============================================================
// SIDEBAR TOGGLE
// ============================================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebarCollapsed = !sidebarCollapsed;

  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('mobile-open', !sidebarCollapsed);
  } else {
    sidebar.classList.toggle('collapsed', sidebarCollapsed);
    setTimeout(() => map.invalidateSize(), 350);
  }
}

// ============================================================
// CUSTOMER CHAT WIDGET
// ============================================================
let customerChatId = null;
let customerChatUnsub = null;

function initCustomerChatWidget() {
  const stored = JSON.parse(localStorage.getItem('psp_chats') || '[]');
  if (stored.length === 0) return;

  document.getElementById('customerChatWidget').style.display = 'block';
  renderChatThreadsList();
}

function renderChatThreadsList() {
  const stored = JSON.parse(localStorage.getItem('psp_chats') || '[]');
  const container = document.getElementById('chatThreadsList');
  if (!container) return;

  container.style.display = '';
  container.style.flexDirection = '';
  container.style.gap = '';

  if (stored.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">No conversations</div>';
    return;
  }

  container.innerHTML = stored.map(c => `
    <div class="cht-thread" onclick="openCustomerChat('${c.id}')">
      <div class="cht-name">${c.name}</div>
      <div class="cht-preview">${c.customerName} · ${c.customerContact}</div>
    </div>
  `).join('');
}

window.openCustomerChat = async function(chatId) {
  customerChatId = chatId;

  const threadsEl = document.getElementById('chatThreadsList');
  if (threadsEl) threadsEl.innerHTML = '';
  document.getElementById('chatPopupInputArea').style.display = 'flex';

  // Get chat info
  const stored = JSON.parse(localStorage.getItem('psp_chats') || '[]');
  const chat = stored.find(c => c.id === chatId);
  document.getElementById('chatPopupTitle').textContent = chat ? chat.name : 'Chat';

  // Listen to messages
  if (customerChatUnsub) customerChatUnsub();
  customerChatUnsub = PickleChat.onMessages(chatId, (msgs) => {
    renderCustomerMessages(msgs);
    // Mark as read by customer
    PickleChat.markCustomerRead(chatId);
  });
};

function renderCustomerMessages(msgs) {
  const container = document.getElementById('chatThreadsList');
  if (!container) return;

  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '8px';
  container.innerHTML = msgs.map(m => {
    const isCustomer = m.senderId === 'customer';
    const time = m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return `
      <div class="cmsg ${isCustomer ? 'customer' : 'owner'}">
        ${m.text}
        <div class="ctime">${m.senderName} · ${time}</div>
      </div>
    `;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

document.getElementById('chatPopupSend').addEventListener('click', sendCustomerMessage);
document.getElementById('chatPopupInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendCustomerMessage();
});

async function sendCustomerMessage() {
  const input = document.getElementById('chatPopupInput');
  const text = input.value.trim();
  if (!text || !customerChatId) return;

  input.value = '';
  try {
    await PickleChat.sendMessage(customerChatId, 'customer', 'You', text);
    // Notify the owner via email
    try {
      if (typeof PickleNotifications !== 'undefined') {
        PickleNotifications.notifyOwnerNewMessage(customerChatId, 'You', text);
      }
    } catch {}
  } catch (err) {
    showToast('Error sending message');
  }
}

// Chat widget UI controls
document.getElementById('chatWidgetBtn').addEventListener('click', () => {
  const popup = document.getElementById('chatPopup');
  if (popup.style.display === 'flex') {
    popup.style.display = 'none';
  } else {
    popup.style.display = 'flex';
    renderChatThreadsList();
    document.getElementById('chatPopupInputArea').style.display = 'none';
    document.getElementById('chatPopupTitle').textContent = 'Messages';
  }
});

document.getElementById('chatPopupClose').addEventListener('click', () => {
  document.getElementById('chatPopup').style.display = 'none';
  if (customerChatUnsub) { customerChatUnsub(); customerChatUnsub = null; }
  customerChatId = null;
});