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
    const isLolosAkhir = (record.seleksi_akhir && record.seleksi_akhir.toUpperCase() === 'LOLOS');
    const isLolosAdm = (record.seleksi_administrasi && record.seleksi_administrasi.toLowerCase().includes('lolos') && !record.seleksi_administrasi.toLowerCase().includes('tidak'));

    let statusDetail = 'TIDAK LOLOS SELEKSI ADMINISTRASI';
    if (isLolosAkhir) {
      statusDetail = 'LOLOS SELEKSI AKHIR';
    } else if (isLolosAdm) {
      statusDetail = 'TIDAK LOLOS SELEKSI AKHIR';
    }

    return res.status(200).json({
      found: true,
      data: {
        email: record.email || targetEmail,
        nama: record.nama || '',
        jabatan: record.jabatan || '',
        seleksi_administrasi: record.seleksi_administrasi || '-',
        seleksi_akhir: record.seleksi_akhir || '-',
        status: isLolosAkhir ? 'LOLOS' : 'TIDAK LOLOS',
        status_detail: statusDetail,
        group_wa: record.group_wa && record.group_wa !== '-' ? record.group_wa : null,
        jadwal_wawancara: record.jadwal_wawancara || '-',
        link_zoom: record.link_zoom || '-'
      }
    });
  } else {
    return res.status(404).json({
      found: false,
      message: 'Email tidak ditemukan dalam sistem database seleksi. Pastikan email yang Anda masukkan sudah sesuai saat pendaftaran.'
    });
  }
};
