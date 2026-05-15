import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Location from '@/models/Location';

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const data = await req.json();
    const { lat, lon, accuracy, platform, screen, context, visitorId } = data;
    
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'Unknown';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Check if this visitor has been here before
    const existingVisit = await Location.findOne({ visitorId });
    const isReturning = !!existingVisit;
    
    const newLocation = new Location({
      ip,
      userAgent,
      lat,
      lon,
      accuracy,
      platform,
      screen,
      context,
      visitorId,
      isReturning,
      googleMapsUrl: `https://www.google.com/maps?q=${lat},${lon}`
    });


    await newLocation.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Capture Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
