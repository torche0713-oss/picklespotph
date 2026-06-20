// ============================================================
// PICKLESPOT PH - OWNER DASHBOARD
// ============================================================

const ADMIN_EMAIL = 'torche0713@gmail.com';
let currentUser = null;
let userProfile = null;
let editingCourtId = null;
let addCourtMap = null;
let addCourtMarker = null;
let addCourtMapInitialized = false;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  let authFired = false;

  // Fallback: if Firebase Auth never fires, force login modal
  const fbTimeout = setTimeout(() => {
    if (!authFired) {
      showLoginModal();
    }
  }, 3000);

  // Handle redirect auth result (Google/Facebook sign-in)
  if (typeof PickleAuth !== 'undefined') {
    PickleAuth.handleRedirectResult().catch(() => {});
  }

  const wantsAdd = new URLSearchParams(window.location.search).get('add') === '1';
  if (wantsAdd) {
    history.replaceState(null, '', window.location.pathname);
  }

  if (typeof PickleAuth !== 'undefined') {
    PickleAuth.onAuthChanged(async (user) => {
      authFired = true;
      clearTimeout(fbTimeout);
      if (user) {
        currentUser = user;
        userProfile = await PickleAuth.getUserProfile(user.uid).catch(() => null);
        renderDashboard();
        if (wantsAdd) {
          switchSection('add-court');
          showToast('You\'re logged in! Add your court below.', 3000);
        }
      } else {
        showLoginModal();
      }
    });
  } else {
    // Firebase not loaded — show login modal immediately
    showLoginModal();
  }

  setupEventListeners();
});

// ============================================================
// RENDER DASHBOARD
// ============================================================
function renderDashboard() {
  document.getElementById('dashUserName').textContent = userProfile?.displayName || 'Owner';
  document.getElementById('dashUserEmail').textContent = currentUser.email;

  const badge = document.getElementById('dashPlanBadge');
  if (userProfile?.plan === 'pro') {
    badge.textContent = 'Pro';
    badge.className = 'plan-badge plan-pro';
  } else {
    badge.textContent = 'Basic';
    badge.className = 'plan-badge plan-basic';
  }

  loadMyCourts();
  loadReviews();
  initChat();

  const isPro = userProfile?.plan === 'pro';
  const isAdmin = currentUser.email === ADMIN_EMAIL;
  document.querySelector('[data-section="bookings"]').style.display = isPro ? 'flex' : 'none';
  document.querySelector('[data-section="owner-courts"]').style.display = isAdmin ? 'flex' : 'none';
  document.querySelector('[data-section="schedules"]').style.display = isPro ? 'flex' : 'none';
  document.querySelector('[data-section="tournaments"]').style.display = (isPro || isAdmin) ? 'flex' : 'none';
  document.querySelector('[data-section="claims"]').style.display = isAdmin ? 'flex' : 'none';
  document.getElementById('dashUnclaimedGroup').style.display = isAdmin ? 'block' : 'none';
  document.querySelector('[data-section="payments"]').style.display = isAdmin ? 'flex' : 'none';
  document.querySelector('[data-section="admin-analytics"]').style.display = isAdmin ? 'flex' : 'none';
  document.querySelector('[data-section="analytics"]').style.display = isPro ? 'flex' : 'none';
  if (isPro) loadBookings();
}

// ============================================================
// NAVIGATION
// ============================================================
function switchSection(sectionId) {
  if ((sectionId === 'payments' || sectionId === 'admin-analytics' || sectionId === 'owner-courts' || sectionId === 'tournaments' || sectionId === 'claims') && currentUser.email !== ADMIN_EMAIL) {
    showToast('Access denied.');
    return;
  }
  document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.dash-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`section-${sectionId}`).classList.add('active');
  document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

  if (sectionId === 'availability') loadAvailabilitySection();
  if (sectionId === 'mailing') loadMailingList();
  if (sectionId === 'add-court') initAddCourtMap();
  if (sectionId === 'payments') loadPayments();
  if (sectionId === 'admin-analytics') loadAdminAnalytics();
  if (sectionId === 'owner-courts') loadOwnerCourts();
  if (sectionId === 'schedules') loadSchedules();
  if (sectionId === 'tournaments') loadTournaments();
  if (sectionId === 'claims') loadClaims();
  if (sectionId === 'analytics') loadAnalytics();
}

