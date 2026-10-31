/* Static seeds.
   ─ Jaryan's catalogue is taken from https://ilyatabrizi.github.io/jaryan/ (Persian as authored;
     English written for this demo). Its prices, capacities and copy are PLACEHOLDERS there too.
   ─ The other three hosts are SAMPLE hosts, here only so the platform reads as a platform. */

export const jimg = (key, w = 960) => `assets/jaryan/${key}-${w}.webp`;

/* ───────────────────────────────────────────────────────────── categories */
export const CATEGORIES = [
  { id: 'music',    fa: 'موسیقی و شب',  en: 'Music & nights',   img: 'assets/cats/music.webp',  pos: '50% 50%' },
  { id: 'sport',    fa: 'ورزش و حرکت',  en: 'Sport & moving',   img: 'assets/cats/sport.webp',  pos: '50% 50%' },
  { id: 'trips',    fa: 'سفر و طبیعت',  en: 'Trips & outdoors', img: 'assets/cats/travel.webp', pos: '50% 50%' },
  { id: 'workshop', fa: 'ورکشاپ',       en: 'Workshops',        img: jimg('perfume-hands', 480), pos: '40% 40%' },
  { id: 'film',     fa: 'فیلم',         en: 'Film',             img: jimg('movie', 480),         pos: '50% 18%' },
  { id: 'social',   fa: 'دورهمی',       en: 'Social',           img: jimg('summer', 480),        pos: '50% 28%' },
];
export const SUBS = {
  cook:   { fa: 'آشپزی و شیرینی', en: 'Cooking & sweets' },
  scent:  { fa: 'عطر و زیبایی',   en: 'Scent & beauty' },
  craft:  { fa: 'هنر و دست‌سازه', en: 'Art & crafts' },
  film:   { fa: 'فیلم و گفت‌وگو', en: 'Film & talk' },
  social: { fa: 'دورهمی',         en: 'Gatherings' },
};

/* ───────────────────────────────────────────────────────────────── hosts */
export const ME = 'jaryan';           // the host whose studio this demo opens

export const HOSTS = [
  {
    id: 'jaryan', prefix: 'JRN', verified: true, sample: false,
    name: { fa: 'جریان', en: 'Jaryan' },
    handle: 'jaryanplat',
    city: { fa: 'تبریز، ولیعصر', en: 'Tabriz, Valiasr' },
    tagline: { fa: 'رویدادهای خلاقانهٔ تبریز، هر هفته', en: 'Creative events in Tabriz, every week' },
    avatar: 'assets/jaryan/jaryan-icon-192.png',
    cover: 'media/hero-poster.webp', video: 'media/hero.mp4',
    followers: 1284,
    ig: 'https://instagram.com/jaryanplat',
    site: 'https://ilyatabrizi.github.io/jaryan/',
    address: { fa: 'تبریز، خیابان ولیعصر', en: 'Tabriz, Valiasr Street' },
    addressNote: { fa: 'نشانی دقیق و لوکیشن، بعد از ثبت رزرو برایت ارسال می‌شود.', en: 'The exact address and location are sent after you reserve.' },
  },
  {
    id: 'pulse', prefix: 'PLS', verified: true, sample: true, mono: 'P',
    name: { fa: 'Pulse Live', en: 'Pulse Live' },
    handle: 'pulselive.sample',
    city: { fa: 'تبریز', en: 'Tabriz' },
    tagline: { fa: 'شب‌های زنده، صدای تازه', en: 'Live nights, new sound' },
    followers: 18400,
  },
  {
    id: 'stride', prefix: 'STR', verified: true, sample: true, mono: 'S',
    name: { fa: 'Stride Club', en: 'Stride Club' },
    handle: 'strideclub.sample',
    city: { fa: 'تبریز', en: 'Tabriz' },
    tagline: { fa: 'هر هفته یک مسیر تازه', en: 'A new route every week' },
    followers: 9200,
  },
  {
    id: 'atlas', prefix: 'ATL', verified: true, sample: true, mono: 'A',
    name: { fa: 'Atlas Trips', en: 'Atlas Trips' },
    handle: 'atlastrips.sample',
    city: { fa: 'تبریز', en: 'Tabriz' },
    tagline: { fa: 'سفرهای یک‌روزه، آدم‌های تازه', en: 'Day trips, new people' },
    followers: 12700,
  },
];

