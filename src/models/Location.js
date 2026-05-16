import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
  deviceVendor: String,
  deviceModel: String,
  lat: Number,
  lon: Number,
  accuracy: Number,
  platform: String,
  screen: String,
  visitorId: String,
  isReturning: { type: Boolean, default: false },
  googleMapsUrl: String,
  context: String,
});


export default mongoose.models.Location || mongoose.model('Location', LocationSchema);