// ============================================================
// MY COURTS
// ============================================================
async function loadMyCourts() {
  const container = document.getElementById('myCourtsList');
  container.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';

  try {
    const courts = await PickleCourts.getByOwner(currentUser.uid);
    if (courts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-map-pin"></i>
          <h3>No courts yet</h3>
          <p>Add your first court listing to get started!</p>
          <button class="btn-dash btn-dash-primary" onclick="switchSection('add-court')" style="margin-top:16px">
            <i class="fas fa-plus"></i> Add Your First Court
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = courts.map(court => `
      <div class="court-card-owner">
        <div class="card-header">
          <div>
            <h3>${court.name} ${court.verified ? '<i class="fas fa-check-circle" style="color:#1565c0" title="Verified"></i>' : ''} ${court.featured ? '<span class="status-badge" style="background:#fff3e0;color:#e65100">★ Featured</span>' : ''}</h3>
            <span style="font-size:12px;color:var(--text-muted)">${court.city}, ${court.region}</span>
          </div>
          <div>
            <span class="status-badge status-approved">Approved</span>
          </div>
        </div>
        <div class="card-body" style="font-size:13px;color:var(--text-muted)">
          <div style="display:flex;gap:16px;flex-wrap:wrap">
            <span>🏓 ${court.courts || 1} court(s)</span>
            <span>📋 ${court.type}</span>
            <span>🔑 ${court.access}</span>
            ${court.rate ? `<span>💰 ${court.rate}</span>` : ''}
          </div>
          ${court.photos && court.photos.length > 0 ? `
          <div class="photo-grid">
            ${court.photos.slice(0, 3).map(url => `<img src="${url}" alt=""/>`).join('')}
            ${court.photos.length > 3 ? `<div style="display:flex;align-items:center;justify-content:center;background:#f5f5f5;border-radius:8px;height:120px;font-size:13px;color:var(--text-muted)">+${court.photos.length - 3} more</div>` : ''}
          </div>` : ''}
        </div>
        <div class="card-actions">
          <button class="btn-dash btn-dash-primary" onclick="openEditCourt('${court.id}')">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn-dash btn-dash-outline" onclick="openPhotoManager('${court.id}')">
            <i class="fas fa-images"></i> Photos (${court.photos?.length || 0})
          </button>
          ${userProfile?.plan === 'pro' ? `
          <button class="btn-dash btn-dash-accent" onclick="toggleFeatured('${court.id}', ${court.featured})">
            <i class="fas fa-star"></i> ${court.featured ? 'Unfeature' : 'Feature'}
          </button>` : ''}
          <button class="btn-dash btn-dash-danger" onclick="deleteCourt('${court.id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:#d32f2f">Error loading courts: ${err.message}</p>`;
  }
}

// ============================================================
// ADD COURT
// ============================================================
document.getElementById('dashAddCourtForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const amenities = [...document.querySelectorAll('.dash-amenity:checked')].map(cb => cb.value);

  const courtData = {
    name: document.getElementById('dashCourtName').value,
    city: document.getElementById('dashCourtCity').value,
    province: document.getElementById('dashCourtProvince').value,
    region: document.getElementById('dashCourtRegion').value,
    featured: userProfile?.plan === 'pro',
    type: document.getElementById('dashCourtType').value,
    access: document.getElementById('dashCourtAccess').value,
    rate: document.getElementById('dashCourtRate').value,
    courts: parseInt(document.getElementById('dashCourtCount').value) || 1,
    contact: document.getElementById('dashCourtContact').value,
    address: document.getElementById('dashCourtAddress').value,
    hours: document.getElementById('dashCourtHours').value,
    lat: parseFloat(document.getElementById('dashCourtLat').value) || null,
    lng: parseFloat(document.getElementById('dashCourtLng').value) || null,
    amenities
  };

  const isUnclaimed = document.getElementById('dashUnclaimedCheck').checked;

  try {
    const ownerId = isUnclaimed ? null : currentUser.uid;
    await PickleCourts.add(courtData, ownerId);
    showToast(isUnclaimed ? 'Court listed as unclaimed — owners can now claim it!' : 'Thank you! Your court has been added and is now live! 🎉');
    e.target.reset();
    document.getElementById('dashCourtProvinceGroup').style.display = 'none';
    document.getElementById('dashCourtCityGroup').style.display = 'none';
    document.getElementById('dashUnclaimedCheck').checked = false;
    loadMyCourts();
    switchSection('my-courts');
    try {
      if (!isUnclaimed) await PickleNotifications.notifyOwnerCourtAdded(currentUser.email, userProfile?.displayName, courtData.name);
      await PickleNotifications.notifyAdminNewCourt(courtData, userProfile);
    } catch {}
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
});

// ============================================================
// EDIT COURT
// ============================================================
async function openEditCourt(courtId) {
  const court = await PickleCourts.getById(courtId);
  if (!court) return;

  editingCourtId = courtId;
  document.getElementById('editCourtName').value = court.name;
  document.getElementById('editCourtRegion').value = court.region || '';

  // Cascade: populate province + city selects
  const region = court.region || '';
  const provGroup = document.getElementById('editCourtProvinceGroup');
  const provSelect = document.getElementById('editCourtProvince');
  const cityGroup = document.getElementById('editCourtCityGroup');
  const citySelect = document.getElementById('editCourtCity');

  if (region && PH_LOCATIONS[region]) {
    const provinces = Object.keys(PH_LOCATIONS[region]).sort();
    provSelect.innerHTML = '<option value="">Select Province</option>' + provinces.map(p => `<option value="${p}">${p}</option>`).join('');
    provSelect.value = court.province || '';
    provGroup.style.display = 'block';

    if (court.province && PH_LOCATIONS[region][court.province]) {
      const cities = [...PH_LOCATIONS[region][court.province]].sort();
      citySelect.innerHTML = '<option value="">Select City</option>' + cities.map(c => `<option value="${c}">${c}</option>`).join('');
      citySelect.value = court.city || '';
      cityGroup.style.display = 'block';
    } else {
      cityGroup.style.display = 'none';
    }
  } else {
    provGroup.style.display = 'none';
    cityGroup.style.display = 'none';
  }

  document.getElementById('editCourtType').value = court.type;
  document.getElementById('editCourtAccess').value = court.access;
  document.getElementById('editCourtRate').value = court.rate || '';
  document.getElementById('editCourtContact').value = court.contact || '';
  document.getElementById('editCourtAddress').value = court.address || '';
  document.getElementById('editCourtHours').value = court.hours || '';

  document.getElementById('editCourtModal').style.display = 'flex';
}

document.getElementById('editCourtForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!editingCourtId) return;

  try {
    await PickleCourts.update(editingCourtId, {
      name: document.getElementById('editCourtName').value,
      city: document.getElementById('editCourtCity').value,
      province: document.getElementById('editCourtProvince').value,
      region: document.getElementById('editCourtRegion').value,
      type: document.getElementById('editCourtType').value,
      access: document.getElementById('editCourtAccess').value,
      rate: document.getElementById('editCourtRate').value,
      contact: document.getElementById('editCourtContact').value,
      address: document.getElementById('editCourtAddress').value,
      hours: document.getElementById('editCourtHours').value
    });
    showToast('Court updated!');
    closeModal('editCourtModal');
    loadMyCourts();
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
});

document.getElementById('editCancelBtn').addEventListener('click', () => closeModal('editCourtModal'));
document.getElementById('editModalClose').addEventListener('click', () => closeModal('editCourtModal'));

// ============================================================
// DELETE COURT
// ============================================================
async function deleteCourt(courtId) {
  if (!confirm('Are you sure you want to delete this court?')) return;
  try {
    await PickleCourts.delete(courtId);
    showToast('Court deleted.');
    loadMyCourts();
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
}

async function adminDeleteCourt(courtId) {
  if (!confirm('Delete this court permanently?')) return;
  try {
    await PickleCourts.delete(courtId);
    showToast('Court deleted.');
    loadOwnerCourts();
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
}

// ============================================================
// PHOTO MANAGER
// ============================================================
let photoCourtId = null;

async function openPhotoManager(courtId) {
  photoCourtId = courtId;
  const court = await PickleCourts.getById(courtId);
  if (!court) return;

  const isPro = userProfile?.plan === 'pro';
  const maxPhotos = isPro ? 999 : 3;

  document.getElementById('photoLimitInfo').textContent = `Photos: ${court.photos?.length || 0} uploaded | ${isPro ? 'Unlimited (Pro)' : 'Up to 3 (Basic)'}`;

  const grid = document.getElementById('photoGrid');
  if (court.photos && court.photos.length > 0) {
    grid.innerHTML = court.photos.map(url => `
      <div style="position:relative">
        <img src="${url}" alt="Court photo"/>
        <button onclick="deletePhoto('${courtId}', '${url}')" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.6);color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:12px">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');
  } else {
    grid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;grid-column:1/-1;text-align:center">No photos yet</p>';
  }

  const uploadArea = document.getElementById('photoUploadArea');
  if (!isPro && court.photos && court.photos.length >= 3) {
    uploadArea.style.display = 'none';
  } else {
    uploadArea.style.display = 'block';
  }

  document.getElementById('photoModal').style.display = 'flex';
}

document.getElementById('photoUploadArea').addEventListener('click', () => {
  document.getElementById('photoFileInput').click();
});

document.getElementById('photoFileInput').addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files.length || !photoCourtId) return;

  try {
    showToast('Uploading photos...');
    const urls = await PickleStorage.uploadMultiple(photoCourtId, files);
    const court = await PickleCourts.getById(photoCourtId);
    const existing = court.photos || [];
    await PickleCourts.update(photoCourtId, { photos: [...existing, ...urls] });
    showToast(`${urls.length} photo(s) uploaded!`);
    openPhotoManager(photoCourtId);
  } catch (err) {
    showToast('Upload failed: ' + err.message, 4000);
  }
});

async function deletePhoto(courtId, url) {
  if (!confirm('Remove this photo?')) return;
  try {
    const court = await PickleCourts.getById(courtId);
    const updated = (court.photos || []).filter(p => p !== url);
    await PickleCourts.update(courtId, { photos: updated });
    openPhotoManager(courtId);
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
}

document.getElementById('photoModalClose').addEventListener('click', () => {
  closeModal('photoModal');
  loadMyCourts();
});

// ============================================================
// FEATURED TOGGLE (Pro only)
// ============================================================
async function toggleFeatured(courtId, current) {
  try {
    await PickleCourts.setFeatured(courtId, !current);
    showToast(current ? 'Featured removed' : 'Court is now featured!');
    loadMyCourts();
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
}

// ============================================================
// BOOKINGS
// ============================================================
async function loadBookings() {
  const container = document.getElementById('bookingsList');

  try {
    const courts = await PickleCourts.getByOwner(currentUser.uid);
    if (courts.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check"></i><h3>No bookings yet</h3><p>Add a court first to receive booking requests.</p></div>';
      return;
    }

    let allBookings = [];
    for (const court of courts) {
      const bookings = await PickleBookings.getByCourt(court.id);
      allBookings = [...allBookings, ...bookings.map(b => ({ ...b, courtName: court.name }))];
    }

    if (allBookings.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check"></i><h3>No bookings yet</h3><p>When players send booking inquiries, they will appear here.</p></div>';
      return;
    }

    container.innerHTML = allBookings.map(b => `
      <div class="booking-item">
        <div class="booking-header">
          <span class="booking-name">${b.name}</span>
          <span class="status-badge ${b.status === 'confirmed' ? 'status-approved' : b.status === 'cancelled' ? 'status-pending' : 'status-pending'}">${b.status}</span>
        </div>
        <div class="booking-detail">📋 ${b.courtName} · 📅 ${b.date || 'No date'} · 🕐 ${b.time || 'No time'}</div>
        <div class="booking-detail">📞 ${b.contact || 'No contact'} · 💬 ${b.message || ''}</div>
        ${b.status === 'pending' ? `
        <div class="booking-actions">
          <button class="btn-dash btn-dash-primary" onclick="updateBooking('${b.id}', 'confirmed')">
            <i class="fas fa-check"></i> Confirm
          </button>
          <button class="btn-dash btn-dash-danger" onclick="updateBooking('${b.id}', 'cancelled')">
            <i class="fas fa-times"></i> Decline
          </button>
        </div>` : ''}
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:#d32f2f">Error: ${err.message}</p>`;
  }
}

function toMinutes(s) {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
}
function timeOverlap(timeA, timeB) {
  const parse = (t) => {
    if (t.includes('-')) {
      const [s, e] = t.split('-');
      return [toMinutes(s), toMinutes(e)];
    }
    const m = toMinutes(t);
    return [m, m + 60];
  };
  const [aStart, aEnd] = parse(timeA);
  const [bStart, bEnd] = parse(timeB);
  return aStart < bEnd && bStart < aEnd;
}

async function updateBooking(bookingId, status) {
  // If confirming, check for double-booking first
  if (status === 'confirmed') {
    const allBookings = await loadAllBookingsFlat();
    const thisBooking = allBookings.find(b => b.id === bookingId);
    if (thisBooking && thisBooking.date) {
      const conflict = allBookings.find(b =>
        b.id !== bookingId &&
        b.status === 'confirmed' &&
        b.courtId === thisBooking.courtId &&
        b.date === thisBooking.date &&
        b.time && thisBooking.time &&
        timeOverlap(b.time, thisBooking.time)
      );
      if (conflict) {
        showToast('⚠️ Conflict! Another confirmed booking overlaps this time slot.', 5000);
        return;
      }
    }
  }

  try {
    await PickleBookings.updateStatus(bookingId, status);
    showToast(`Booking ${status}!`);

    // Send chat notification to the customer
    try {
      const booking = await PickleBookings.getById(bookingId);
      let courtName = 'Court';
      let court = null;
      try {
        court = await PickleCourts.getById(booking.courtId);
        if (court) courtName = court.name;
      } catch {}
      if (booking && booking.chatId) {
        const emoji = status === 'confirmed' ? '✅' : status === 'rejected' ? '❌' : '⏳';
        const label = status.charAt(0).toUpperCase() + status.slice(1);
        let msg = `${emoji} Your booking at ${courtName} has been ${label}.`;
        if (status === 'confirmed' && booking.date && booking.time) {
          const calUrl = generateCalendarUrl(`Pickleball at ${courtName}`, booking.date, booking.time, court?.address || '');
          msg += `\n\n📅 Add to Calendar: ${calUrl}`;
        }
        await PickleChat.sendMessage(booking.chatId, 'system', courtName, msg);
      }
      // Email notification to customer
      if (booking && booking.email) {
        await PickleNotifications.notifyCustomerBookingStatus(booking.email, booking.name, courtName, status, booking.date, booking.time, court?.address || '');
      }
      // Email notification to owner with calendar link when confirmed
      if (status === 'confirmed' && currentUser && currentUser.email) {
        const ownerBody = `✅ Booking confirmed at ${courtName}!\n\nCustomer: ${booking.name}\nContact: ${booking.contact}\nDate: ${booking.date}\nTime: ${booking.time}\nPlayers: ${booking.players}`;
        const ownerCalUrl = generateCalendarUrl(`Pickleball at ${courtName}`, booking.date, booking.time, court?.address || '');
        await PickleNotifications.send(currentUser.email, currentUser.displayName || 'Owner', `Booking Confirmed: ${courtName}`, ownerBody + `\n\nAdd to Google Calendar: ${ownerCalUrl}`);
      }
    } catch {}

    loadBookings();
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
}

async function loadAllBookingsFlat() {
  const courts = await PickleCourts.getByOwner(currentUser.uid);
  let all = [];
  for (const court of courts) {
    const bookings = await PickleBookings.getByCourt(court.id);
    all = [...all, ...bookings.map(b => ({ ...b, courtName: court.name }))];
  }
  return all;
}

// ============================================================
// REVIEWS
// ============================================================
async function loadReviews() {
  const container = document.getElementById('reviewsList');

  try {
    const courts = await PickleCourts.getByOwner(currentUser.uid);
    if (courts.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><h3>No reviews yet</h3><p>Add a court to start collecting reviews.</p></div>';
      return;
    }

    let html = '';
    for (const court of courts) {
      const reviews = await PickleReviews.getByCourt(court.id);
      const rating = await PickleReviews.getAverageRating(court.id);

      html += `
        <div class="court-card-owner">
          <div class="card-header">
            <h3>${court.name} ${rating.count > 0 ? `<span style="font-size:14px;color:var(--accent);font-weight:600">★ ${rating.average} (${rating.count} reviews)</span>` : ''}</h3>
          </div>
          <div class="card-body">
            ${reviews.length === 0 ? '<p style="color:var(--text-muted);font-size:13px">No reviews yet.</p>' :
              reviews.map(r => `
                <div style="padding:10px 0;border-bottom:1px solid #f0f0f0">
                  <div style="display:flex;justify-content:space-between;font-size:13px">
                    <strong>${r.userName || 'Anonymous'}</strong>
                    <span style="color:var(--accent)">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  ${r.comment ? `<p style="font-size:13px;color:var(--text-muted);margin-top:4px">${r.comment}</p>` : ''}
                </div>
              `).join('')
            }
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:#d32f2f">Error: ${err.message}</p>`;
  }
}

// ============================================================
// ANALYTICS (Pro only)
// ============================================================
async function loadAnalytics() {
  const container = document.getElementById('analyticsContainer');
  container.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';

  try {
    const courts = await PickleCourts.getByOwner(currentUser.uid);
    if (courts.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-bar"></i><h3>No courts yet</h3><p>Add a court to start tracking analytics.</p></div>';
      return;
    }

    let totalViews = 0;
    let totalBookings = 0;
    let html = '';

    for (const court of courts) {
      const views = await PickleAnalytics.getViews(court.id);
      const bookings = await PickleAnalytics.getBookingCount(court.id);
      totalViews += views;
      totalBookings += bookings;

      html += `
        <div class="analytics-card">
          <div class="analytics-card-header">
            <strong>${court.name}</strong>
            <span class="tag" style="background:#e3f2fd;color:#1565c0">${court.city}</span>
          </div>
          <div class="analytics-stats">
            <div class="analytics-stat">
              <div class="analytics-number">${views}</div>
              <div class="analytics-label"><i class="fas fa-eye"></i> Views</div>
            </div>
            <div class="analytics-stat">
              <div class="analytics-number">${bookings}</div>
              <div class="analytics-label"><i class="fas fa-calendar-check"></i> Inquiries</div>
            </div>
          </div>
        </div>
      `;
    }

    html = `
      <div class="analytics-totals">
        <div class="analytics-total-card">
          <div class="analytics-number">${totalViews}</div>
          <div class="analytics-label">Total Views</div>
        </div>
        <div class="analytics-total-card">
          <div class="analytics-number">${totalBookings}</div>
          <div class="analytics-label">Total Inquiries</div>
        </div>
      </div>
      ${html}
    `;

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:#d32f2f">Error: ${err.message}</p>`;
  }
}

// ============================================================
// PAYMENTS (Admin view)
// ============================================================
async function loadPayments() {
  const container = document.getElementById('paymentsList');
  if (currentUser.email !== ADMIN_EMAIL) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-lock"></i><h3>Access Denied</h3></div>';
    return;
  }

  try {
    const payments = await PicklePayments.getAll();

    if (payments.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-credit-card"></i><h3>No payments yet</h3><p>When owners submit Pro upgrade payments, they will appear here.</p></div>';
      return;
    }

    // Fetch user profiles to show names/emails
    const userCache = {};
    async function getUser(uid) {
      if (!userCache[uid]) {
        userCache[uid] = await PickleAuth.getUserProfile(uid);
      }
      return userCache[uid];
    }

    container.innerHTML = payments.map(p => {
      const user = userCache[p.userId];
      return `
        <div class="booking-item">
          <div class="booking-header">
            <span class="booking-name">${p.method?.toUpperCase() || 'N/A'} — ${p.reference}</span>
            <span class="status-badge ${p.status === 'verified' ? 'status-approved' : p.status === 'failed' ? 'status-pending' : 'status-pending'}">${p.status}</span>
          </div>
          <div class="booking-detail">👤 User ID: ${p.userId}</div>
          <div class="booking-detail">💰 ₱${p.amount} · 📅 ${p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : 'Just now'}</div>
          ${p.status === 'pending' ? `
          <div class="booking-actions">
            <button class="btn-dash btn-dash-primary" onclick="verifyPayment('${p.id}', '${p.userId}')">
              <i class="fas fa-check"></i> Verify & Upgrade
            </button>
            <button class="btn-dash btn-dash-danger" onclick="failPayment('${p.id}')">
              <i class="fas fa-times"></i> Mark Failed
            </button>
          </div>` : ''}
        </div>
      `;
    }).join('');

    // Fetch user profiles in background
    const uniqueUids = [...new Set(payments.map(p => p.userId))];
    await Promise.all(uniqueUids.map(getUser));
    // Re-render with names
    container.innerHTML = payments.map(p => {
      const user = userCache[p.userId];
      const name = user?.displayName || 'Unknown';
      const email = user?.email || p.userId;
      return `
        <div class="booking-item">
          <div class="booking-header">
            <span class="booking-name">${name}</span>
            <span class="status-badge ${p.status === 'verified' ? 'status-approved' : p.status === 'failed' ? 'status-pending' : 'status-pending'}">${p.status}</span>
          </div>
          <div class="booking-detail">📧 ${email}</div>
          <div class="booking-detail">💳 ${p.method?.toUpperCase() || 'N/A'} · Ref: ${p.reference} · ₱${p.amount}</div>
          <div class="booking-detail">📅 ${p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : 'Just now'}</div>
          ${p.status === 'pending' ? `
          <div class="booking-actions">
            <button class="btn-dash btn-dash-primary" onclick="verifyPayment('${p.id}', '${p.userId}')">
              <i class="fas fa-check"></i> Verify & Upgrade
            </button>
            <button class="btn-dash btn-dash-danger" onclick="failPayment('${p.id}')">
              <i class="fas fa-times"></i> Mark Failed
            </button>
          </div>` : ''}
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:#d32f2f">Error: ${err.message}</p>`;
  }
}

// ============================================================
// ADMIN SITE ANALYTICS
// ============================================================
async function loadAdminAnalytics() {
  const container = document.getElementById('adminAnalyticsContainer');
  container.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';

  try {
    const [usersSnap, courts, bookingsSnap, subscribers] = await Promise.all([
      db.collection('users').get(),
      PickleCourts.getAll(),
      db.collection('bookings').get(),
      PickleMailing.getAll()
    ]);

    const totalUsers = usersSnap.docs.length;
    const totalCourts = courts.length;
    const totalBookings = bookingsSnap.docs.length;
    const totalSubscribers = subscribers.length;
    const totalViews = courts.reduce((sum, c) => sum + (c.views || 0), 0);

    let proCount = 0, basicCount = 0;
    usersSnap.docs.forEach(doc => {
      const d = doc.data();
      if (d.plan === 'pro') proCount++;
      else basicCount++;
    });
    const proPct = totalUsers ? Math.round((proCount / totalUsers) * 100) : 0;

    const recentUsers = usersSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => u.createdAt)
      .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0))
      .slice(0, 10);

    container.innerHTML = `
      <div class="admin-grid">
        <div class="admin-card">
          <div class="admin-icon"><i class="fas fa-map-pin"></i></div>
          <div class="admin-number">${totalCourts}</div>
          <div class="admin-label">Total Courts</div>
        </div>
        <div class="admin-card">
          <div class="admin-icon"><i class="fas fa-users"></i></div>
          <div class="admin-number">${totalUsers}</div>
          <div class="admin-label">Registered Owners</div>
        </div>
        <div class="admin-card">
          <div class="admin-icon"><i class="fas fa-calendar-check"></i></div>
          <div class="admin-number">${totalBookings}</div>
          <div class="admin-label">Total Bookings</div>
        </div>
        <div class="admin-card accent">
          <div class="admin-icon"><i class="fas fa-eye"></i></div>
          <div class="admin-number">${totalViews}</div>
          <div class="admin-label">Total Page Views</div>
        </div>
        <div class="admin-card">
          <div class="admin-icon"><i class="fas fa-mail-bulk"></i></div>
          <div class="admin-number">${totalSubscribers}</div>
          <div class="admin-label">Mailing List</div>
        </div>
      </div>

      <div class="admin-breakdown">
        <h3>Plan Breakdown</h3>
        <div class="bar">
          <div class="bar-pro" style="flex:${proCount}"></div>
          <div class="bar-basic" style="flex:${basicCount || 1}"></div>
        </div>
        <div class="bar-label">
          <span><strong>Pro:</strong> ${proCount} (${proPct}%)</span>
          <span><strong>Basic:</strong> ${basicCount} (${100 - proPct}%)</span>
        </div>
      </div>

      ${recentUsers.length ? `
      <div class="admin-breakdown">
        <h3>Recent Registrations</h3>
        ${recentUsers.map(u => `
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f5f5f5;font-size:13px">
            <span>${u.displayName || 'Unknown'} <span style="color:var(--text-muted);font-size:11px">${u.email || ''}</span></span>
            <span style="color:var(--text-muted);font-size:11px">${u.createdAt?.toDate?.() ? u.createdAt.toDate().toLocaleDateString() : ''} · ${u.plan === 'pro' ? '⭐ Pro' : 'Basic'}</span>
          </div>
        `).join('')}
      </div>` : ''}
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:#d32f2f">Error: ${err.message}</p>`;
  }
}

// ============================================================
// OWNER COURTS (Admin View)
// ============================================================
async function loadOwnerCourts() {
  const container = document.getElementById('ownerCourtsList');
  container.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';

  try {
    const courts = await PickleCourts.getAll();
    if (courts.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-map-pin"></i><h3>No courts added yet</h3></div>';
      return;
    }

    const ownerIds = [...new Set(courts.map(c => c.ownerId).filter(Boolean))];
    const ownerCache = {};
    await Promise.all(ownerIds.map(async uid => {
      try {
        const prof = await PickleAuth.getUserProfile(uid);
        if (prof) ownerCache[uid] = prof;
      } catch {}
    }));

    container.innerHTML = courts.map(court => {
      const owner = ownerCache[court.ownerId] || {};
      return `
        <div class="court-card-owner">
          <div class="card-header">
            <div>
              <h3>${court.name} ${court.verified ? '<i class="fas fa-check-circle" style="color:#1565c0" title="Verified"></i>' : ''} ${court.featured ? '<span class="status-badge" style="background:#fff3e0;color:#e65100">★ Featured</span>' : ''}</h3>
              <span style="font-size:12px;color:var(--text-muted)">${court.city}, ${court.region}</span>
            </div>
            <button onclick="adminDeleteCourt('${court.id}')" title="Delete this court" style="background:none;border:none;color:#d32f2f;cursor:pointer;font-size:16px;padding:4px 8px"><i class="fas fa-trash"></i></button>
          </div>
          <div class="card-body" style="font-size:13px;color:var(--text-muted)">
            <div style="display:flex;gap:16px;flex-wrap:wrap">
              <span>🏓 ${court.courts || 1} court(s)</span>
              <span>📋 ${court.type}</span>
              <span>🔑 ${court.access}</span>
              ${court.rate ? `<span>💰 ${court.rate}</span>` : ''}
            </div>
            <div style="margin-top:8px;padding:8px;background:#f9f9f9;border-radius:6px;font-size:12px">
              <strong>Owner:</strong> ${owner.displayName || 'Unknown'} · ${owner.email || ''} · ${owner.plan === 'pro' ? '⭐ Pro' : 'Basic'}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:#d32f2f">Error: ${err.message}</p>`;
  }
}

// ============================================================
// OPEN PLAY SCHEDULES
// ============================================================
let editingScheduleId = null;
const SCHEDULE_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

async function loadSchedules() {
  const container = document.getElementById('schedulesList');
  container.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';

  try {
    const myCourts = await PickleCourts.getByOwner(currentUser.uid);
    const allSchedules = await PickleSchedules.getByOwner(currentUser.uid);

    const formHtml = `
      <div style="background:var(--white);border-radius:16px;padding:24px;margin-bottom:24px;box-shadow:var(--card-shadow)">
        <h3 style="margin-bottom:16px;font-size:16px">${editingScheduleId ? 'Edit Schedule' : 'Add Open Play Schedule'}</h3>
        <form id="scheduleForm">
          <div class="form-row">
            <div class="form-group" style="flex:2">
              <label>Court *</label>
              <select id="schedCourtId" required>
                <option value="">Select a court</option>
                ${myCourts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="flex:1">
              <label>Day *</label>
              <select id="schedDay" required>
                <option value="">Select day</option>
                ${SCHEDULE_DAYS.map(d => `<option value="${d}">${d}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label>Start *</label>
              <input type="time" id="schedStart" required/>
            </div>
            <div class="form-group" style="flex:1">
              <label>End *</label>
              <input type="time" id="schedEnd" required/>
            </div>
            <div class="form-group" style="flex:1">
              <label>Cost</label>
              <input type="text" id="schedCost" placeholder="e.g. P250/head"/>
            </div>
          </div>
          <div class="form-group">
            <label>Notes (optional)</label>
            <input type="text" id="schedNotes" placeholder="e.g. All levels welcome, bring own paddle"/>
          </div>
          <div class="form-actions">
            ${editingScheduleId ? `<button type="button" class="btn-cancel" onclick="cancelEditSchedule()">Cancel</button>` : ''}
            <button type="submit" class="btn-submit"><i class="fas fa-save"></i> ${editingScheduleId ? 'Update' : 'Add'} Schedule</button>
          </div>
        </form>
        ${myCourts.length === 0 ? '<p style="color:var(--text-muted);font-size:13px;margin-top:8px">You need to <a href="#" onclick="switchSection(\'add-court\')">add a court first</a>.</p>' : ''}
      </div>
    `;

    const listHtml = allSchedules.length ? allSchedules.map(s => {
      const court = myCourts.find(c => c.id === s.courtId);
      return `
        <div style="background:var(--white);border-radius:12px;padding:16px 20px;margin-bottom:12px;box-shadow:var(--card-shadow);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <strong>${s.day}</strong> · ${s.startTime} - ${s.endTime}
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
              📍 ${court ? court.name : s.courtId}
            </div>
            ${s.cost ? `<div style="font-size:12px;color:var(--text-muted)">💰 ${s.cost}</div>` : ''}
            ${s.notes ? `<div style="font-size:12px;color:var(--text-muted)">📝 ${s.notes}</div>` : ''}
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0">
            <button class="btn-dash btn-dash-primary" onclick="editSchedule('${s.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn-dash btn-dash-danger" onclick="deleteSchedule('${s.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `;
    }).join('') : '<div class="empty-state"><i class="fas fa-calendar-alt"></i><h3>No schedules</h3><p>Add your first open play schedule above.</p></div>';

    container.innerHTML = formHtml + listHtml;

    document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        courtId: document.getElementById('schedCourtId').value,
        courtName: myCourts.find(c => c.id === document.getElementById('schedCourtId').value)?.name || '',
        day: document.getElementById('schedDay').value,
        startTime: document.getElementById('schedStart').value,
        endTime: document.getElementById('schedEnd').value,
        cost: document.getElementById('schedCost').value,
        notes: document.getElementById('schedNotes').value,
        ownerId: currentUser.uid
      };
      try {
        if (editingScheduleId) {
          await PickleSchedules.update(editingScheduleId, data);
          showToast('Schedule updated!');
        } else {
          await PickleSchedules.add(data);
          showToast('Open play schedule added!');
        }
        editingScheduleId = null;
        loadSchedules();
      } catch (err) {
        showToast('Error: ' + err.message, 4000);
      }
    });

    if (editingScheduleId) {
      const s = allSchedules.find(x => x.id === editingScheduleId);
      if (s) {
        document.getElementById('schedCourtId').value = s.courtId || '';
        document.getElementById('schedDay').value = s.day || '';
        document.getElementById('schedStart').value = s.startTime || '';
        document.getElementById('schedEnd').value = s.endTime || '';
        document.getElementById('schedCost').value = s.cost || '';
        document.getElementById('schedNotes').value = s.notes || '';
      }
    }
  } catch (err) {
    container.innerHTML = `<p style="color:#d32f2f">Error: ${err.message}</p>`;
  }
}

window.editSchedule = function(id) {
  editingScheduleId = id;
  loadSchedules();
};

window.cancelEditSchedule = function() {
  editingScheduleId = null;
  loadSchedules();
};

window.deleteSchedule = async function(id) {
  if (!confirm('Delete this schedule?')) return;
  try {
    await PickleSchedules.delete(id);
    showToast('Schedule deleted.');
    loadSchedules();
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
};

// ============================================================
// TOURNAMENTS
// ============================================================
let editingTournamentId = null;

async function loadTournaments() {
  const container = document.getElementById('tournamentsList');
  container.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';

  try {
    const isAdmin = currentUser.email === ADMIN_EMAIL;
    const allTournaments = await PickleTournaments.getAll();
    const tournaments = isAdmin ? allTournaments : allTournaments.filter(t => t.ownerId === currentUser.uid);
    const now = new Date();

    const formHtml = `
      <div style="background:var(--white);border-radius:16px;padding:24px;margin-bottom:24px;box-shadow:var(--card-shadow)">
        <h3 style="margin-bottom:16px;font-size:16px">${editingTournamentId ? 'Edit Tournament' : 'Add Tournament'}</h3>
        <form id="tournamentForm">
          <div class="form-row">
            <div class="form-group" style="flex:2">
              <label>Tournament Name</label>
              <input type="text" id="tournName" required/>
            </div>
            <div class="form-group" style="flex:1">
              <label>Date</label>
              <input type="date" id="tournDate" required/>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:2">
              <label>Location</label>
              <input type="text" id="tournLocation" placeholder="City, Venue"/>
            </div>
            <div class="form-group" style="flex:1">
              <label>Link (optional)</label>
              <input type="url" id="tournLink" placeholder="https://..."/>
            </div>
          </div>
          <div class="form-group">
            <label>Details</label>
            <textarea id="tournDetails" rows="3" placeholder="Format, prizes, registration info..."></textarea>
          </div>
          <div class="form-actions">
            ${editingTournamentId ? `<button type="button" class="btn-cancel" onclick="cancelEditTournament()">Cancel</button>` : ''}
            <button type="submit" class="btn-submit"><i class="fas fa-save"></i> ${editingTournamentId ? 'Update' : 'Add'} Tournament</button>
          </div>
        </form>
      </div>
    `;

    const listHtml = tournaments.length ? tournaments.map(t => {
      const d = new Date(t.date);
      const past = d < now;
      const canModify = isAdmin || t.ownerId === currentUser.uid;
      return `
        <div style="background:var(--white);border-radius:12px;padding:16px 20px;margin-bottom:12px;box-shadow:var(--card-shadow);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;opacity:${past ? 0.5 : 1}">
          <div>
            <strong>${t.name}</strong> ${past ? '<span style="color:#999;font-size:11px">(past)</span>' : ''}
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
              📅 ${d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })} · 📍 ${t.location || 'N/A'}
            </div>
            ${t.details ? `<div style="font-size:12px;color:var(--text-muted);margin-top:2px">${t.details}</div>` : ''}
            ${t.link ? `<a href="${t.link}" target="_blank" style="font-size:12px;color:var(--primary)">🔗 More info</a>` : ''}
          </div>
          ${canModify ? `
          <div style="display:flex;gap:8px;flex-shrink:0">
            <button class="btn-dash btn-dash-primary" onclick="editTournament('${t.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn-dash btn-dash-danger" onclick="deleteTournament('${t.id}')"><i class="fas fa-trash"></i></button>
          </div>` : ''}
        </div>
      `;
    }).join('') : '<div class="empty-state"><i class="fas fa-trophy"></i><h3>No tournaments</h3><p>Add your first tournament above.</p></div>';

    container.innerHTML = formHtml + listHtml;

    document.getElementById('tournamentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('tournName').value,
        date: document.getElementById('tournDate').value,
        location: document.getElementById('tournLocation').value,
        link: document.getElementById('tournLink').value,
        details: document.getElementById('tournDetails').value,
        ownerId: currentUser.uid
      };
      try {
        if (editingTournamentId) {
          const updateData = { ...data };
          delete updateData.ownerId;
          await PickleTournaments.update(editingTournamentId, updateData);
          showToast('Tournament updated!');
        } else {
          await PickleTournaments.add(data);
          showToast('Tournament added and will appear in RSS feed!');
        }
        editingTournamentId = null;
        loadTournaments();
      } catch (err) {
        showToast('Error: ' + err.message, 4000);
      }
    });

    if (editingTournamentId) {
      const t = tournaments.find(x => x.id === editingTournamentId);
      if (t) {
        document.getElementById('tournName').value = t.name;
        document.getElementById('tournDate').value = t.date;
        document.getElementById('tournLocation').value = t.location || '';
        document.getElementById('tournLink').value = t.link || '';
        document.getElementById('tournDetails').value = t.details || '';
      }
    }
  } catch (err) {
    container.innerHTML = `<p style="color:#d32f2f">Error: ${err.message}</p>`;
  }
}

window.editTournament = function(id) {
  editingTournamentId = id;
  loadTournaments();
};

window.cancelEditTournament = function() {
  editingTournamentId = null;
  loadTournaments();
};

window.deleteTournament = async function(id) {
  if (!confirm('Delete this tournament?')) return;
  try {
    await PickleTournaments.delete(id);
    showToast('Tournament deleted.');
    loadTournaments();
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
};

window.verifyPayment = async function(paymentId, userId) {
  if (!confirm('Verify this payment and upgrade the user to Pro?')) return;
  try {
    await PicklePayments.verifyPayment(paymentId);
    await PickleAuth.upgradeToPro(userId);
    showToast('Payment verified! User upgraded to Pro.');
    loadPayments();
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
};

window.failPayment = async function(paymentId) {
  if (!confirm('Mark this payment as failed?')) return;
  try {
    await db.collection(COLLECTIONS.PAYMENTS).doc(paymentId).update({ status: 'failed' });
    showToast('Payment marked as failed.');
    loadPayments();
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
};

// ============================================================
// AVAILABILITY (Weekly Schedule)
// ============================================================
const AVAIL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };

let availCourtId = null;

function loadAvailabilitySection() {
  const selector = document.getElementById('availabilityCourtSelector');
  const editor = document.getElementById('availabilityEditor');

  PickleCourts.getByOwner(currentUser.uid).then(courts => {
    if (courts.length === 0) {
      selector.innerHTML = '<p style="color:var(--text-muted)">Add a court first to set availability.</p>';
      editor.innerHTML = '';
      return;
    }

    selector.innerHTML = `
      <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">Select Court</label>
      <select class="avail-court-select" id="availCourtSelect">
        ${courts.map(c => `<option value="${c.id}">${c.name} — ${c.city}</option>`).join('')}
      </select>
    `;

    document.getElementById('availCourtSelect').addEventListener('change', () => {
      availCourtId = document.getElementById('availCourtSelect').value;
      renderAvailabilityEditor();
    });

    availCourtId = courts[0].id;
    renderAvailabilityEditor();
  });
}

async function renderAvailabilityEditor() {
  if (!availCourtId) return;
  const court = await PickleCourts.getById(availCourtId);
  if (!court) return;

  const avail = court.availability || getDefaultAvailability();
  const editor = document.getElementById('availabilityEditor');

  editor.innerHTML = `
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Toggle days on/off and set operating hours. Customers will only see available slots within these hours.</p>
    ${AVAIL_DAYS.map(day => {
      const d = avail[day] || { enabled: false, start: '06:00', end: '22:00' };
      return `
        <div class="avail-day ${d.enabled ? '' : 'avail-slot-disabled'}">
          <div style="display:flex;align-items:center;gap:16px;flex:1;flex-wrap:wrap">
            <span class="day-name">${DAY_LABELS[day]}</span>
            <label class="day-toggle">
              <input type="checkbox" class="avail-toggle" data-day="${day}" ${d.enabled ? 'checked' : ''}/>
              Open
            </label>
            <div class="day-time">
              <input type="time" class="avail-start" data-day="${day}" value="${d.start}" ${d.enabled ? '' : 'disabled'}/>
              <span>to</span>
              <input type="time" class="avail-end" data-day="${day}" value="${d.end}" ${d.enabled ? '' : 'disabled'}/>
            </div>
          </div>
        </div>
      `;
    }).join('')}
    <div style="display:flex;gap:12px;margin-top:16px">
      <button class="btn-dash btn-dash-primary" id="saveAvailBtn"><i class="fas fa-save"></i> Save Schedule</button>
      <button class="btn-dash btn-dash-outline" id="resetAvailBtn"><i class="fas fa-undo"></i> Reset</button>
    </div>
  `;

  // Toggle enable/disable time inputs
  editor.querySelectorAll('.avail-toggle').forEach(cb => {
    cb.addEventListener('change', () => {
      const day = cb.dataset.day;
      const row = cb.closest('.avail-day');
      row.classList.toggle('avail-slot-disabled', !cb.checked);
      row.querySelector('.avail-start').disabled = !cb.checked;
      row.querySelector('.avail-end').disabled = !cb.checked;
    });
  });

  document.getElementById('saveAvailBtn').addEventListener('click', async () => {
    const availability = {};
    AVAIL_DAYS.forEach(day => {
      const enabled = document.querySelector(`.avail-toggle[data-day="${day}"]`).checked;
      const start = document.querySelector(`.avail-start[data-day="${day}"]`).value;
      const end = document.querySelector(`.avail-end[data-day="${day}"]`).value;
      availability[day] = { enabled, start, end };
    });

    try {
      await PickleCourts.update(availCourtId, { availability });
      showToast('Schedule saved!');
    } catch (err) {
      showToast('Error: ' + err.message, 4000);
    }
  });

  document.getElementById('resetAvailBtn').addEventListener('click', () => renderAvailabilityEditor());
}

function getDefaultAvailability() {
  const avail = {};
  AVAIL_DAYS.forEach(day => {
    avail[day] = { enabled: day !== 'sunday', start: '06:00', end: '22:00' };
  });
  return avail;
}

// ============================================================
// CHAT / MESSAGES
// ============================================================
let chatUnsub = null;
let activeChatId = null;

function initChat() {
  // Listen to chats in real-time
  if (chatUnsub) chatUnsub();
  chatUnsub = PickleChat.onOwnerChats(currentUser.uid, (chats) => {
    renderChatList(chats);
    if (activeChatId) {
      const stillExists = chats.find(c => c.id === activeChatId);
      if (!stillExists) {
        closeChatThread();
      }
    }
    // Update unread badge
    const totalUnread = chats.reduce((sum, c) => sum + (c.unreadOwner || 0), 0);
    const badge = document.getElementById('chatUnreadBadge');
    if (totalUnread > 0) {
      badge.textContent = totalUnread;
      badge.style.display = 'inline';
    } else {
      badge.style.display = 'none';
    }
  });
}

function renderChatList(chats) {
  const container = document.getElementById('chatList');
  if (!chats.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><h3>No messages yet</h3><p>When players send inquiries, chat threads will appear here.</p></div>';
    return;
  }
  container.innerHTML = chats.map(c => `
    <div class="chat-thread" onclick="openChatThread('${c.id}')">
      <div class="chat-thread-header">
        <div>
          <div class="chat-name">${c.customerName}</div>
          <div class="chat-court">📋 ${c.courtName} · ${c.customerContact}</div>
        </div>
        ${(c.unreadOwner || 0) > 0 ? `<span class="chat-unread">${c.unreadOwner}</span>` : ''}
      </div>
      <div class="chat-preview">
        <span>${c.lastMessage ? (c.lastSender + ': ' + c.lastMessage) : 'No messages yet'}</span>
      </div>
    </div>
  `).join('');
}

let msgUnsub = null;

window.openChatThread = async function(chatId) {
  activeChatId = chatId;
  const chat = await db.collection('chats').doc(chatId).get();
  const data = chat.data();
  document.getElementById('chatThreadName').textContent = data.customerName;
  document.getElementById('chatThreadCourt').textContent = '📋 ' + data.courtName;

  document.getElementById('chatListView').classList.remove('active');
  document.getElementById('chatThreadView').classList.add('active');

  // Mark as read by owner
  await PickleChat.markOwnerRead(chatId);

  // Listen to messages
  if (msgUnsub) msgUnsub();
  msgUnsub = PickleChat.onMessages(chatId, (msgs) => {
    renderMessages(msgs);
  });
};

function renderMessages(msgs) {
  const container = document.getElementById('chatMessages');
  if (!msgs.length) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">No messages yet. Say hello!</div>';
    return;
  }
  container.innerHTML = msgs.map(m => {
    const isOwner = m.senderId === currentUser.uid;
    const time = m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return `
      <div class="chat-msg ${isOwner ? 'owner' : 'customer'}">
        <div class="chat-bubble">${m.text}</div>
        <div class="chat-time">${m.senderName} · ${time}</div>
      </div>
    `;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChatMessage();
});

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !activeChatId) return;

  input.value = '';
  try {
    await PickleChat.sendMessage(
      activeChatId,
      currentUser.uid,
      userProfile?.displayName || 'Owner',
      text
    );
    // Notify customer via email
    try {
      if (typeof PickleNotifications !== 'undefined') {
        const chat = await PickleChat.getById(activeChatId);
        if (chat && chat.customerEmail) {
          PickleNotifications.send(chat.customerEmail, chat.customerName, `New Message: ${chat.courtName}`, `You have a new reply from ${chat.courtName}:\n\n"${text}"`);
        }
      }
    } catch {}
  } catch (err) {
    showToast('Error sending message: ' + err.message, 4000);
  }
}

document.getElementById('chatBackBtn').addEventListener('click', closeChatThread);

function closeChatThread() {
  activeChatId = null;
  if (msgUnsub) { msgUnsub(); msgUnsub = null; }
  document.getElementById('chatListView').classList.add('active');
  document.getElementById('chatThreadView').classList.remove('active');
}

// ============================================================
// UPGRADE TO PRO
// ============================================================
document.getElementById('upgradeNowBtn').addEventListener('click', () => {
  document.getElementById('paymentModal').style.display = 'flex';
});

document.getElementById('paymentSubmitBtn').addEventListener('click', async () => {
  const method = document.getElementById('paymentMethod').value;
  const ref = document.getElementById('paymentRef').value.trim();

  if (!ref) {
    showToast('Please enter your payment reference number.');
    return;
  }

  try {
    await PicklePayments.recordPayment(currentUser.uid, {
      amount: 399,
      method,
      reference: ref
    });
    showToast('Payment submitted! Your Pro account will be verified within 24 hours.');
    closeModal('paymentModal');

    // Notify admin via email
    try {
      if (typeof PickleNotifications !== 'undefined') {
        await PickleNotifications.notifyAdminNewPayment(currentUser.email, currentUser.displayName || 'Owner', { amount: 399, method, reference: ref });
      }
    } catch {}
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
});

document.getElementById('paymentCancelBtn').addEventListener('click', () => closeModal('paymentModal'));
document.getElementById('paymentModalClose').addEventListener('click', () => closeModal('paymentModal'));

// ============================================================
// AUTH MODALS
// ============================================================
function showLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    await PickleAuth.login(email, password);
    closeModal('loginModal');
  } catch (err) {
    showToast('Login failed: ' + err.message, 4000);
  }
});