/* Jaryan's own site copy */
export const ABOUT = {
  fa: [
    'جریان یک پلتفرم رویداد در تبریز است: کارگاه‌های کوتاه، شب‌های فیلم و دورهمی‌هایی که با یک مهارت تازه یا چند آدم تازه تمام می‌شوند.',
    'همه‌چیز در فضای خودمان در ولیعصر برگزار می‌شود. ظرفیت هر برنامه عمداً کوچک نگه داشته می‌شود تا کسی تماشاچی نماند.',
  ],
  en: [
    'Jaryan is an event brand in Tabriz: short workshops, film nights and gatherings that end with a new skill or a few new people.',
    'Everything happens in our own space in Valiasr. We deliberately keep every event small, so nobody ends up a spectator.',
  ],
};
export const FAQ = [
  { q: { fa: 'چطور جا رزرو کنم؟', en: 'How do I reserve a spot?' },
    a: { fa: 'رویداد را باز کن، تعداد نفرات را انتخاب کن و شماره‌ات را بگذار. بلیت در همین اپ ساخته می‌شود و نشانی دقیق برایت ارسال می‌شود.',
         en: 'Open the event, choose the number of guests and enter your number. Your ticket is created in the app and the exact address is sent to you.' } },
  { q: { fa: 'اگر نتوانم بیایم؟', en: "What if I can't make it?" },
    a: { fa: 'تا ۴۸ ساعت قبل از شروع، رزرو بدون کسر برگردانده می‌شود. بعد از آن می‌توانی جایت را به کس دیگری بدهی.',
         en: 'Up to 48 hours before the start, your reservation is refunded in full. After that you can pass your spot to someone else.' } },
  { q: { fa: 'چیزی باید همراهم بیاورم؟', en: 'Do I need to bring anything?' },
    a: { fa: 'نه. همهٔ مواد و ابزار با ماست. فقط لباسی بپوش که از لک ترسی نداشته باشی.',
         en: "No. All materials and tools are on us. Just wear something you don't mind getting stained." } },
  { q: { fa: 'تنها بیایم یا با دوستم؟', en: 'Should I come alone or with a friend?' },
    a: { fa: 'هر دو. بیشتر آدم‌ها تنها می‌آیند و با چند شماره بیرون می‌روند.',
         en: 'Both work. Most people come alone and leave with a few new numbers.' } },
];

/* ──────────────────────────────────────────────────────────────── events */
const LVL = {
  none: { fa: 'بدون پیش‌نیاز', en: 'No prerequisites' },
  all: { fa: 'برای همه', en: 'For everyone' },
  beg: { fa: 'مقدماتی', en: 'Beginner' },
};

