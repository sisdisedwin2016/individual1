var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var nasabahSchema = new Schema({
	nasabah_id: String,
	name: String,
	ip_domisili: String,
	balance: Number,
	last_update: { type: Date, default: Date.now },
	created_at: String
});

module.exports = mongoose.model('nasabah', nasabahSchema);