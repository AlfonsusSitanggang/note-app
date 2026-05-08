// Konfigurasi API
const API_URL = 'https://be-rest-alfon-579679620696.us-central1.run.app/api';

// State
let isEditing = false;
let editingId = null;

// DOM Elements
const noteForm = document.getElementById('note-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const notesList = document.getElementById('notes-list');
const loading = document.getElementById('loading');
const toast = document.getElementById('toast');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadNotes);
noteForm.addEventListener('submit', handleSubmit);
cancelBtn.addEventListener('click', resetForm);

// Fungsi untuk menampilkan toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Fungsi untuk memuat semua catatan
async function loadNotes() {
    try {
        loading.style.display = 'block';
        notesList.innerHTML = '';
        
        const response = await fetch(`${API_URL}/notes`);
        const result = await response.json();
        
        loading.style.display = 'none';
        
        if (!result.success || result.data.length === 0) {
            notesList.innerHTML = `
                <div class="empty-state">
                    <p>📭 Belum ada catatan. Buat catatan pertama Anda!</p>
                </div>
            `;
            return;
        }
        
        result.data.forEach(note => {
            const noteCard = createNoteCard(note);
            notesList.appendChild(noteCard);
        });
        
    } catch (error) {
        loading.style.display = 'none';
        showToast('Gagal memuat catatan: ' + error.message, 'error');
    }
}

// Fungsi untuk membuat elemen card catatan
function createNoteCard(note) {
    const div = document.createElement('div');
    div.className = 'note-card';
    
    const date = new Date(note.tanggal_dibuat).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    div.innerHTML = `
        <h3>${escapeHtml(note.judul)}</h3>
        <p>${escapeHtml(note.isi)}</p>
        <div class="note-meta">
            <span>🕐 ${date}</span>
            <div class="note-actions">
                <button class="btn btn-edit" onclick="editNote(${note.id})">✏️ Edit</button>
                <button class="btn btn-delete" onclick="deleteNote(${note.id})">🗑️ Hapus</button>
            </div>
        </div>
    `;
    
    return div;
}

// Fungsi untuk escape HTML (keamanan)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fungsi untuk menangani submit form (tambah/update)
async function handleSubmit(e) {
    e.preventDefault();
    
    const judul = document.getElementById('judul').value.trim();
    const isi = document.getElementById('isi').value.trim();
    
    if (!judul || !isi) {
        showToast('Judul dan isi wajib diisi!', 'error');
        return;
    }
    
    const noteData = { judul, isi };
    
    try {
        let url = `${API_URL}/notes`;
        let method = 'POST';
        
        if (isEditing) {
            url = `${API_URL}/notes/${editingId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noteData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(
                isEditing ? 'Catatan berhasil diupdate!' : 'Catatan berhasil ditambahkan!'
            );
            resetForm();
            loadNotes();
        } else {
            showToast(result.message, 'error');
        }
        
    } catch (error) {
        showToast('Terjadi kesalahan: ' + error.message, 'error');
    }
}

// Fungsi untuk mengedit catatan
async function editNote(id) {
    try {
        const response = await fetch(`${API_URL}/notes/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const note = result.data;
            document.getElementById('note-id').value = note.id;
            document.getElementById('judul').value = note.judul;
            document.getElementById('isi').value = note.isi;
            
            isEditing = true;
            editingId = id;
            formTitle.textContent = '✏️ Edit Catatan';
            submitBtn.textContent = '💾 Update';
            cancelBtn.style.display = 'inline-block';
            
            // Scroll ke form
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        }
        
    } catch (error) {
        showToast('Gagal memuat catatan: ' + error.message, 'error');
    }
}

// Fungsi untuk menghapus catatan
async function deleteNote(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Catatan berhasil dihapus!');
            loadNotes();
        } else {
            showToast(result.message, 'error');
        }
        
    } catch (error) {
        showToast('Gagal menghapus catatan: ' + error.message, 'error');
    }
}

// Fungsi untuk reset form
function resetForm() {
    noteForm.reset();
    document.getElementById('note-id').value = '';
    isEditing = false;
    editingId = null;
    formTitle.textContent = 'Tambah Catatan Baru';
    submitBtn.textContent = '💾 Simpan';
    cancelBtn.style.display = 'none';
}