export const EVENTS = [
  /* ---------------------------------------------------------------- Jaryan */
  {
    id: 'tiramisu', host: 'jaryan', cat: 'workshop', sub: 'cook', day: 2, from: '17:00', to: '20:00',
    price: 780000, seats: 12, taken: 8, img: 'tiramisu', video: true,
    title: { fa: 'ورکشاپ تیرامیسو', en: 'Tiramisu Workshop' },
    lede: { fa: 'سه ساعت با ماسکارپونه، اسپرسوی تازه و لیدی‌فینگر — و در پایان، ظرف خودت را می‌بری.',
            en: 'Three hours with mascarpone, fresh espresso and ladyfingers — and you take your own dish home.' },
    body: {
      fa: ['تیرامیسو ساده به‌نظر می‌رسد تا وقتی کرم می‌بُرد یا لایه‌ها با هم قاطی می‌شوند. در این ورکشاپ از صفر شروع می‌کنیم: زدن ماسکارپونه تا نقطهٔ درست، دم کردن قهوه‌ای که تلخی‌اش با شیرینی کرم تراز باشد، و لایه‌چینی‌ای که برش تمیز بدهد.',
           'هرکس ایستگاه، ابزار و مواد خودش را دارد. آخر جلسه دو ظرف بسته‌بندی‌شده با خودت می‌بری؛ یکی برای امشب، یکی برای فردا.'],
      en: ['Tiramisu looks easy until the cream splits or the layers run together. We start from zero: whipping mascarpone to just the right point, brewing coffee whose bitterness balances the sweet cream, and layering for a clean slice.',
           'Everyone gets their own station, tools and ingredients. You leave with two boxed portions — one for tonight, one for tomorrow.'],
    },
    learn: {
      fa: ['زدن کرم ماسکارپونه بدون بریدن', 'دم کردن اسپرسو و شربت قهوه', 'لایه‌چینی و گرفتن برش تمیز', 'نگهداری، سِرو و تزیین کاکائو'],
      en: ['Whipping mascarpone cream without splitting it', 'Brewing espresso and coffee syrup', 'Layering for a clean slice', 'Storing, serving and dusting with cocoa'],
    },
    includes: { fa: ['تمام مواد اولیه', 'دو ظرف برای بردن', 'پذیرایی و نوشیدنی'], en: ['All ingredients', 'Two take-home boxes', 'Refreshments and a drink'] },
    level: LVL.none, gallery: ['perfume-table', 'workshop-table', 'summer'],
  },
  {
    id: 'perfume', host: 'jaryan', cat: 'workshop', sub: 'scent', day: 4, from: '16:00', to: '19:00',
    price: 1200000, seats: 10, taken: 7, img: 'perfume-table',
    title: { fa: 'ورکشاپ عطرسازی', en: 'Perfume-Making Workshop' },
    lede: { fa: 'فرمول خودت را می‌نویسی و ۳۰ میلی‌لیتر عطر شخصی می‌سازی که اسمش را خودت می‌گذاری.',
            en: 'You write your own formula and make 30 ml of a personal perfume that you name yourself.' },
    body: {
      fa: ['با هرم بویایی شروع می‌کنیم — نُت سر، نُت قلب، نُت پایه — و با بیش از چهل اسانس آشنا می‌شوی. بعد ترازو و پیپت می‌آید وسط و درصدها را خودت می‌بندی.',
           'هرچه ساختی مال خودت است: فرمول روی برگهٔ خودت ثبت می‌شود تا هر وقت خواستی دوباره سفارشش بدهی.'],
      en: ['We start with the scent pyramid — top, heart and base notes — and meet more than forty essences. Then the scale and pipettes come out and you set the percentages yourself.',
           'Whatever you make is yours: your formula is recorded on your own sheet so you can reorder it any time.'],
    },
    learn: {
      fa: ['هرم بویایی و خانوادهٔ رایحه‌ها', 'کار با ترازو، پیپت و درصدگیری', 'بستن یک فرمول شخصی', 'ماندگاری، رسیدن و نگهداری عطر'],
      en: ['The scent pyramid and fragrance families', 'Working with scale, pipette and percentages', 'Building a personal formula', 'Longevity, sillage and storage'],
    },
    includes: { fa: ['اسانس‌ها و الکل', 'بطری ۳۰ میلی‌لیتری', 'برگهٔ فرمول شخصی'], en: ['Essences and alcohol', '30 ml bottle', 'Personal formula sheet'] },
    level: LVL.none, gallery: ['perfume-hands', 'workshop-table', 'splash-poster'],
  },
  {
    id: 'splash', host: 'jaryan', cat: 'workshop', sub: 'scent', day: 7, from: '11:00', to: '13:00',
    price: 650000, seats: 14, taken: 5, img: 'splash-poster',
    title: { fa: 'بادی اسپلش بهاری', en: 'Spring Body Splash' },
    lede: { fa: 'دو ساعت، دو بطری بادی اسپلش سبک تابستانی با رایحه‌ای که خودت می‌بندی.',
            en: 'Two hours, two bottles of a light summer body splash in a scent you compose.' },
    body: {
      fa: ['نسخهٔ کوتاه و سبکِ کلاس عطرسازی: پایهٔ بادی اسپلش، رایحه‌های مرکباتی و گلی، و دو بطری که همان‌جا پر می‌کنی و می‌بری.',
           'مناسب برای کسی که می‌خواهد اول یک نمونهٔ کوچک از فضای کارگاه بگیرد.'],
      en: ['A short, light version of the perfume class: the body-splash base, citrus and floral notes, and two bottles you fill on the spot and take home.',
           'Good for anyone who wants a small first taste of the workshop space.'],
    },
    learn: {
      fa: ['پایهٔ بادی اسپلش و تفاوتش با عطر', 'ترکیب رایحه‌های سبک', 'پر کردن و برچسب‌زدن بطری'],
      en: ['The body-splash base and how it differs from perfume', 'Blending light scents', 'Filling and labelling a bottle'],
    },
    includes: { fa: ['دو بطری ۱۰۰ میلی‌لیتری', 'تمام مواد', 'برچسب دست‌ساز'], en: ['Two 100 ml bottles', 'All materials', 'Handmade label'] },
    level: LVL.none, gallery: ['perfume-hands', 'perfume-table'],
  },
  {
    id: 'movie', host: 'jaryan', cat: 'film', sub: 'film', day: 5, from: '21:00', to: '23:30',
    price: 180000, seats: 30, taken: 22, img: 'movie',
    title: { fa: 'شب فیلم جریان', en: 'Jaryan Film Night' },
    lede: { fa: 'پرده، پتو، ذرت بوداده و یک گفت‌وگوی کوتاه بعد از تیتراژ.',
            en: 'A screen, blankets, popcorn and a short conversation after the credits.' },
    body: {
      fa: ['هر دو هفته یک فیلم؛ انتخاب فیلم را چند روز قبل در اینستاگرام اعلام می‌کنیم و رأی‌گیری می‌کنیم.',
           'بعد از فیلم بیست دقیقه می‌نشینیم و حرف می‌زنیم. اجباری نیست، ولی معمولاً بهترین بخش شب همین است.'],
      en: ['One film every two weeks; we announce the pick on Instagram a few days ahead and take a vote.',
           'After the film we sit and talk for twenty minutes. It is optional, but it is usually the best part of the night.'],
    },
    learn: { fa: ['فیلم با زیرنویس فارسی', 'گفت‌وگوی آزاد بعد از نمایش', 'پذیرایی سبک'], en: ['Film with Persian subtitles', 'Open conversation after the screening', 'Light refreshments'] },
    includes: { fa: ['ورودی و صندلی', 'ذرت بوداده و نوشیدنی'], en: ['Entry and a seat', 'Popcorn and a drink'] },
    level: LVL.all, gallery: ['workshop-table', 'summer'],
  },
  {
    id: 'balloon', host: 'jaryan', cat: 'workshop', sub: 'craft', day: 9, from: '17:30', to: '19:30',
    price: 490000, seats: 16, taken: 6, img: 'balloon',
    title: { fa: 'گل بادکنکی', en: 'Balloon Flowers' },
    lede: { fa: 'یک دستهٔ گل بادکنکی می‌سازی و با خودت می‌بری — همان که هفتهٔ پیش همه‌جا دیدی.',
            en: 'Make a bouquet of balloon flowers and take it with you — the one you saw everywhere last week.' },
    body: {
      fa: ['پیچ‌ها، گره‌ها و ترتیب رنگ‌ها؛ چیزی که سخت به‌نظر می‌رسد و بعد از ده دقیقه دستت می‌آید.',
           'در پایان یک دستهٔ کامل داری، به‌همراه پمپ کوچک برای دفعه‌های بعد.'],
      en: ['Twists, knots and colour order: it looks hard and clicks after ten minutes.',
           'You finish with a complete bouquet, plus a small pump for next time.'],
    },
    learn: { fa: ['گره و پیچ پایه', 'ساخت گلبرگ و ساقه', 'چیدن دسته و ترکیب رنگ'], en: ['Basic knots and twists', 'Building petals and stems', 'Arranging a bouquet and mixing colours'] },
    includes: { fa: ['بادکنک و پمپ دستی', 'روبان و بسته‌بندی'], en: ['Balloons and a hand pump', 'Ribbon and wrapping'] },
    level: LVL.none, gallery: ['fashion', 'summer'],
  },
  {
    id: 'fashion', host: 'jaryan', cat: 'workshop', sub: 'craft', day: 12, from: '16:00', to: '20:00',
    price: 950000, seats: 10, taken: 8, img: 'fashion',
    title: { fa: 'فشن ایلوستریشن روی بوم', en: 'Fashion Illustration on Canvas' },
    lede: { fa: 'یک فیگور، یک لباس، و بوم ۳۰×۴۰ که با پارچه و مهره تمامش می‌کنی.',
            en: 'One figure, one outfit, and a 30×40 canvas you finish with fabric and beads.' },
    body: {
      fa: ['از تناسبات فیگور مد شروع می‌کنیم، بعد طراحی لباس با ماژیک الکلی، و در آخر بخش دوست‌داشتنی کار: چسباندن پارچه، تور و مهره روی بوم.',
           'بوم را همان شب می‌بری. بیشتر آدم‌ها همان‌جا تصمیم می‌گیرند دومی را هم بسازند.'],
      en: ['We start with fashion-figure proportions, then design the outfit with alcohol markers, and finish with the best part: gluing fabric, tulle and beads onto the canvas.',
           'You take the canvas home that night. Most people decide on the spot to make a second one.'],
    },
    learn: { fa: ['تناسبات فیگور مد', 'کار با ماژیک الکلی', 'کلاژ پارچه و مهره', 'ترکیب‌بندی روی بوم'], en: ['Fashion figure proportions', 'Working with alcohol markers', 'Fabric and bead collage', 'Composing on canvas'] },
    includes: { fa: ['بوم ۳۰×۴۰', 'ماژیک، پارچه و مهره', 'پذیرایی'], en: ['30×40 canvas', 'Markers, fabric and beads', 'Refreshments'] },
    level: LVL.beg, gallery: ['balloon', 'perfume-table'],
  },
  {
    id: 'summer', host: 'jaryan', cat: 'social', sub: 'social', day: 14, from: '18:00', to: '21:00',
    price: 1450000, seats: 20, taken: 4, img: 'summer', wide: 'workshop-table',
    title: { fa: 'سامر ورکشاپ جریان', en: 'Jaryan Summer Workshop' },
    lede: { fa: 'یک بعدازظهر کامل: سه ایستگاه کوتاه، موسیقی، و آدم‌هایی که تا حالا ندیده‌ای.',
            en: "A full afternoon: three short stations, music, and people you haven't met yet." },
    body: {
      fa: ['بزرگ‌ترین برنامهٔ فصل. سه ایستگاه پشت سر هم — یک نوشیدنی، یک دست‌سازه، یک عکس — و بین‌شان وقت برای نشستن و حرف زدن.',
           'ظرفیت محدود است و معمولاً یک هفته قبل پر می‌شود.'],
      en: ['The biggest event of the season. Three stations back to back — a drink, a craft, a photo — with time between them to sit and talk.',
           'Capacity is limited and it usually fills a week ahead.'],
    },
    learn: { fa: ['سه ایستگاه کارگاهی کوتاه', 'دی‌جی و موسیقی زنده', 'عکاسی و پرینت فوری'], en: ['Three short workshop stations', 'DJ and live music', 'Photography and instant prints'] },
    includes: { fa: ['ورودی سه ایستگاه', 'نوشیدنی و پذیرایی', 'پرینت عکس'], en: ['Entry to all three stations', 'Drinks and refreshments', 'A printed photo'] },
    level: LVL.all, gallery: ['workshop-table', 'movie', 'balloon'],
  },
  /* past — so the host page, the ticket archive and the studio have a history */
  {
    id: 'perfume-4', host: 'jaryan', cat: 'workshop', sub: 'scent', day: -9, from: '16:00', to: '19:00',
    price: 1200000, seats: 10, taken: 10, img: 'perfume-hands',
    title: { fa: 'عطرسازی — دورهٔ چهارم', en: 'Perfume Making — 4th Edition' },
    lede: { fa: 'دورهٔ چهارم عطرسازی، پر شد و برگزار شد.', en: 'The 4th edition of the perfume class — sold out and held.' },
    body: { fa: ['همان ساختار دورهٔ جاری. دورهٔ بعدی در تقویم است.'], en: ['Same structure as the current edition. The next one is on the calendar.'] },
    learn: { fa: ['هرم بویایی', 'درصدگیری', 'فرمول شخصی'], en: ['The scent pyramid', 'Percentages', 'A personal formula'] },
    includes: { fa: ['اسانس‌ها', 'بطری ۳۰ میلی‌لیتری'], en: ['Essences', '30 ml bottle'] },
    level: LVL.none, gallery: ['perfume-table', 'workshop-table'],
  },
  {
    id: 'gathering', host: 'jaryan', cat: 'social', sub: 'social', day: -21, from: '18:30', to: '22:00',
    price: 350000, seats: 24, taken: 24, img: 'workshop-table',
    title: { fa: 'دورهمی تابستانی جریان', en: 'Jaryan Summer Gathering' },
    lede: { fa: 'اولین دورهمی فصل — پر شد و برگزار شد.', en: 'The first gathering of the season — sold out and held.' },
    body: { fa: ['یک میز بلند، آدم‌های تازه، و کارگاه کوتاه عطر.'], en: ['One long table, new people, and a short perfume workshop.'] },
    learn: { fa: ['کارگاه کوتاه', 'شام سبک'], en: ['A short workshop', 'A light dinner'] },
    includes: { fa: ['ورودی', 'پذیرایی'], en: ['Entry', 'Refreshments'] },
    level: LVL.all, gallery: ['perfume-hands', 'summer'],
  },

  /* ------------------------------------------------------- sample hosts */
  {
    id: 'rooftop', host: 'pulse', cat: 'music', day: 0, from: '21:00', to: '00:00',
    price: 450000, seats: 160, taken: 118, bloom: true,
    title: { fa: 'روف‌تاپ سشنز', en: 'Rooftop Sessions' },
    lede: { fa: 'یک شب، یک پشت‌بام، گروه زنده و غروب تبریز.', en: 'One night, one rooftop, a live band and the Tabriz sunset.' },
    body: { fa: ['اجرای زنده از ساعت ۲۱ شروع می‌شود؛ قبلش یک ست آکوستیک آرام و بار پشت‌بام باز است.', 'ظرفیت پشت‌بام محدود است و ورود فقط با بلیت.'],
            en: ['The live set starts at 21:00, with a quiet acoustic opening and the rooftop bar open before it.', 'Rooftop capacity is limited and entry is by ticket only.'] },
    learn: { fa: ['اجرای زندهٔ گروه', 'ست آکوستیک افتتاحیه', 'بار پشت‌بام'], en: ['Live band set', 'Acoustic opening set', 'Rooftop bar'] },
    includes: { fa: ['ورود', 'یک نوشیدنی خوشامد'], en: ['Entry', 'A welcome drink'] }, level: LVL.all, gallery: [],
  },
  {
    id: 'indie', host: 'pulse', cat: 'music', day: 8, from: '20:30', to: '23:30',
    price: 380000, seats: 220, taken: 96, bloom: true,
    title: { fa: 'شب ایندی', en: 'Indie Night' },
    lede: { fa: 'سه گروه مستقل، یک شب، بدون ردیف صندلی — فقط صدا.', en: 'Three independent bands, one night, no seating rows — just sound.' },
    body: { fa: ['سه اجرای ۴۰ دقیقه‌ای پشت سر هم و وقت کوتاه بین‌شان برای نفس تازه کردن.'], en: ['Three 40-minute sets back to back, with short breaks in between to catch your breath.'] },
    learn: { fa: ['سه گروه مستقل', 'فضای ایستاده', 'غرفهٔ نوشیدنی'], en: ['Three independent bands', 'Standing room', 'Drinks stand'] },
    includes: { fa: ['ورود'], en: ['Entry'] }, level: LVL.all, gallery: [],
  },
  {
    id: 'sunrise10k', host: 'stride', cat: 'sport', day: 1, from: '06:30', to: '09:00',
    price: 120000, seats: 120, taken: 74, bloom: true,
    title: { fa: 'ده کیلومتر طلوع', en: 'Sunrise 10K' },
    lede: { fa: 'ده کیلومتر کنار هم، با طلوع خورشید. سرعت مهم نیست.', en: 'Ten kilometres together at sunrise. Pace does not matter.' },
    body: { fa: ['گروه‌های سرعتی از ۵:۳۰ تا ۷:۰۰ دقیقه بر کیلومتر. پایان مسیر صبحانهٔ سبک.'], en: ['Pace groups from 5:30 to 7:00 min/km, and a light breakfast at the finish.'] },
    learn: { fa: ['گروه‌های سرعتی', 'ایستگاه آب', 'صبحانهٔ پایان مسیر'], en: ['Pace groups', 'Water station', 'Finish-line breakfast'] },
    includes: { fa: ['شمارهٔ بیب', 'آب و میوه'], en: ['Race bib', 'Water and fruit'] }, level: LVL.all, gallery: [],
  },
  {
    id: 'trail', host: 'stride', cat: 'sport', day: 6, from: '07:00', to: '10:30',
    price: 250000, seats: 60, taken: 31, bloom: true,
    title: { fa: 'تریل‌ران تپه‌های عینالی', en: 'Trail Run: Eynali Hills' },
    lede: { fa: 'مسیر کوهستانی ۸ کیلومتری با راهنما و گروه‌های سرعتی.', en: 'An 8 km hill route with a guide and pace groups.' },
    body: { fa: ['شیب ملایم تا متوسط، مناسب کسی که ده کیلومتر دویده است.'], en: ['Gentle to moderate climbs, suited to anyone who has run ten kilometres.'] },
    learn: { fa: ['راهنمای مسیر', 'گروه‌های سرعتی', 'عکس گروهی در قله'], en: ['Route guide', 'Pace groups', 'Summit group photo'] },
    includes: { fa: ['راهنما', 'آب و میوه'], en: ['Guide', 'Water and fruit'] }, level: LVL.beg, gallery: [],
  },
  {
    id: 'kandovan', host: 'atlas', cat: 'trips', day: 10, from: '07:00', to: '19:00',
    price: 1100000, seats: 24, taken: 17, bloom: true,
    title: { fa: 'سفر یک‌روزه کندوان', en: 'Kandovan Day Trip' },
    lede: { fa: 'خانه‌های صخره‌ای، ناهار محلی و یک روز بیرون از شهر.', en: 'Rock-cut houses, a local lunch and a day outside the city.' },
    body: { fa: ['حرکت صبح از تبریز با مینی‌بوس، قدم زدن در روستا، ناهار و بازگشت عصر.'], en: ['Leave Tabriz by minibus in the morning, walk the village, have lunch and return in the evening.'] },
    learn: { fa: ['گشت روستا با راهنمای محلی', 'ناهار محلی', 'وقت آزاد برای عکاسی'], en: ['Village walk with a local guide', 'Local lunch', 'Free time for photos'] },
    includes: { fa: ['رفت‌وآمد با مینی‌بوس', 'ناهار', 'راهنما'], en: ['Minibus transfer', 'Lunch', 'Guide'] }, level: LVL.all, gallery: [],
  },
  {
    id: 'arasbaran', host: 'atlas', cat: 'trips', day: 17, from: '07:00', to: '20:00',
    price: 1650000, seats: 16, taken: 5, bloom: true,
    title: { fa: 'یک روز در جنگل ارسباران', en: 'A Day in Arasbaran Forest' },
    lede: { fa: 'پیاده‌روی در جنگل، پیک‌نیک و یک شب‌نشینی کوتاه با چای.', en: 'A forest walk, a picnic and a short evening with tea.' },
    body: { fa: ['گروه کوچک، مسیر آرام. همهٔ وسایل پیک‌نیک با ماست.'], en: ['A small group on a gentle route. We bring everything for the picnic.'] },
    learn: { fa: ['پیاده‌روی ۶ کیلومتری', 'پیک‌نیک', 'چای عصرانه'], en: ['6 km walk', 'Picnic', 'Afternoon tea'] },
    includes: { fa: ['رفت‌وآمد', 'ناهار پیک‌نیکی', 'راهنما'], en: ['Transfer', 'Picnic lunch', 'Guide'] }, level: LVL.all, gallery: [],
  },
];

