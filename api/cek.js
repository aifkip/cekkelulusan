const kelulusanData = require('./data/kelulusan.json');

module.exports = (req, res) => {
  // Set Content-Type and basic headers
  res.setHeader('Content-Type', 'application/json');

  // Allow GET only
  if (req.method !== 'GET') {
    return res.status(405).json({
      found: false,
      message: 'Method Not Allowed'
    });
  }

  const id = req.query && req.query.id;

  // Security enforcement: Never expose full dataset if id is missing or invalid
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({
      found: false,
      message: 'ID Kelulusan wajib diisi'
    });
  }

  const targetId = id.trim();
  const record = kelulusanData[targetId];

  if (record) {
    return res.status(200).json({
      found: true,
      data: {
        id: targetId,
        nama: record.nama || '',
        lokasi: record.lokasi || '',
        jabatan: record.jabatan || '',
        prodi: record.prodi || '',
        bidang_studi: record.bidang_studi || '',
        keputusan: record.keputusan || ''
      }
    });
  } else {
    return res.status(404).json({
      found: false,
      message: 'ID Kelulusan tidak ditemukan'
    });
  }
};
