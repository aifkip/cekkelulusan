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

  const queryParam = req.query && (req.query.email || req.query.id);

  // Security enforcement: Never expose full dataset if email is missing or invalid
  if (!queryParam || typeof queryParam !== 'string' || queryParam.trim() === '') {
    return res.status(400).json({
      found: false,
      message: 'Alamat email wajib diisi'
    });
  }

  const targetEmail = queryParam.trim().toLowerCase();
  const record = kelulusanData[targetEmail];

  if (record) {
    return res.status(200).json({
      found: true,
      data: {
        email: record.email || targetEmail,
        nama: record.nama || '',
        judul: record.judul || '',
        sel_adm: record.sel_adm || '',
        sel_sub: record.sel_sub || '',
        status: record.status || 'TIDAK LOLOS',
        jabatan: record.jabatan || '',
        lokasi: record.lokasi || '',
        group_wa: record.group_wa || '',
        simpkb: record.simpkb || '',
        no_wa: record.no_wa || '',
        tgl_lahir: record.tgl_lahir || '',
        prodi_s1: record.prodi_s1 || '',
        univ_s1: record.univ_s1 || '',
        bidang_studi: record.bidang_studi || '',
        domisili: record.domisili || ''
      }
    });
  } else {
    return res.status(404).json({
      found: false,
      message: 'Email tidak ditemukan dalam sistem. Pastikan email yang Anda masukkan sudah benar.'
    });
  }
};

