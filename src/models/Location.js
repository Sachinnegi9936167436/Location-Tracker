import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
  lat: Number,
  lon: Number,
  accuracy: Number,
  platform: String,
  screen: String,
  googleMapsUrl: String,
  context: String,
});

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);
