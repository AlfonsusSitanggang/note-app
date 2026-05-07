const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Konfigurasi Database
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Buat connection pool
const pool = mysql.createPool(dbConfig);

// Test koneksi database
app.get('/api/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        res.json({ status: 'OK', message: 'Database terhubung!' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
});

// ==========================================
// CRUD ENDPOINTS
// ==========================================

// 1. GET - Ambil semua catatan
app.get('/api/notes', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM notes ORDER BY tanggal_dibuat DESC'
        );
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 2. GET - Ambil satu catatan berdasarkan ID
app.get('/api/notes/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM notes WHERE id = ?',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Catatan tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 3. POST - Tambah catatan baru
app.post('/api/notes', async (req, res) => {
    try {
        const { judul, isi } = req.body;
        
        if (!judul || !isi) {
            return res.status(400).json({
                success: false,
                message: 'Judul dan isi wajib diisi'
            });
        }
        
        const [result] = await pool.query(
            'INSERT INTO notes (judul, isi, tanggal_dibuat) VALUES (?, ?, NOW())',
            [judul, isi]
        );
        
        res.status(201).json({
            success: true,
            message: 'Catatan berhasil ditambahkan',
            data: {
                id: result.insertId,
                judul,
                isi
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 4. PUT - Update catatan
app.put('/api/notes/:id', async (req, res) => {
    try {
        const { judul, isi } = req.body;
        const { id } = req.params;
        
        if (!judul || !isi) {
            return res.status(400).json({
                success: false,
                message: 'Judul dan isi wajib diisi'
            });
        }
        
        const [result] = await pool.query(
            'UPDATE notes SET judul = ?, isi = ? WHERE id = ?',
            [judul, isi, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Catatan tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            message: 'Catatan berhasil diupdate'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 5. DELETE - Hapus catatan
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM notes WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Catatan tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            message: 'Catatan berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Jalankan server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server berjalan di port ${PORT}`);
    console.log(`📋 Test API: /api/health`);
});

module.exports = app;