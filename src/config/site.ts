/**
 * Site-wide values that appear in more than one page.
 * Edit here, not in the pages — `train.astro`, `index.astro`,
 * `news.astro` and `Footer.astro` all read from this module.
 */
export const registrationUrl = 'https://forms.gle/hRwYhA1K96wzq28f6';

/**
 * Confirmed live address. The retired `site.yaml` recorded
 * `iiumaikidoclub@gmail.com`, which was a transposition — the club's
 * linktr.ee handle (`aikidoclubiium`) corroborates this spelling.
 */
export const contactEmail = 'aikidoclubiium@gmail.com';

export const training = {
  schedule: 'Every Monday & Thursday',
  time: '9:00 PM - 11:00 PM',
  venue: 'IIUM Female Sport Center',
  campus: 'Gombak Campus',
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3382.013842578987!2d101.73455153762131!3d3.2550022553442135!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc38c41ce1820f%3A0x949e2db0f1bae4f!2sFemale%20Sports%20Complex%2C%20IIUM%20Gombak!5e0!3m2!1sen!2smy!4v1702563385524!5m2!1sen!2smy',
} as const;