// Social login
document.getElementById('googleLoginBtn').addEventListener('click', async () => {
  try {
    const result = await PickleAuth.signInWithGoogle();
    if (result) closeModal('loginModal');
  } catch (err) {
    showToast('Google sign-in failed: ' + err.message, 4000);
  }
});

document.getElementById('facebookLoginBtn').addEventListener('click', async () => {
  try {
    const result = await PickleAuth.signInWithFacebook();
    if (result) closeModal('loginModal');
  } catch (err) {
    showToast('Facebook sign-in failed: ' + err.message, 4000);
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  try {
    await PickleAuth.register(email, password, name);
    closeModal('registerModal');
    showToast('Account created! Welcome to PickleSpotPH!');
  } catch (err) {
    showToast('Registration failed: ' + err.message, 4000);
  }
});

document.getElementById('showRegisterLink').addEventListener('click', (e) => {
  e.preventDefault();
  closeModal('loginModal');
  document.getElementById('registerModal').style.display = 'flex';
});

document.getElementById('showLoginLink').addEventListener('click', (e) => {
  e.preventDefault();
  closeModal('registerModal');
  document.getElementById('loginModal').style.display = 'flex';
});

// Modal close buttons
document.getElementById('loginModalClose').addEventListener('click', () => closeModal('loginModal'));
document.getElementById('registerModalClose').addEventListener('click', () => closeModal('registerModal'));

// ============================================================
// LOGOUT
// ============================================================
function setupLogout() {
  const logoutBtns = ['dashLogout', 'dashLogoutBtn'];
  logoutBtns.forEach(id => {
    document.getElementById(id).addEventListener('click', async () => {
      if (typeof PickleAuth !== 'undefined') {
        await PickleAuth.logout();
      } else {
        // Force clear any Firebase persistence
        try { indexedDB.deleteDatabase('firebaseLocalStorageDb'); } catch(_) {}
        try { localStorage.removeItem('firebase:authUser'); } catch(_) {}
      }
      window.location.reload();
    });
  });
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function setupEventListeners() {
  // Sidebar navigation
  document.querySelectorAll('.dash-nav-item[data-section]').forEach(item => {
    item.addEventListener('click', () => switchSection(item.dataset.section));
  });

  // Hamburger menu
  document.getElementById('dashHamburger').addEventListener('click', () => {
    const sidebar = document.querySelector('.dashboard-sidebar');
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
  });

  // Add court province/city cascade
  document.getElementById('dashCourtRegion').addEventListener('change', populateDashAddCourtProvinces);
  document.getElementById('dashCourtProvince').addEventListener('change', populateDashAddCourtCities);

  // Edit court province/city cascade
  document.getElementById('editCourtRegion').addEventListener('change', populateEditCourtProvinces);
  document.getElementById('editCourtProvince').addEventListener('change', populateEditCourtCities);

  setupLogout();
}

// ============================================================
// MAILING LIST
// ============================================================
async function loadMailingList() {
  const container = document.getElementById('mailingListContainer');
  try {
    const [subscribers, usersSnap] = await Promise.all([
      PickleMailing.getAll(),
      db.collection('users').get()
    ]);

    const proOwners = [];
    const basicOwners = [];
    usersSnap.docs.forEach(doc => {
      const d = doc.data();
      if (d.plan === 'pro') proOwners.push(d);
      else basicOwners.push(d);
    });

    const allEmails = [
      ...subscribers.map(s => ({ name: s.name, email: s.email, date: s.subscribedAt?.toDate?.(), group: 'Player' })),
      ...proOwners.map(u => ({ name: u.displayName, email: u.email, date: u.createdAt?.toDate?.(), group: 'Pro Owner' })),
      ...basicOwners.map(u => ({ name: u.displayName, email: u.email, date: u.createdAt?.toDate?.(), group: 'Basic Owner' }))
    ];

    if (allEmails.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-mail-bulk"></i><h3>No contacts yet</h3><p>Emails will appear here when players subscribe or owners register.</p></div>';
      return;
    }

    const sections = [
      { title: 'Players', icon: 'fa-user', data: subscribers.map(s => ({ name: s.name, email: s.email, date: s.subscribedAt?.toDate?.() })) },
      { title: 'Pro Owners', icon: 'fa-crown', accent: true, data: proOwners.map(u => ({ name: u.displayName, email: u.email, date: u.createdAt?.toDate?.() })) },
      { title: 'Basic Owners', icon: 'fa-user', data: basicOwners.map(u => ({ name: u.displayName, email: u.email, date: u.createdAt?.toDate?.() })) }
    ];

    container.innerHTML = sections.map(section => `
      <div style="background:var(--white);border-radius:var(--radius);box-shadow:var(--card-shadow);overflow:hidden;margin-bottom:20px">
        <div style="padding:14px 16px;background:${section.accent ? 'var(--accent)' : 'var(--primary)'};color:white;display:flex;justify-content:space-between;align-items:center">
          <strong><i class="fas ${section.icon}"></i> ${section.title}</strong>
          <span style="font-size:12px;opacity:0.9">${section.data.length}</span>
        </div>
        ${section.data.length === 0 ? '<p style="padding:16px;color:var(--text-muted);font-size:13px">No contacts</p>' : `
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="text-align:left;background:#fafafa">
              <th style="padding:10px 16px">Name</th>
              <th style="padding:10px 16px">Email</th>
              <th style="padding:10px 16px">Since</th>
            </tr>
          </thead>
          <tbody>
            ${section.data.map(d => `
              <tr style="border-bottom:1px solid #f0f0f0">
                <td style="padding:9px 16px">${d.name || '—'}</td>
                <td style="padding:9px 16px">${d.email}</td>
                <td style="padding:9px 16px;color:var(--text-muted)">${d.date ? d.date.toLocaleDateString() : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`}
      </div>
    `).join('') + `
      <p style="font-size:13px;color:var(--text-muted);margin-top:12px">
        ${allEmails.length} total contacts (${subscribers.length} players · ${proOwners.length} pro · ${basicOwners.length} basic)
      </p>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:#d32f2f">Error: ${err.message}</p>`;
  }
}

window.exportMailingList = async function() {
  try {
    const [subscribers, usersSnap] = await Promise.all([
      PickleMailing.getAll(),
      db.collection('users').get()
    ]);

    const proOwners = [];
    const basicOwners = [];
    usersSnap.docs.forEach(doc => {
      const d = doc.data();
      if (d.plan === 'pro') proOwners.push(d);
      else basicOwners.push(d);
    });

    const allContacts = [
      ...subscribers.map(s => ({ name: s.name || '', email: s.email, date: s.subscribedAt?.toDate?.(), group: 'Player' })),
      ...proOwners.map(u => ({ name: u.displayName || '', email: u.email, date: u.createdAt?.toDate?.(), group: 'Pro Owner' })),
      ...basicOwners.map(u => ({ name: u.displayName || '', email: u.email, date: u.createdAt?.toDate?.(), group: 'Basic Owner' }))
    ];

    if (allContacts.length === 0) {
      showToast('No contacts to export.');
      return;
    }

    const rows = [['Name', 'Email', 'Group', 'Date']];
    allContacts.forEach(c => {
      rows.push([c.name, c.email, c.group, c.date ? c.date.toISOString().split('T')[0] : '']);
    });
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mailing-list.csv';
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    showToast('Error exporting: ' + err.message, 4000);
  }
};

// ============================================================
// HELPERS
// ============================================================
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById('dashToast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================================
// MAP PICKER FOR ADD COURT
// ============================================================
function populateDashAddCourtProvinces() {
  const region = document.getElementById('dashCourtRegion').value;
  const provGroup = document.getElementById('dashCourtProvinceGroup');
  const provSelect = document.getElementById('dashCourtProvince');
  const cityGroup = document.getElementById('dashCourtCityGroup');
  const citySelect = document.getElementById('dashCourtCity');

  citySelect.value = '';
  cityGroup.style.display = 'none';
  provSelect.value = '';

  if (!region) {
    provGroup.style.display = 'none';
    return;
  }

  const provinces = PH_LOCATIONS[region] ? Object.keys(PH_LOCATIONS[region]).sort() : [];
  provSelect.innerHTML = '<option value="">Select Province</option>' + provinces.map(p => `<option value="${p}">${p}</option>`).join('');
  provGroup.style.display = 'block';
}

function populateDashAddCourtCities() {
  const region = document.getElementById('dashCourtRegion').value;
  const province = document.getElementById('dashCourtProvince').value;
  const cityGroup = document.getElementById('dashCourtCityGroup');
  const citySelect = document.getElementById('dashCourtCity');

  citySelect.value = '';

  if (!region || !province) {
    cityGroup.style.display = 'none';
    return;
  }

  const cities = PH_LOCATIONS[region] && PH_LOCATIONS[region][province] ? [...PH_LOCATIONS[region][province]].sort() : [];
  citySelect.innerHTML = '<option value="">Select City</option>' + cities.map(c => `<option value="${c}">${c}</option>`).join('');
  cityGroup.style.display = 'block';
}

function populateEditCourtProvinces() {
  const region = document.getElementById('editCourtRegion').value;
  const provGroup = document.getElementById('editCourtProvinceGroup');
  const provSelect = document.getElementById('editCourtProvince');
  const cityGroup = document.getElementById('editCourtCityGroup');
  const citySelect = document.getElementById('editCourtCity');

  citySelect.value = '';
  cityGroup.style.display = 'none';
  provSelect.value = '';

  if (!region) {
    provGroup.style.display = 'none';
    return;
  }

  const provinces = PH_LOCATIONS[region] ? Object.keys(PH_LOCATIONS[region]).sort() : [];
  provSelect.innerHTML = '<option value="">Select Province</option>' + provinces.map(p => `<option value="${p}">${p}</option>`).join('');
  provGroup.style.display = 'block';
}

function populateEditCourtCities() {
  const region = document.getElementById('editCourtRegion').value;
  const province = document.getElementById('editCourtProvince').value;
  const cityGroup = document.getElementById('editCourtCityGroup');
  const citySelect = document.getElementById('editCourtCity');

  citySelect.value = '';

  if (!region || !province) {
    cityGroup.style.display = 'none';
    return;
  }

  const cities = PH_LOCATIONS[region] && PH_LOCATIONS[region][province] ? [...PH_LOCATIONS[region][province]].sort() : [];
  citySelect.innerHTML = '<option value="">Select City</option>' + cities.map(c => `<option value="${c}">${c}</option>`).join('');
  cityGroup.style.display = 'block';
}

function initAddCourtMap() {
  if (addCourtMapInitialized) {
    setTimeout(() => addCourtMap?.invalidateSize(), 100);
    return;
  }

  const container = document.getElementById('addCourtMap');
  if (!container) return;

  addCourtMap = L.map('addCourtMap', { zoomControl: true }).setView([12.8797, 121.7740], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(addCourtMap);

  addCourtMap.on('click', function (e) {
    placeMarker(e.latlng.lat, e.latlng.lng);
  });

  addCourtMapInitialized = true;
  setTimeout(() => addCourtMap.invalidateSize(), 200);
}

function placeMarker(lat, lng) {
  document.getElementById('dashCourtLat').value = lat.toFixed(4);
  document.getElementById('dashCourtLng').value = lng.toFixed(4);

  if (addCourtMarker) {
    addCourtMarker.setLatLng([lat, lng]);
  } else {
    addCourtMarker = L.marker([lat, lng], { draggable: true }).addTo(addCourtMap);
    addCourtMarker.on('dragend', function () {
      const pos = addCourtMarker.getLatLng();
      document.getElementById('dashCourtLat').value = pos.lat.toFixed(4);
      document.getElementById('dashCourtLng').value = pos.lng.toFixed(4);
    });
  }

  addCourtMap.setView([lat, lng], Math.max(addCourtMap.getZoom(), 12));
}

// ============================================================
// CLAIMS MANAGEMENT (Admin)
// ============================================================
async function loadClaims() {
  const container = document.getElementById('claimsList');
  container.innerHTML = '<p style="color:var(--text-muted)">Loading...</p>';

  try {
    const claims = await PickleClaims.getAll();
    if (!claims.length) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-hand-paper"></i><h3>No claims yet</h3><p>When owners claim courts, they will appear here.</p></div>';
      return;
    }

    const courtIds = [...new Set(claims.filter(c => c.courtId).map(c => c.courtId))];
    const courtNames = {};
    await Promise.all(courtIds.map(async id => {
      try {
        const court = await PickleCourts.getById(id);
        if (court) courtNames[id] = court.name;
      } catch {}
    }));

    container.innerHTML = claims.sort((a, b) => {
      const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta;
    }).map(c => `
      <div style="background:var(--white);border-radius:12px;padding:16px 20px;margin-bottom:12px;box-shadow:var(--card-shadow)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
          <div>
            <strong>${c.name}</strong> · <span style="font-size:12px;color:var(--text-muted)">${c.email}</span>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px">
              📍 ${courtNames[c.courtId] || 'Unknown court'}
              ${c.contact ? `· 📞 ${c.contact}` : ''}
            </div>
            ${c.message ? `<div style="font-size:12px;color:#555;margin-top:6px;padding:8px;background:#f9f9f9;border-radius:6px">${c.message}</div>` : ''}
          </div>
          <span style="font-size:11px;padding:3px 10px;border-radius:10px;font-weight:600;background:${c.status === 'approved' ? '#e8f5e9' : c.status === 'rejected' ? '#ffebee' : '#fff3e0'};color:${c.status === 'approved' ? '#2e7d32' : c.status === 'rejected' ? '#c62828' : '#e65100'}">${c.status}</span>
        </div>
        ${c.status === 'pending' ? `
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn-dash btn-dash-primary" onclick="approveClaim('${c.id}')"><i class="fas fa-check"></i> Approve</button>
          <button class="btn-dash btn-dash-danger" onclick="rejectClaim('${c.id}')"><i class="fas fa-times"></i> Reject</button>
        </div>` : ''}
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:#d32f2f">Error: ${err.message}</p>`;
  }
}

window.approveClaim = async function(claimId) {
  if (!confirm('Approve this claim? The claimant will become the owner and the court will be verified.')) return;
  try {
    const claim = (await PickleClaims.getAll()).find(c => c.id === claimId);
    if (!claim) return;
    const usersSnap = await db.collection('users').where('email', '==', claim.email).get();
    const userId = usersSnap.docs[0]?.id;
    if (!userId) {
      showToast('Claimant must register an account first before approving.', 4000);
      return;
    }
    await PickleClaims.approve(claimId, userId);
    await PickleNotifications.notifyClaimantApproved(claim.email, claim.name, 'their court');
    showToast('Claim approved! Owner notified.');
    loadClaims();
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
};

window.rejectClaim = async function(claimId) {
  if (!confirm('Reject this claim?')) return;
  try {
    await PickleClaims.reject(claimId);
    showToast('Claim rejected.');
    loadClaims();
  } catch (err) {
    showToast('Error: ' + err.message, 4000);
  }
};
