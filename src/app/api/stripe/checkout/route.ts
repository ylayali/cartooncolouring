import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDatabases } from '@/lib/appwrite-server';
import { getPackageById } from '@/lib/credit-packages';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    console.log('=== Stripe Checkout API Called ===');
    
    const { userId, packageId } = await request.json();
    console.log('Request data:', { userId, packageId });

    if (!userId) {
      console.error('Missing userId');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!packageId) {
      console.error('Missing packageId');
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    // Get the selected package
    const selectedPackage = getPackageById(packageId);
    console.log('Selected package:', selectedPackage);
    
    if (!selectedPackage) {
      console.error('Invalid package ID:', packageId);
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      );
    }

    // Verify user exists in our database
    console.log('Fetching user profile from Appwrite...');
    const databases = await getDatabases();
    const profile = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID!,
      userId
    );

    if (!profile) {
      console.error('User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log('User found:', profile.email);

    // Create Stripe checkout session
    console.log('Creating Stripe checkout session...');
    console.log('Stripe key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${selectedPackage.name} - ${selectedPackage.credits} Credits`,
              description: selectedPackage.description,
            },
            unit_amount: selectedPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/`,
      customer_email: profile.email,
      metadata: {
        userId: userId,
        credits: selectedPackage.credits.toString(),
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
      },
    });

    console.log('Stripe session created successfully:', session.id);
    console.log('Checkout URL:', session.url);
    
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('=== Stripe Checkout Error ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : error);
    console.error('Full error:', error);
    
    // Send detailed error to client
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: errorMessage,
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      },
      { status: 500 }
    );
  }
}