export const GALLERY = ['tiramisu', 'perfume-table', 'perfume-hands', 'splash-poster', 'movie', 'balloon', 'fashion', 'summer', 'workshop-table'];

/* ─────────────────────────────────────────────────── Jaryan's audience (CRM) */
/* Twenty customers + ten engagers. The first six are the door list from Jaryan's own host board. */
const N = [
  ['نگار ع.', 'Negar A.'], ['سارینا م.', 'Sarina M.'], ['الناز ر.', 'Elnaz R.'], ['مهسا ک.', 'Mahsa K.'], ['آیدا ب.', 'Aida B.'], ['ترانه ف.', 'Taraneh F.'],
  ['نیلوفر س.', 'Niloofar S.'], ['ریحانه ح.', 'Reyhaneh H.'], ['پریسا ن.', 'Parisa N.'], ['مریم ق.', 'Maryam Gh.'], ['سحر ا.', 'Sahar E.'], ['هانیه ز.', 'Hanieh Z.'],
  ['یاسمن د.', 'Yasaman D.'], ['کیانا ت.', 'Kiana T.'], ['امیر ر.', 'Amir R.'], ['بهار ج.', 'Bahar J.'], ['ندا و.', 'Neda V.'], ['سینا ک.', 'Sina K.'], ['آرزو ی.', 'Arezoo Y.'], ['شبنم پ.', 'Shabnam P.'],
  /* engagers: follow, save, react — haven't booked yet */
  ['پگاه ل.', 'Pegah L.'], ['رها ش.', 'Raha Sh.'], ['فاطمه م.', 'Fatemeh M.'], ['آرش ف.', 'Arash F.'], ['مهدی ع.', 'Mahdi A.'],
  ['دانیال ب.', 'Danial B.'], ['نازنین گ.', 'Nazanin G.'], ['الهام ص.', 'Elham S.'], ['ستاره ن.', 'Setareh N.'], ['مینا ر.', 'Mina R.'],
];
const SRC = ['ig', 'ig', 'went', 'ig', 'ref', 'went', 'ig', 'walk', 'went', 'ig', 'ref', 'went', 'ig', 'went', 'ig', 'ref', 'went', 'ig', 'went', 'ig'];
const PRE = ['0914', '0912', '0935', '0914', '0910', '0914', '0919', '0914'];

