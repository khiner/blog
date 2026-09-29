import config from 'config'
import 'style/MailChimpEmailSignup.css'

export default function MailChimpEmailSignup() {
  return (
    <form className="email-signup" action={config.mailChimpFormAction} method="post" target="_blank" noValidate>
      <label htmlFor="signup-email">I'll email you about new posts</label>
      <input type="email" name="EMAIL" id="signup-email" placeholder="email address" required />
      <div className="signup-honeypot" aria-hidden="true">
        <input type="text" name={config.mailChimpInputName} tabIndex={-1} />
      </div>
      <button type="submit" name="subscribe" value="Subscribe">
        Subscribe
      </button>
    </form>
  )
}
