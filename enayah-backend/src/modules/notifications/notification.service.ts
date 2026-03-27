export const notify = async ({
  title,
  message,
  recipients,
}: {
  title: string
  message: string
  recipients: string[]
}) => {
  // 🔥 Replace later with:
  // - Email
  // - SMS
  // - In-app notifications

  console.log('🔔 NOTIFICATION')
  console.log('TITLE:', title)
  console.log('MESSAGE:', message)
  console.log('RECIPIENTS:', recipients)
}