function mk(i) {
  const h = (i * 2654435761) >>> 0;
  const digits = String(1000000 + (((i + 3) * 2246822519) >>> 0) % 8999999);
  return {
    id: 'c' + (i + 1),
    name: { fa: N[i][0], en: N[i][1] },
    phone: PRE[i % PRE.length] + digits,
    src: i < 20 ? SRC[i] : (['ig', 'went', 'ig', 'went', 'ig', 'ig', 'went', 'ig', 'went', 'ig'][i - 20]),
    eng: i >= 20,
    joined: 4 + ((h >>> 8) % 70),                // days ago they first appeared
    follows: i >= 20 ? true : ((h >>> 4) % 10) < 7,
    saves: i >= 20 ? 1 + ((h >>> 12) % 4) : (h >>> 12) % 3,
  };
}
export const CONTACTS = N.map((_, i) => mk(i));

/* the six on Jaryan's own door list for the next event (sum of qty = 8 = tiramisu.taken) */
export const DOOR = [
  { c: 'c1', qty: 2, paid: true, code: 'JRN-4821', ago: 1 },
  { c: 'c2', qty: 1, paid: true, code: 'JRN-5107', ago: 2 },
  { c: 'c3', qty: 1, paid: true, code: 'JRN-3390', ago: 0 },
  { c: 'c4', qty: 2, paid: false, code: 'JRN-6642', ago: 0 },
  { c: 'c5', qty: 1, paid: true, code: 'JRN-2874', ago: 3 },
  { c: 'c6', qty: 1, paid: true, code: 'JRN-9015', ago: 5 },
];

