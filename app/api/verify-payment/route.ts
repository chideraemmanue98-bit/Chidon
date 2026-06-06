// @ts-nocheck
import { NextResponse } from 'next/server';

/**
 * PRODUCTION-READY BACKEND VERIFICATION HANDLER (Next.js App Router Syntax)
 * 
 * Target Location: /app/api/verify-payment/route.ts
 * 
 * Requirement 4: environment variables configuration guidelines
 * - Add PAYSTACK_SECRET_KEY to Vercel/Netlify environment variables for backend (NO NEXT_PUBLIC_ PREFIX).
 * - This secret key must never appear in frontend/public client-side codes.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { status: 'failed', error: 'Reference parameter is required' },
        { status: 400 }
      );
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.error("CRITICAL CONFIGURATION ERROR: PAYSTACK_SECRET_KEY environment variable is not set on the server.");
      return NextResponse.json(
        { status: 'failed', error: 'Payment gateway secret is not configured' },
        { status: 500 }
      );
    }

    // Call the Paystack transaction verification API (Secret Key role only)
    const apiResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      }
    });

    const verifyData = await apiResponse.json();

    if (!apiResponse.ok || !verifyData.status) {
      console.error("Paystack transaction verification check failed:", verifyData);
      return NextResponse.json(
        { status: 'failed', error: verifyData.message || 'Verification rejected by Paystack' },
        { status: 400 }
      );
    }

    // Capture success state and details safely
    if (verifyData.data && verifyData.data.status === 'success') {
      const centsAmount = verifyData.data.amount;
      const emailAddress = verifyData.data.customer?.email || '';
      
      console.log(`Payment verify successfully! Email: ${emailAddress}, Subunit cents loaded: ${centsAmount}`);
      
      return NextResponse.json({
        status: 'success',
        amount: centsAmount,
        email: emailAddress
      });
    }

    // Returns status failed if payment status on Paystack matches aborted / invalid sessions
    console.warn("Reference authorized but payment status corresponds to uncompleted checkout state.");
    return NextResponse.json({ status: 'failed' });

  } catch (error: any) {
    console.error("Unhandled error occurring in security payment verification process:", error);
    return NextResponse.json(
      { status: 'failed', error: error.message || 'Internal payment processing server error' },
      { status: 500 }
    );
  }
}
