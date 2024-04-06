export default {
  // `siteName` is used for the main site title in the nav, prepended to browser tab names for each route,
  // and for titles in site metadata used by crawlers.
  siteName: 'karlhiner.com',
  // The full qualified hostname where this site will live.
  host: 'https://karlhiner.com',
  // Include this for a 'Contact' link on the right of the top nav.
  email: 'karl.hiner@gmail.com',
  // Optionally provide a list of { label: '...', href: '...' } pairs to display as simple links pulled right in the nav
  topLevelLinks: [
    {
      label: 'GitHub',
      href: 'https://github.com/khiner',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/karl-hiner',
    },
  ],
  // If you have a MailChimp list, find these in the generated embed forms at
  // https://us17.admin.mailchimp.com/lists/integration/embeddedcode
  // to include a formatted 'Subscribe' link and dropdown in the top nav
  mailChimpFormAction:
    'https://karlhiner.us17.list-manage.com/subscribe/post?u=c0cc0feba9f4a6a66942e7edb&amp;id=7025b14ea8',
  mailChimpInputName: 'b_c0cc0feba9f4a6a66942e7edb_7025b14ea8',
  // Should entries go in a collapsable sidebar instead of in the main nav?
  // (Useful if you have many top-level entry sections)
  entriesInSidebar: true,
}