export const TAGS = [
  { id: 'regular', fa: 'مشتری ثابت', en: 'Regular' },
  { id: 'friends', fa: 'با دوستان می‌آید', en: 'Brings friends' },
  { id: 'scent', fa: 'عاشق عطر', en: 'Perfume fan' },
  { id: 'sweet', fa: 'شیرینی‌دوست', en: 'Sweet tooth' },
  { id: 'film', fa: 'فیلم‌بین', en: 'Film buff' },
  { id: 'vipnote', fa: 'دعوت ویژه', en: 'Invite first' },
];
export const SEED_TAGS = { c1: ['regular', 'friends'], c2: ['scent'], c7: ['scent', 'regular'], c9: ['sweet'], c15: ['film'], c3: ['regular'] };
export const SEED_NOTES = { c1: { fa: 'همیشه با دو نفر می‌آید. دورهٔ بعدی عطرسازی را خبر بده.', en: 'Always comes with a friend. Tell her about the next perfume edition.' } };

export const SOURCES = {
  ig: { fa: 'اینستاگرام', en: 'Instagram' },
  went: { fa: 'Went to Event', en: 'Went to Event' },
  ref: { fa: 'معرفی دوستان', en: 'Referral' },
  walk: { fa: 'حضوری', en: 'Walk-in' },
};
