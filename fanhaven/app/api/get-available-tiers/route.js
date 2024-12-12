// pages/api/get-available-tiers.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // Adjust the path to your dbConnect function
import Tier from '@/models/Tier'; // Adjust the path to your Tier model

export async function GET(request) {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch all tiers from the database
    const tiers = await Tier.find({});

    // Return the list of tiers
    return NextResponse.json(tiers);
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return NextResponse.json({ message: 'Failed to fetch tiers' }, { status: 500 });
  }
}
