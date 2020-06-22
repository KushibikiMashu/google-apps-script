const LINE_NOTIFY_TOKEN = PropertiesService
  .getScriptProperties()
  .getProperty('LINE_NOTIFY_TOKEN')
const ENDPOINT = 'https://notify-api.line.me/api/notify'

const FROM_ADDRESS = [''].join(' OR ')
const MINUTES_INTERVAL = 5

function main() {
  const notices = fetchNotices()

  if (notices.length === 0) {
    return
  }

  for (const notice of notices) {
    send(notice)
  }
}

function fetchNotices(): string[] {
  const now = Math.floor(new Date().getTime() / 1000)
  const intervalMinutesAgo = now - (60 * MINUTES_INTERVAL)
  const query = `(is:unread from:(${FROM_ADDRESS}) after:${intervalMinutesAgo})`

  const threads: GmailThread[] = GmailApp.search(query)

  if (threads.length === 0) {
    return []
  }

  const mails: GmailMessage[][] = GmailApp.getMessagesForThreads(threads)
  const notices: string[] = []

  for (const messages of mails) {
    const latestMessage: GmailMessage = messages.pop()
    const notice = `
--------------------------------------
件名: ${latestMessage.getSubject()}
受信日: ${latestMessage.getDate().toLocaleString()}
From: ${latestMessage.getFrom()}
--------------------------------------

${latestMessage.getPlainBody().slice(0, 350)}
`
    notices.push(notice)

    latestMessage.markRead()
  }

  return notices
}

function send(notice: string) {
  if (LINE_NOTIFY_TOKEN === null) {
    Logger.log('LINE_NOTIFY_TOKEN is not set.')
    return
  }

  const options: URLFetchRequestOptions = {
    'method': 'POST',
    'headers': {'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`},
    'payload': {'message': notice},
  }

  UrlFetchApp.fetch(ENDPOINT, options)
}
