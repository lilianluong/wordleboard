import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTodayWordleNumber } from '@/lib/wordle-date'
import { sendPushNotifications, type NotificationPayload } from '@/lib/push-sender'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const todayWordleNumber = getTodayWordleNumber()

    // Get all users who have push subscriptions.
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh_key, auth_key')

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No users with push subscriptions' })
    }

    // Get all users who have already submitted today's wordle.
    const { data: todaySubmissions, error: submissionsError } = await supabase
      .from('wordle_submissions')
      .select('user_id')
      .eq('wordle_number', todayWordleNumber)

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
    }

    const completedUserIds = new Set(todaySubmissions?.map((s) => s.user_id) || [])

    // Filter subscriptions to only users who haven't submitted.
    const usersToNotify = subscriptions.filter((sub) => !completedUserIds.has(sub.user_id))

    if (usersToNotify.length === 0) {
      return NextResponse.json({ message: 'All users have completed today\'s Wordle' })
    }

    // Send notifications.
    const notification: NotificationPayload = {
      title: `Wordle #${todayWordleNumber} is here!`,
      body: 'Don\'t forget to submit your Wordle today!',
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://wordleboard.vercel.app'}/submit`,
    }

    // Send push notifications to all users who haven't submitted.
    const pushResult = await sendPushNotifications(usersToNotify, notification)

    // Clean up expired subscriptions.
    if (pushResult.expired.length > 0) {
      await Promise.all(
        pushResult.expired.map((expiredId) =>
          supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', expiredId)
        )
      )
    }

    return NextResponse.json({
      message: 'Daily reminders sent',
      todayWordleNumber,
      totalUsersWithSubs: subscriptions.length,
      usersAlreadyCompleted: completedUserIds.size,
      notificationsSent: pushResult.successful.length,
      notificationsFailed: pushResult.failed.length,
      expiredSubscriptions: pushResult.expired.length,
    })
  } catch (error) {
    console.error('Error in daily reminder cron:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
