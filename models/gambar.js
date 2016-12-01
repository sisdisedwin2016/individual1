var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gambarSchema = new Schema({
	asli_berkas: String,
	nama_berkas: String,
	ukuran_berkas: String,
	lokasi_berkas: String,
	mime: String,
	isi_berkas: String
});

module.exports = mongoose.model('gambar', gambarSchema);
