export default {
  // `siteName` is used for the main site title in the nav, prepended to browser tab names for each route,
  // and for titles in site metadata used by crawlers.
  siteName: 'Karl Hiner',
  // `shareName` is an optional different name to use in share posts. Defaults to `siteName` value.
  shareName: "Karl's Blog",
  // If you have a Disqus account, find your shortname under /admin/settings/general.
  // Populate this and add a `disqusId` to each post you'd like to embed a Disqus comment section at the bottom.
  disqusShortname: 'karlhiner',
  // The full qualified hostname where this site will live.
  // Without this field, all sharing links & disqus comments will be excluded.
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
      href: 'https://www.linkedin.com/in/karl-hiner-9534b333',
    },
  ],
  // Fill in your handle to include in Twitter share links
  twitterHandle: 'odangludo',
  // If you have a MailChimp list, find these in the generated embed forms at
  // https://us17.admin.mailchimp.com/lists/integration/embeddedcode
  // to include a formatted 'Subscribe' link and dropdown in the top nav
  mailChimpFormAction:
    'https://karlhiner.us17.list-manage.com/subscribe/post?u=c0cc0feba9f4a6a66942e7edb&amp;id=7025b14ea8',
  mailChimpInputName: 'b_c0cc0feba9f4a6a66942e7edb_7025b14ea8',
  // Change the 'Subscribe' link to a 'Share & Subscribe' link with share icons?
  // (Or add a 'Share' link if no mailChimp fields populated)
  showShareNavItem: false,
  // Should entries go in a collapsable sidebar instead of in the main nav?
  // (Useful if you have many top-level entry sections)
  entriesInSidebar: true,
}
