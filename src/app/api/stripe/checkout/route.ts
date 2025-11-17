import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDatabases } from '@/lib/appwrite-server';
import { getPackageById } from '@/lib/credit-packages';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { userId, packageId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    // Get the selected package
    const selectedPackage = getPackageById(packageId);
    
    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      );
    }

    // Verify user exists in our database
    const databases = await getDatabases();
    const profile = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID!,
      userId
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create Stripe checkout session
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

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
