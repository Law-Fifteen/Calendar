import type { BookingRequest } from '@/types'

export function sendBookingEmail(booking: BookingRequest): void {
  const subject = encodeURIComponent(
    `Meeting Request: ${booking.duration} min on ${formatDate(booking.date)}`
  )

  const body = encodeURIComponent(
    [
      `Hi Morgan,`,
      ``,
      `I'd like to schedule a ${booking.duration}-minute meeting.`,
      ``,
      `Date: ${formatDate(booking.date)}`,
      `Time: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`,
      `Duration: ${booking.duration} minutes`,
      ``,
      `Name: ${booking.name}`,
      `Email: ${booking.email}`,
      ``,
      booking.notes ? `Notes: ${booking.notes}` : '',
      ``,
      `Please confirm availability.`,
      ``,
      `Best,`,
      `${booking.name}`,
    ]
      .filter(Boolean)
      .join('\n')
  )

  window.open(`mailto:MorganAmbrose@proton.me?subject=${subject}&body=${body}`, '_blank')
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
