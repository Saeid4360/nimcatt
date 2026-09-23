(() => {
  const published = '۱ مهر ۱۴۰۵';
  const article = (item) => ({
    country: 'international', cat: 'news', flag: '🌍 جهان', lang: 'فارسی', time: published,
    cred: 'بازنویسی تحریریه · منبع شفاف', credClass: 'trusted',
    imageSettings: { placement: 'hero', size: 'full', ratio: '16x9', align: 'center' },
    why: 'این مطلب بازنویسی فارسی تحریریه نیمکت بر پایه منابع لینک‌شده است. خبرهای نقل‌وانتقالاتی تا زمان اعلام رسمی، گزارش رسانه‌ای محسوب می‌شوند و آمارها به زمان انتشار منبع مربوط‌اند.',
    ...item,
  });

  const items = [
    article({
      id: 'analysis-barcelona-camp-nou-debt-2026', country: 'spain', cat: 'analysis', flag: '🇪🇸 اسپانیا', eyebrow: 'صورت‌حساب سنگین اسپای بارسا',
      title: '۲٫۶ میلیارد یورو روی دوش بارسا؛ نیوکمپ چگونه باشگاه را دوباره آواره می‌کند؟',
      summary: 'بارسلونا برای تکمیل بازسازی نیوکمپ یک وام تازه ۵۱۰ میلیون یورویی گرفته و احتمال دارد در سال ۲۰۲۷ دوباره به ورزشگاه المپیک مونتجوئیک برگردد.',
      source: 'L’Équipe و ESPN · تحلیل نیمکت',
      image: 'https://medias.lequipe.fr/img-photo-png/-/1500000000833469/0-828-552-75/0cb67.png',
      url: 'https://www.lequipe.fr/Football/Actualites/Le-fc-barcelone-devrait-a-nouveau-quitter-le-camp-nou-pour-achever-la-reconstruction-qui-pourrait-faire-exploser-la-dette-jusqu-a-2-6-milliards-d-euros/1720647',
      tags: ['بارسلونا','نیوکمپ','اقتصاد فوتبال','مونتجوئیک'],
      metrics: [{value:'۵۱۰ میلیون یورو',label:'وام تازه گزارش‌شده برای پروژه'},{value:'۲٫۶ میلیارد یورو',label:'سقف احتمالی بدهی کل'},{value:'۲۰۲۷',label:'زمان احتمالی خروج موقت دوباره'}],
      body: [
        {heading:'بازگشت به خانه، اما نه برای همیشه',text:'بازگشایی نیوکمپ پایان پروژه نیست. طبق گزارش L’Équipe، نصب سقف و تکمیل بخش‌های اصلی ممکن است بارسلونا را مجبور کند بخشی از فصل ۲۸–۲۰۲۷ را دوباره در ورزشگاه المپیک مونتجوئیک برگزار کند. این جابه‌جایی فقط مسئله ورزشی نیست؛ ظرفیت، درآمد روز مسابقه و تجربه هواداران را نیز تغییر می‌دهد.'},
        {heading:'وام تازه و بدهی‌ای که بزرگ‌تر می‌شود',text:'باشگاه برای ادامه عملیات، وام تازه‌ای به ارزش ۵۱۰ میلیون یورو گرفته است. با اضافه‌شدن این تعهد، بدهی از مرز دو میلیارد یورو عبور می‌کند و در سناریوی پرهزینه‌تر می‌تواند به حدود ۲٫۶ میلیارد برسد. این رقم به‌معنای ورشکستگی فوری نیست، اما انعطاف مالی سال‌های آینده را محدود می‌کند.'},
        {heading:'ریسک اصلی کجاست؟',text:'منطق پروژه روشن است: نیوکمپ مدرن باید در بلندمدت درآمد بسیار بیشتری تولید کند. خطر زمانی شکل می‌گیرد که تأخیر ساخت، هزینه وام و درآمد کمتر از انتظار هم‌زمان شوند. بارسلونا برای عبور از این مرحله به برنامه زمانی قابل‌اعتماد، کنترل هزینه و شفافیت درباره بازپرداخت نیاز دارد؛ نه فقط وعده درآمدهای آینده.'}
      ],
      sources: [
        {title:'L’Équipe؛ گزارش وام تازه، خروج احتمالی و بدهی پروژه نیوکمپ',url:'https://www.lequipe.fr/Football/Actualites/Le-fc-barcelone-devrait-a-nouveau-quitter-le-camp-nou-pour-achever-la-reconstruction-qui-pourrait-faire-exploser-la-dette-jusqu-a-2-6-milliards-d-euros/1720647'},
        {title:'Barça Blaugranes به نقل از ESPN؛ بازگشت احتمالی به مونتجوئیک',url:'https://www.barcablaugranes.com/barcelona-la-liga/133192/olympic-stadium-several-months-next-season'}
      ]
    }),
    article({
      id: 'analysis-man-city-leaky-defence-2026', country: 'england', cat: 'analysis', flag: '🏴 انگلیس', eyebrow: 'هشدار پشت رکورد صددرصدی',
      title: 'دفاع سوراخ منچسترسیتی زیر ذره‌بین؛ صدرنشینی‌ای که بوی خطر می‌دهد',
      summary: 'پنج برد از پنج بازی، سیتی را در صدر نگه داشته؛ اما پیروزی ۵–۳ برابر ساندرلند دوباره نشان داد که ساختار دفاعی تیم هنوز قابل اتکا نیست.',
      source: 'Opta Analyst · تحلیل داده نیمکت',
      image: 'https://deweb-519a7.b-cdn.net/post-images/94796d4b-0084-49b4-b0ad-3f9f07ac46ee.jpeg',
      url: 'https://theanalyst.com/articles/manchester-city-defence-stats-goals-conceded-premier-league-title-race',
      tags: ['منچسترسیتی','لیگ برتر انگلیس','تحلیل آماری','دفاع'],
      metrics: [{value:'۵ از ۵',label:'بردهای سیتی در شروع لیگ'},{value:'۵–۳',label:'برد پرهزینه مقابل ساندرلند'},{value:'صدر جدول',label:'جایگاه با وجود نگرانی دفاعی'}],
      body: [
        {heading:'نتیجه عالی، فرایند نگران‌کننده',text:'رکورد صددرصدی معمولاً نشانه قدرت است، اما Opta Analyst میان نتیجه و کیفیت دفاعی سیتی فاصله می‌بیند. تیم می‌تواند مسابقه را با مالکیت و قدرت گل‌زنی نجات دهد، ولی تعداد موقعیت‌هایی که پس از ازدست‌رفتن توپ به حریف می‌دهد برای یک مدعی قهرمانی زیاد است.'},
        {heading:'فضای پشت حمله',text:'وقتی فول‌بک‌ها و هافبک‌ها هم‌زمان جلو می‌روند، نخستین دوئل پس از لو رفتن توپ حیاتی می‌شود. شکست در همان برخورد، مدافعان میانی را در زمین بزرگ و برابر مهاجمان دونده تنها می‌گذارد. بازی هشت‌گله با ساندرلند نمایشی اغراق‌شده از همین مشکل بود.'},
        {heading:'چرا این ضعف در مسابقات بزرگ گران تمام می‌شود؟',text:'تیم‌های بزرگ‌تر به اندازه ساندرلند فرصت‌ها را هدر نمی‌دهند و بهتر می‌توانند برتری زودهنگام را مدیریت کنند. سیتی برای حفظ مدعی‌بودن باید فاصله خطوط را کوتاه‌تر و حفاظت مقابل ضدحمله را منظم‌تر کند. صدر جدول فعلاً مسئله را پنهان کرده است؛ تقویم دشوارتر آن را آشکار خواهد کرد.'}
      ],
      sources: [
        {title:'Opta Analyst؛ تحلیل آماری مشکلات دفاعی منچسترسیتی',url:'https://theanalyst.com/articles/manchester-city-defence-stats-goals-conceded-premier-league-title-race'},
        {title:'City Xtra؛ واکنش پل مرسون به نمایش دفاعی برابر ساندرلند',url:'https://cityxtra.co.uk/CITYXTRA/news/no-way-they-win-the-premier-league---paul-merson-questions-manchester-citys-title-credentials-after-sunderland-chaos'}
      ]
    }),
    article({
      id: 'news-kane-ballon-dor-favourite-2026', country: 'germany', flag: '🇩🇪 آلمان', eyebrow: 'بازار توپ طلا تکان نخورد',
      title: 'تور رسانه‌ای امباپه بی‌اثر ماند؛ هری کین همچنان مرد اول توپ طلاست',
      summary: 'با وجود تلاش رسانه‌ای امباپه برای برجسته‌کردن پرونده فردی‌اش، ارزیابی تازه بازار شرط‌بندی و رتبه‌بندی کارشناسان هنوز هری کین را در موقعیت نخست می‌بیند.',
      source: 'RMC Sport و CBS Sports · بازنویسی نیمکت',
      image: 'https://sportshub.cbsistatic.com/i/2026/09/23/0c3029c2-70b8-4ccc-87d1-9032d15519f0/harry-kane.jpg',
      url: 'https://rmcsport.bfmtv.com/football/ballon-d-or/ballon-d-or-2026-kane-toujours-grand-favori-la-tournee-mediatique-de-mbappe-sans-effet-chez-les-bookmakers_AV-202609230399.html',
      tags: ['هری کین','کیلیان امباپه','توپ طلا','بایرن مونیخ'],
      body: [
        {heading:'کین هنوز جلوتر است',text:'RMC Sport گزارش داده که بازار شرط‌بندی پس از مصاحبه‌ها و حضور رسانه‌ای امباپه تغییر تعیین‌کننده‌ای نکرده و هری کین همچنان گزینه اصلی است. رتبه‌بندی CBS Sports نیز کین را در صدر و ویتینیا و مایکل اولیسه را نزدیک‌ترین تعقیب‌کنندگان قرار می‌دهد.'},
        {heading:'دو پرونده با دو منطق متفاوت',text:'امباپه روی حجم گل‌ها و برتری فردی تأکید می‌کند؛ کین علاوه بر اعداد شخصی، از روایت یک فصل کامل‌تر سود می‌برد. رأی‌دهندگان الزاماً از ضرایب شرط‌بندی پیروی نمی‌کنند، اما بازار نشان می‌دهد موج رسانه‌ای به‌تنهایی نتوانسته برداشت عمومی را عوض کند.'},
        {heading:'آخرین تصویر مهم‌تر از آخرین مصاحبه',text:'توپ طلا جایزه‌ای آماری محض نیست و خاطره بازی‌های بزرگ وزن زیادی دارد. هر مسابقه ملی یا باشگاهی تازه می‌تواند فاصله مدعیان را جابه‌جا کند. برای امباپه، مسیر بازگشت به صدر از زمین می‌گذرد؛ برای کین، چالش اصلی حفظ جایگاهی است که اکنون همه برای گرفتنش می‌آیند.'}
      ],
      sources: [
        {title:'RMC Sport؛ هری کین همچنان محبوب بازار برای توپ طلا',url:'https://rmcsport.bfmtv.com/football/ballon-d-or/ballon-d-or-2026-kane-toujours-grand-favori-la-tournee-mediatique-de-mbappe-sans-effet-chez-les-bookmakers_AV-202609230399.html'},
        {title:'CBS Sports؛ رتبه‌بندی مدعیان توپ طلای ۲۰۲۶',url:'https://www.cbssports.com/soccer/news/ballon-dor-power-rankings-harry-kanes-vitinha-michael-olise-2026/'}
      ]
    }),
    article({
      id: 'news-deschamps-next-job-2026', country: 'france', flag: '🇫🇷 فرانسه', eyebrow: 'دو ماه پس از پایان عصر فرانسه',
      title: 'دشان بدون تیم، با پیشنهاد عربستان؛ مقصد بعدی قهرمان جهان کجاست؟',
      summary: 'دیدیه دشان پس از ترک تیم ملی فرانسه هنوز قرارداد تازه‌ای امضا نکرده است؛ پیشنهادهایی از عربستان دارد، اما یک فصل استراحت نیز گزینه‌ای جدی محسوب می‌شود.',
      source: 'RMC Sport و GFFN · بازنویسی نیمکت',
      image: 'https://io-fsly-bfmtv.cdn.nextradiotv.com/FCuOdNyf-Fi0SJqrKSfGmWziSv0=/0x106:2048x1258/800x0/images/Zidane-Castilla-1437570.jpg',
      url: 'https://rmcsport.bfmtv.com/football/transferts/approches-de-l-arabie-saoudite-saison-blanche-quel-avenir-pour-didier-deschamps-deux-mois-apres-son-depart-de-l-equipe-de-france_AV-202609230400.html',
      tags: ['دیدیه دشان','فرانسه','عربستان','مربیان'],
      body: [
        {heading:'بازار بزرگ، انتخاب محدود',text:'دو ماه پس از پایان قراردادش با فرانسه، دشان هنوز به نیمکت تازه‌ای نرسیده است. RMC Sport از رویکردهایی از سوی فوتبال عربستان خبر داده، اما علاقه الزاماً به مذاکره پیشرفته یا توافق تبدیل نشده است. اعتبار دشان بالاست و همین موضوع انتخاب بعدی را حساس‌تر می‌کند.'},
        {heading:'چرا استراحت منطقی است؟',text:'هدایت طولانی یک تیم ملی بزرگ، فرسایش ذهنی و رسانه‌ای زیادی دارد. GFFN نیز احتمال یک دوره استراحت را مطرح کرده است. یک فصل دوری می‌تواند به دشان فرصت دهد مقصدی را انتخاب کند که از نظر پروژه و اختیار فنی مناسب باشد، نه فقط اولین پیشنهاد مالی.'},
        {heading:'باشگاه یا تیم ملی؟',text:'بازگشت به فوتبال باشگاهی، دشان را دوباره وارد چرخه روزانه تمرین و بازار نقل‌وانتقالات می‌کند؛ انتخاب یک تیم ملی دیگر، مدل کاری آشناتری دارد. تا زمانی که مذاکره رسمی تأیید نشود، عربستان فقط یکی از مسیرهاست. تصمیم بعدی او احتمالاً باید تعریف تازه‌ای از دوران پس از فرانسه ارائه کند.'}
      ],
      sources: [
        {title:'RMC Sport؛ پیشنهادهای عربستان و آینده دشان',url:'https://rmcsport.bfmtv.com/football/transferts/approches-de-l-arabie-saoudite-saison-blanche-quel-avenir-pour-didier-deschamps-deux-mois-apres-son-depart-de-l-equipe-de-france_AV-202609230400.html'},
        {title:'Get French Football News؛ احتمال استراحت یک‌ساله دشان',url:'https://www.getfootballnewsfrance.com/2026/former-france-manager-didier-deschamps-may-take-a-sabbatical/'}
      ]
    }),
    article({
      id: 'news-ronaldo-1000-goals-portugal-2026', country: 'portugal', flag: '🇵🇹 پرتغال', eyebrow: 'پایان هنوز نزدیک نیست',
      title: 'رونالدو در ۴۱سالگی کوتاه نمی‌آید؛ عملیات رسیدن به گل شماره ۱۰۰۰',
      summary: 'کریستیانو رونالدو با وجود انتقادهای پس از جام جهانی تصمیم گرفته به حضور در تیم ملی پرتغال ادامه دهد و هدف هزار گل دوران حرفه‌ای را دنبال کند.',
      source: 'De Telegraaf · بازنویسی نیمکت',
      image: 'https://prod-img.telegraaf.nl/public/incoming/y80cc2-file87psnn301g91l3a7ssik/alternates/BASE_SIXTEEN_NINE/file87psnn301g91l3a7ssik',
      url: 'https://www.telegraaf.nl/sport/voetbal/cristiano-ronaldo-41-negeert-alle-kritiek-gaat-door-bij-portugal-en-wil-de-grens-van-1000-goals-doorbreken/161784549.html',
      tags: ['کریستیانو رونالدو','پرتغال','رکورد گل','تیم ملی'],
      metrics: [{value:'۴۱ سال',label:'سن رونالدو در زمان گزارش'},{value:'۱۰۰۰ گل',label:'هدف اعلام‌شده دوران حرفه‌ای'}],
      body: [
        {heading:'ادامه برخلاف موج انتقاد',text:'De Telegraaf گزارش داده رونالدو قصد ندارد پس از جام جهانی از تیم ملی کنار برود. تصمیم او در ۴۱سالگی یعنی رقابت برای دقایق بازی و پذیرش نقشی که ممکن است همیشه مشابه گذشته نباشد. هدف شخصی روشن است: عبور از مرز هزار گل رسمی در فوتبال حرفه‌ای.'},
        {heading:'رکورد فردی و نیاز جمعی',text:'پرتغال باید میان استفاده از تجربه و آماده‌کردن نسل بعد تعادل بسازد. رونالدو هنوز می‌تواند در محوطه جریمه، ضربات ایستگاهی و لحظات پرفشار مؤثر باشد؛ اما ادامه حضورش زمانی ارزش بیشتری دارد که شکل بازی تیم را به یک نفر محدود نکند.'},
        {heading:'مسابقه با زمان',text:'هر مصدومیت یا افت فرم در این سن هزینه بیشتری دارد و برنامه بازی‌ها باید دقیق مدیریت شود. رسیدن به هزار گل فقط به اراده وابسته نیست؛ به تعداد مسابقات، کیفیت هم‌تیمی‌ها و استمرار بدنی نیاز دارد. همین عدم قطعیت، تعقیب این رکورد را جذاب‌تر می‌کند.'}
      ],
      sources: [{title:'De Telegraaf؛ تصمیم رونالدو برای ادامه با پرتغال و تعقیب هزار گل',url:'https://www.telegraaf.nl/sport/voetbal/cristiano-ronaldo-41-negeert-alle-kritiek-gaat-door-bij-portugal-en-wil-de-grens-van-1000-goals-doorbreken/161784549.html'}]
    }),
    article({
      id: 'transfer-alaba-udinese-2026', country: 'italy', cat: 'transfer', flag: '🇮🇹 ایتالیا', eyebrow: 'چرخش غیرمنتظره در بازار آزاد',
      title: 'آلابا از مادرید تا اودینه؛ توافق عجیبی که کسی انتظارش را نداشت',
      summary: 'چند رسانه ایتالیایی از توافق شفاهی داوید آلابا با اودینزه خبر داده‌اند؛ مدافع ۳۳ساله پس از پایان قراردادش با رئال مادرید بازیکن آزاد است.',
      source: 'Football Italia و Fabrizio Romano · بازنویسی نیمکت',
      image: 'https://www.juventusnews24.com/wp-content/uploads/2026/06/Alaba.jpg',
      url: 'https://football-italia.net/alaba-ex-real-madrid-star-agreement-udinese/',
      tags: ['داوید آلابا','اودینزه','رئال مادرید','نقل‌وانتقالات'],
      metrics: [{value:'۳۳ سال',label:'سن آلابا'},{value:'۱۴ بازی',label:'حضور گزارش‌شده در فصل آخر رئال'},{value:'بازیکن آزاد',label:'وضعیت قراردادی'}],
      body: [
        {heading:'توافق شفاهی، نه رونمایی رسمی',text:'Football Italia به نقل از فابریتزیو رومانو نوشته آلابا با اودینزه به توافق رسیده و به امضای قرارداد نزدیک است. رسانه‌های هلندی و ایتالیایی نیز این مسیر را تأیید کرده‌اند، اما تا انتشار بیانیه باشگاه باید آن را توافق گزارش‌شده دانست.'},
        {heading:'چرا اودینزه؟',text:'آلابا پس از فصل دشوار و مصدومیت‌های متعدد، به تیمی نیاز دارد که نقش روشن و زمان بازی قابل مدیریت ارائه کند. برای اودینزه، جذب بازیکنی با تجربه رئال، بایرن و مسابقات ملی می‌تواند کیفیت بازی‌سازی از عقب و رهبری رختکن را بالا ببرد.'},
        {heading:'ریسک بدنی معامله',text:'نام بزرگ به‌تنهایی تضمین عملکرد نیست. آلابا در فصل آخر فقط ۱۴ بازی در تمام رقابت‌ها انجام داد و باشگاه باید وضعیت جسمانی و بار تمرینی او را دقیق مدیریت کند. اگر بدنش اجازه دهد، این انتقال می‌تواند یکی از هوشمندانه‌ترین خریدهای آزاد سری‌آ باشد.'}
      ],
      sources: [
        {title:'Football Italia؛ گزارش توافق آلابا و اودینزه',url:'https://football-italia.net/alaba-ex-real-madrid-star-agreement-udinese/'},
        {title:'VoetbalPrimeur؛ گزارش توافق شفاهی آلابا',url:'https://www.voetbalprimeur.nl/nieuws/2138847/fabrizio-romano-heeft-nieuws-david-alaba-bereikt-mondeling-akkoord-in-serie-a.html'}
      ]
    }),
    article({
      id: 'transfer-juventus-neto-palmisani-2026', country: 'italy', cat: 'transfer', flag: '🇮🇹 ایتالیا', eyebrow: 'دو برنامه برای یک دروازه',
      title: 'یوونتوس دست به دامان نتو؛ راه‌حل فوری برای دروازه و پروژه‌ای برای آینده',
      summary: 'مصدومیت شدید کمیل گرابارا، یوونتوس را به بازار بازیکنان آزاد برده است؛ نتوی ۳۷ساله گزینه فوری و لورنزو پالمیزانی هدف بلندمدت باشگاه است.',
      source: 'Sky Sport Italia و Football Italia · بازنویسی نیمکت',
      image: 'https://sport.sky.it/assets/images/f99b0342eda84de70daabb64bd83f4dffb258a50/skysport/it/calcio/calciomercato/2026/09/22/calciomercato-juventus-portiere-neto-sergio-rico-palmisani/ipa_neto.jpg',
      url: 'https://football-italia.net/juventus-near-neto-agreement-palmisani-2028/',
      tags: ['یوونتوس','نتو','لورنزو پالمیزانی','نقل‌وانتقالات'],
      metrics: [{value:'۳۷ سال',label:'سن نتو'},{value:'۲۰۰۴',label:'سال تولد پالمیزانی'},{value:'۲۷–۲۰۲۸',label:'افق گزارش‌شده پروژه بلندمدت'}],
      body: [
        {heading:'یک بحران ناگهانی',text:'مصدومیت شدید کمیل گرابارا، عمق دروازه یوونتوس را کاهش داده و باشگاه را بیرون از پنجره نقل‌وانتقالات به سراغ بازیکنان آزاد فرستاده است. Sky Sport Italia می‌گوید تماس‌ها برای بازگرداندن نتو در جریان است؛ دروازه‌بانی باتجربه که قبلاً پیراهن یووه را پوشیده.'},
        {heading:'قراردادی کم‌هزینه با نقش مشخص',text:'گزارش‌های نزدیک به باشگاه از دستمزد کنترل‌شده و توافقی کوتاه‌مدت حرف می‌زنند. نتو قرار نیست پروژه آینده باشد؛ وظیفه‌اش پوشش بحران و ایجاد رقابت تا بازگشت گزینه‌های اصلی است. همین تعریف روشن، ریسک ورزشی معامله را کاهش می‌دهد.'},
        {heading:'چشم یووه به پالمیزانی',text:'هم‌زمان لورنزو پالمیزانی، دروازه‌بان متولد ۲۰۰۴ فروزینونه، برای فصل‌های بعد زیر نظر است. ترکیب این دو مسیر نشان می‌دهد باشگاه اضطرار را از برنامه‌ریزی جدا کرده: تجربه برای امروز، استعداد برای فردا. هیچ‌یک تا اعلام رسمی نهایی محسوب نمی‌شود.'}
      ],
      sources: [
        {title:'Sky Sport Italia؛ تماس یوونتوس با نتو و علاقه به پالمیزانی',url:'https://sport.sky.it/calciomercato/2026/09/22/calciomercato-juventus-portiere-neto-sergio-rico-palmisani'},
        {title:'Football Italia؛ جزئیات برنامه کوتاه‌مدت و بلندمدت یوونتوس',url:'https://football-italia.net/juventus-near-neto-agreement-palmisani-2028/'}
      ]
    }),
    article({
      id: 'news-van-dijk-netherlands-euro-2028-2026', country: 'netherlands', flag: '🇳🇱 هلند', eyebrow: 'کاپیتان با ژاوی ادامه می‌دهد',
      title: 'فن‌دایک فقط ده ثانیه زمان خواست؛ ژاوی چگونه کاپیتان هلند را نگه داشت؟',
      summary: 'ویرجیل فن‌دایک می‌گوید تنها چند ثانیه پس از آغاز گفت‌وگو با ژاوی از اعتماد سرمربی تازه مطمئن شد و تصمیم گرفت دست‌کم تا یورو ۲۰۲۸ ادامه دهد.',
      source: 'Voetbal International و NOS · بازنویسی نیمکت',
      image: 'https://webp.vi.cdn.pxr.nl/news/2026/09/23/a86fac4f1577fe2d72e06f1558b8cdb506974b26.jpg?width=1200',
      url: 'https://www.vi.nl/nieuws/virgil-van-dijk-gaat-door-tot-aan-ek-wist-het-na-tien-seconden',
      tags: ['ویرجیل فن‌دایک','هلند','ژاوی','یورو ۲۰۲۸'],
      metrics: [{value:'۳۵ سال',label:'سن کاپیتان هلند'},{value:'۱۰ ثانیه',label:'زمانی که برای حس اعتماد کافی بود'},{value:'یورو ۲۰۲۸',label:'هدف بعدی فن‌دایک'}],
      body: [
        {heading:'گفت‌وگویی که تردید را تمام کرد',text:'فن‌دایک پس از تغییر کادر فنی درباره ادامه مسیر ملی تصمیم قطعی نداشت. او به Voetbal International گفته در همان ثانیه‌های نخست مکالمه با ژاوی اعتماد سرمربی تازه را احساس کرده و فهمیده هنوز در مرکز پروژه هلند قرار دارد.'},
        {heading:'چرا حفظ او برای ژاوی مهم است؟',text:'پیاده‌کردن فوتبال مالکانه و دفاع رو به جلو بدون مدافعی که زمین پشت خط را کنترل کند پرریسک است. فن‌دایک علاوه بر کیفیت پاس و دوئل، زبان مشترک میان نسل قدیم و بازیکنان تازه خواهد بود. حفظ بازوبند نیز پیام ثبات به رختکن می‌دهد.'},
        {heading:'ادامه مشروط به کیفیت',text:'هدف یورو ۲۰۲۸ به‌معنای جایگاه تضمین‌شده نیست. سن و تقویم فشرده مدیریت دقایق را ضروری می‌کند و هلند باید جانشین‌ها را هم آماده سازد. بهترین سناریو این است که فن‌دایک رهبر دوران انتقال باشد، نه مانعی برای انتقال نسل.'}
      ],
      sources: [
        {title:'Voetbal International؛ تصمیم فن‌دایک برای ادامه تا یورو',url:'https://www.vi.nl/nieuws/virgil-van-dijk-gaat-door-tot-aan-ek-wist-het-na-tien-seconden'},
        {title:'NOS؛ گزارش ادامه همکاری کاپیتان هلند با ژاوی',url:'https://nos.nl/l/2632145'}
      ]
    }),
    article({
      id: 'news-xavi-simons-tottenham-recovery-2026', country: 'england', flag: '🏴 انگلیس', eyebrow: 'بازتوانی طولانی ستاره هلندی',
      title: 'پیام امیدوارکننده ژاوی سیمونز؛ تاتنهام منتظر بازگشت مغز خلاق تیم',
      summary: 'ژاوی سیمونز پس از پارگی رباط صلیبی زانوی راست هنوز از مسابقات دور است، اما می‌گوید هر روز برای بازگشت تمرین می‌کند؛ دی‌زربی او را مهره‌ای بسیار مهم برای آینده تاتنهام می‌داند.',
      source: 'football.london · بازنویسی نیمکت',
      image: 'https://i2-prod.football.london/tottenham-hotspur-fc/news/article34657993.ece/ALTERNATES/s1200/0_Xavi-Simons.jpg',
      url: 'https://www.football.london/tottenham-hotspur-fc/news/xavi-simons-provides-tottenham-injury-34657993',
      tags: ['ژاوی سیمونز','تاتنهام','روبرتو دی‌زربی','مصدومیت'],
      metrics: [{value:'آوریل ۲۰۲۶',label:'زمان پارگی رباط صلیبی'},{value:'۷ بازی',label:'هم‌بازی‌بودن پیشین با ساویو در پی‌اس‌وی'}],
      body: [
        {heading:'این خبر، بازگشت فوری نیست',text:'سیمونز در پایان آوریل رباط صلیبی زانوی راستش را پاره کرد و هنوز برنامه بازتوانی را طی می‌کند. پیام تازه او هنگام خوشامدگویی به ساویو منتشر شد: هر روز سخت تمرین می‌کند و مشتاق است دوباره در کنار دوست قدیمی‌اش وارد زمین شود.'},
        {heading:'مهره‌ای که دی‌زربی کم دارد',text:'تاتنهام در شروع فصل برای اتصال خط میانی به حمله و شکستن دفاع فشرده مشکل داشته است. سیمونز پیش از مصدومیت در نخستین بازی فیکس زیر نظر دی‌زربی یک گل و یک پاس گل ثبت کرد. سرمربی ایتالیایی او و ساویو را دو بازیکن مهم آینده تیم توصیف کرده است.'},
        {heading:'بازگشت باید بدون عجله باشد',text:'پارگی رباط صلیبی فقط مسئله آمادگی هوازی نیست؛ اعتماد در تغییر جهت، دوئل و شتاب‌گیری باید مرحله‌به‌مرحله بازگردد. تاتنهام به خلاقیت او نیاز دارد، اما فشار برای حل فوری مشکلات هجومی نباید برنامه پزشکی را کوتاه کند.'}
      ],
      sources: [
        {title:'football.london؛ پیام ژاوی سیمونز درباره روند بازتوانی',url:'https://www.football.london/tottenham-hotspur-fc/news/xavi-simons-provides-tottenham-injury-34657993'},
        {title:'Spurs Matchday؛ جزئیات مصدومیت و ارزیابی دی‌زربی',url:'https://www.spursmatchday.co.uk/xavi-simons-provides-tottenham-injury-update-ahead-of-charlton-cup-tie/'}
      ]
    }),
    article({
      id: 'news-endrick-real-madrid-minutes-2026', country: 'spain', flag: '🇪🇸 اسپانیا', eyebrow: 'هشدار سرمربی برزیل',
      title: 'آنچلوتی نگران اندریک؛ استعداد برزیلی چرا در رئال مادرید ناپدید شده است؟',
      summary: 'کارلو آنچلوتی از کمبود زمان بازی اندریک در رئال مادرید ابراز نگرانی کرده و از طرح فدراسیون برزیل برای افزایش فرصت جوانان حمایت می‌کند.',
      source: 'RMC Sport · بازنویسی نیمکت',
      image: 'https://io-fsly-bfmtv.cdn.nextradiotv.com/NBMNZdGwt7BduFvPbPxfjdI7OxY=/0x32:2048x1184/800x0/images/Endrick-sur-le-banc-du-Real-Madrid-contre-le-Rayo-Vallecano-4-1-Liga-le-12-septembre-2026-2352985.jpg',
      url: 'https://rmcsport.bfmtv.com/football/equipe-bresil/bresil-le-faible-temps-de-jeu-d-endrick-au-real-madrid-chagrine-carlo-ancelotti_AV-202609230352.html',
      tags: ['اندریک','رئال مادرید','کارلو آنچلوتی','برزیل'],
      body: [
        {heading:'استعداد بدون دقیقه رشد نمی‌کند',text:'آنچلوتی در جایگاه سرمربی برزیل به وضعیتی اشاره کرده که خودش در مادرید به‌خوبی می‌شناسد: جوانان برزیلی خیلی زود راهی اروپا می‌شوند و در رقابت با ستاره‌های آماده، فرصت بازی منظم پیدا نمی‌کنند. اندریک اکنون روشن‌ترین نمونه این نگرانی است.'},
        {heading:'ترافیک خط حمله رئال',text:'کیفیت بالای مهاجمان رئال، هر دقیقه را گران کرده است. تمرین در محیط نخبه مفید است، اما برای مهاجمی جوان جای مسابقه واقعی را نمی‌گیرد؛ جایی که تصمیم‌گیری زیر فشار، زمان‌بندی حرکت و تحمل اشتباه شکل می‌گیرد.'},
        {heading:'سه راه پیش رو',text:'رئال می‌تواند نقش مشخصی در جام‌ها و بازی‌های کم‌فشارتر تعریف کند، در نیم‌فصل مسیر قرضی را بسنجد یا شرایط فعلی را ادامه دهد. برای تیم ملی برزیل، مهم‌ترین معیار نام باشگاه نیست؛ بازیکنی است که با ریتم مسابقه به اردو برسد.'}
      ],
      sources: [{title:'RMC Sport؛ نگرانی آنچلوتی از کمبود زمان بازی اندریک',url:'https://rmcsport.bfmtv.com/football/equipe-bresil/bresil-le-faible-temps-de-jeu-d-endrick-au-real-madrid-chagrine-carlo-ancelotti_AV-202609230352.html'}]
    }),
    article({
      id: 'news-bruno-guimaraes-arsenal-challenge-2026', country: 'england', flag: '🏴 انگلیس', eyebrow: 'روایت هافبک برزیلی از انتقال',
      title: 'برونو گیمارش از راز جدایی از نیوکاسل گفت؛ «به یک چالش تازه نیاز داشتم»',
      summary: 'هافبک برزیلی آرسنال می‌گوید پس از دوران موفق در نیوکاسل به یک چالش تازه نیاز داشت؛ اکنون هدف اصلی‌اش تثبیت نقش خود در تیم قهرمان است.',
      source: 'football.london و L’Équipe · بازنویسی نیمکت',
      image: 'https://i2-prod.football.london/arsenal-fc/news/article34644976.ece/ALTERNATES/s1200/1_Ipswich-Town-v-Arsenal-Carabao-Cup-Third-Round.jpg',
      url: 'https://www.football.london/arsenal-fc/news/arsenal-news-bruno-guimaraes-newcastle-34658171',
      tags: ['برونو گیمارش','آرسنال','نیوکاسل','لیگ برتر انگلیس'],
      body: [
        {heading:'جدایی از منطقه امن',text:'گیمارش در اردوی برزیل توضیح داده که جدایی از نیوکاسل از سر بی‌احترامی نبود؛ او پس از تجربه کاپیتانی و موفقیت در سنت جیمزز پارک، احساس می‌کرد به محیطی تازه برای ادامه رشد نیاز دارد. انتقال به قهرمان لیگ، فشار رقابت را چند برابر کرده است.'},
        {heading:'شروع خوب و یک هشدار',text:'شروع او در آرسنال امیدوارکننده بود، اما بازی دشوار مقابل برایتون نشان داد تجربه لیگ برتر هم سازگاری فوری با ساختار تازه را تضمین نمی‌کند. نقش او کنار دکلان رایس به زمان، شناخت فاصله‌ها و هماهنگی در پوشش ضدحمله نیاز دارد.'},
        {heading:'هدف کوتاه‌مدت روشن است',text:'پیش از فکرکردن به مقصدهای آینده، گیمارش باید در تیمی که برای دفاع از قهرمانی ساخته شده اثر فوری بگذارد. توانایی حمل توپ، پاس رو به جلو و شدت دوئل‌هایش با نیاز آرسنال هم‌خوان است؛ ثبات هفتگی تعیین می‌کند این انتقال یک جهش واقعی بوده یا فقط تغییر پیراهن.'}
      ],
      sources: [
        {title:'football.london؛ گفت‌وگوی گیمارش درباره آرسنال و آینده',url:'https://www.football.london/arsenal-fc/news/arsenal-news-bruno-guimaraes-newcastle-34658171'},
        {title:'L’Équipe؛ توضیح گیمارش درباره نیاز به چالش تازه',url:'https://www.lequipe.fr/Football/Video/Premier-league-arsenal-bruno-guimaraes-sur-son-depart-de-newcastle-cet-ete-pour-rejoindre-arsenal-j-avais-besoin-d-un-nouveau-defi/20241799'}
      ]
    }),
    article({
      id: 'analysis-liverpool-jota-grief-2026', country: 'england', cat: 'analysis', flag: '🏴 انگلیس', eyebrow: 'فصلی که فوتبال اولویت نبود',
      title: 'لیورپول هنوز زیر سایه فقدان ژوتا؛ رابرتسون از زخمی گفت که در آمار دیده نمی‌شود',
      summary: 'اندی رابرتسون می‌گوید مرگ دیوگو ژوتا تأثیری عمیق بر رختکن لیورپول گذاشت و توضیح عملکرد فصل گذشته را نمی‌توان فقط در تاکتیک یا سازگاری خریدهای جدید جست‌وجو کرد.',
      source: 'ESPN، RMC Sport و The Overlap · تحلیل نیمکت',
      image: 'https://a.espncdn.com/photo/2026/0922/r1720463_1296x729_16-9.jpg',
      url: 'https://www.espn.com/soccer/story/_/id/50006711/andy-robertson-liverpool-diogo-jota-premier-league',
      tags: ['لیورپول','دیوگو ژوتا','اندی رابرتسون','فلوریان ویرتس','الکساندر ایساک'],
      body: [
        {heading:'وقتی فوتبال اهمیتش را از دست داد',text:'رابرتسون در گفت‌وگو با The Overlap از مرگ هم‌تیمی‌اش به‌عنوان اتفاقی «هولناک» یاد کرده و گفته بازیکنانی که ژوتا را می‌شناختند برای مدتی به فوتبال اهمیت نمی‌دادند. این روایت، لایه‌ای انسانی به فصل دشوار لیورپول اضافه می‌کند که جدول و داده‌ها قادر به ثبت آن نیستند.'},
        {heading:'فشار روی خریدهای تازه',text:'ایساک و ویرتس در فضایی وارد تیم شدند که از بیرون فقط با معیار قیمت و خروجی سنجیده می‌شد، اما رختکن هنوز درگیر سوگ بود. این توضیح همه ضعف‌های فنی را پاک نمی‌کند؛ فقط نشان می‌دهد سازگاری در چنین محیطی پیچیده‌تر از یادگیری سیستم است.'},
        {heading:'مرز تحلیل و احترام',text:'نقد فوتبالی لازم است، اما استفاده از یک فقدان شخصی برای ساختن علت قطعی هر نتیجه نیز منصفانه نیست. اظهارات رابرتسون باید به‌عنوان تجربه اعضای تیم شنیده شود. لیورپول هم‌زمان به حمایت روانی، زمان و پاسخ‌های فنی دقیق نیاز دارد.'}
      ],
      sources: [
        {title:'ESPN؛ روایت اندی رابرتسون از تأثیر مرگ دیوگو ژوتا',url:'https://www.espn.com/soccer/story/_/id/50006711/andy-robertson-liverpool-diogo-jota-premier-league'},
        {title:'RMC Sport؛ توضیح رابرتسون درباره فصل دشوار لیورپول',url:'https://rmcsport.bfmtv.com/football/premier-league/le-football-nous-importait-peu-comment-la-mort-de-diogo-jota-a-plombe-la-saison-de-liverpool-selon-andy-robertson_AV-202609230324.html'}
      ]
    }),
    article({
      id: 'news-arsenal-sunderland-penalty-panel-2026', country: 'england', flag: '🏴 انگلیس', eyebrow: 'بازبینی تصمیم بحث‌برانگیز',
      title: 'رأی نهایی به سود آرسنال؛ پنالتی ساندرلند نباید اعلام می‌شد',
      summary: 'پنل مستقل بررسی مسابقات لیگ برتر تصمیم داور برای اعلام پنالتی برخورد ازری کونسا و دن بالارد را نادرست دانسته؛ ضربه پنالتی در جریان بازی توسط داوید رایا مهار شد.',
      source: 'football.london و KMI Panel · بازنویسی نیمکت',
      image: 'https://i2-prod.football.london/incoming/article34658450.ece/ALTERNATES/s1200/0_Ezri-Konsa-Dan-Ballard-and-Arsenal.jpg',
      url: 'https://www.football.london/arsenal-fc/news/final-ezri-konsa-sunderland-penalty-34658436',
      tags: ['آرسنال','ساندرلند','داوری','VAR'],
      body: [
        {heading:'صحنه‌ای که بازی را تغییر نداد، اما بحث را عوض کرد',text:'جان بروکس برخورد کونسا و بالارد را پنالتی تشخیص داد و VAR نیز تصمیم زمین را تأیید کرد. داوید رایا ضربه را مهار کرد، بنابراین نتیجه مستقیم تغییر نکرد؛ بااین‌حال میکل آرتتا پس از بازی به‌شدت از ماهیت برخورد انتقاد کرد.'},
        {heading:'چرا پنل با داور مخالف بود؟',text:'ارزیابی نهایی منتشرشده می‌گوید بالارد پیراهن و شانه کونسا را کشید و حرکت مدافع آرسنال بیشتر نتیجه همان درگیری بود تا خطای مستقل. کارشناسان Match of the Day نیز پیش‌تر صحنه را بیشتر شبیه خطا روی کونسا دانسته بودند.'},
        {heading:'درس مهم برای VAR',text:'VAR برای اصلاح خطای واضح طراحی شده، اما معیار بالای مداخله گاهی تصمیم اولیه را حفظ می‌کند حتی وقتی بازبینی بعدی آن را غلط می‌داند. انتشار توضیح پنل شفافیت را بالا می‌برد؛ پرسش بعدی این است که این بازخورد چگونه به تصمیم بهتر در مسابقه بعد تبدیل می‌شود.'}
      ],
      sources: [
        {title:'football.london؛ رأی پنل مستقل درباره پنالتی ساندرلند',url:'https://www.football.london/arsenal-fc/news/final-ezri-konsa-sunderland-penalty-34658436'},
        {title:'The Dugout؛ متن مکالمه داور و VAR و تحلیل صحنه',url:'https://www.thedugout.football/clubs/arsenal/news/aHR0cHM6Ly93d3cuZm9vdGJhbGwubG9uZG9uL2Fyc2VuYWwtZmMvbmV3cy9hcnNlbmFsLWxhdGVzdC1yZWZlcmVlLXRyYW5zY3JpcHQtZW1lcmdlcy0zNDYxMDYyNg'}
      ]
    }),
    article({
      id: 'analysis-zidane-france-first-shape-2026', country: 'france', cat: 'analysis', flag: '🇫🇷 فرانسه', eyebrow: 'اولین طرح زیزو برای خروس‌ها',
      title: 'اولین نشانه‌های فرانسه زیدان؛ تیم جدید خروس‌ها چگونه بازی خواهد کرد؟',
      summary: 'تمرین‌های ابتدایی زین‌الدین زیدان نشانه‌هایی از ساختار چهار دفاعه، کنترل بیشتر میانه زمین و آزادی مهاجمان را نشان می‌دهد؛ اما هنوز برای صدور حکم نهایی زود است.',
      source: 'Le Parisien و GFFN · تحلیل نیمکت',
      image: 'https://io-fsly-bfmtv.cdn.nextradiotv.com/FCuOdNyf-Fi0SJqrKSfGmWziSv0=/0x106:2048x1258/800x0/images/Zidane-Castilla-1437570.jpg',
      url: 'https://www.leparisien.fr/sports/football/equipe-de-france/equipe-de-france-schema-style-de-jeu-comment-zinedine-zidane-va-t-il-faire-evoluer-les-bleus-23-09-2026-B6OMQJA4KFCUXGGIIYJO6PGG5Q.php',
      tags: ['زین‌الدین زیدان','فرانسه','تحلیل تاکتیکی','تیم ملی'],
      body: [
        {heading:'تمرین، نه اعلامیه تاکتیکی',text:'GFFN از نخستین جلسه کامل تمرینی زیدان گزارش داده و Le Parisien نیز شکل احتمالی تیم را بررسی کرده است. آرایش تمرینی سرنخ می‌دهد، اما یازده نفر و نقش‌ها ممکن است با کیفیت حریف تغییر کند؛ بنابراین آنچه دیده شده طرح اولیه است، نه سیستم قطعی.'},
        {heading:'کنترل مرکز و آزادی جلو',text:'منطق آشنای تیم‌های زیدان، حفظ تعادل با چهار مدافع و یک میانه زمین انعطاف‌پذیر است. هافبک‌ها باید هم مسیر پاس به مهاجمان را باز کنند و هم هنگام ازدست‌رفتن توپ پوشش بدهند. در جلو، آزادی جابه‌جایی می‌تواند توان یک‌به‌یک ستاره‌ها را فعال کند.'},
        {heading:'بزرگ‌ترین آزمون: انتخاب',text:'فرانسه کمبود استعداد ندارد؛ مسئله ساختن سلسله‌مراتب و مکمل‌کردن نقش‌هاست. زیدان باید میان شهرت، فرم روز و تعادل تیمی انتخاب کند. نخستین مسابقه‌ها بیش از نتیجه، نشان می‌دهند آیا بازیکنان زبان مشترک تاکتیکی او را سریع فهمیده‌اند یا نه.'}
      ],
      sources: [
        {title:'Le Parisien؛ بررسی آرایش و سبک احتمالی فرانسه زیدان',url:'https://www.leparisien.fr/sports/football/equipe-de-france/equipe-de-france-schema-style-de-jeu-comment-zinedine-zidane-va-t-il-faire-evoluer-les-bleus-23-09-2026-B6OMQJA4KFCUXGGIIYJO6PGG5Q.php'},
        {title:'Get French Football News؛ گزارش نخستین جلسه کامل تمرینی زیدان',url:'https://www.getfootballnewsfrance.com/2026/how-did-france-set-up-in-zinedine-zidanes-first-training-session/'}
      ]
    }),
    article({
      id: 'transfer-arsenal-julian-alvarez-loan-2026', country: 'england', cat: 'transfer', flag: '🏴 انگلیس', eyebrow: 'پرونده ۱۲۸ میلیون پوندی',
      title: 'آرسنال دوباره به سراغ خولیان آلوارس رفت؛ نقشه ژانویه برای مهاجم اتلتیکو',
      summary: 'گزارش‌ها می‌گویند آرسنال ممکن است در ژانویه انتقال قرضی خولیان آلوارس را بررسی کند؛ اتلتیکو در تابستان ارزش او را حدود ۱۲۸ میلیون پوند تعیین کرده بود.',
      source: 'football.london و Evening Standard · بازنویسی نیمکت',
      image: 'https://i2-prod.football.london/incoming/article34657690.ece/ALTERNATES/s1200/0_JS418678057.jpg',
      url: 'https://www.football.london/arsenal-fc/transfer-news/julian-alvarez-transfer-arsenal-barcelona-34657563',
      tags: ['خولیان آلوارس','آرسنال','اتلتیکو مادرید','نقل‌وانتقالات'],
      metrics: [{value:'۱۲۸ میلیون پوند',label:'ارزش‌گذاری گزارش‌شده اتلتیکو'},{value:'۴ بازی',label:'تعداد حضور گزارش‌شده این فصل'},{value:'۰ شروع',label:'حضور در ترکیب اصلی لالیگا'}],
      body: [
        {heading:'از خرید دائمی تا ایده قرضی',text:'football.london به نقل از Evening Standard نوشته آرسنال ممکن است در ژانویه به‌جای خرید سنگین، امکان انتقال قرضی آلوارس را بررسی کند. مهاجم آرژانتینی در شروع فصل چهار بار به میدان رفته اما در لالیگا هنوز فیکس نشده است.'},
        {heading:'گره ۱۲۸ میلیون پوندی',text:'اتلتیکو در تابستان ارزش بازیکن را حدود ۱۲۸ میلیون پوند تعیین کرد و علاقه بارسلونا را نیز پس زد. گزارش دیگری می‌گوید بررسی پنهانی امکان معامله با بارسا خشم مدیران باشگاه را برانگیخته است. این روایت‌ها مذاکره رسمی با آرسنال را ثابت نمی‌کنند.'},
        {heading:'چرا معامله دشوار است؟',text:'قرض‌دادن مهاجمی با این ارزش بدون تضمین خرید برای اتلتیکو جذاب نیست و آرسنال نیز تازه خط حمله‌اش را بازسازی کرده است. مصدومیت عضلانی اخیر و ترجیح احتمالی بازیکن به بارسلونا دو مانع دیگرند. فعلاً این پرونده یک گزینه بازار است، نه انتقال نزدیک.'}
      ],
      sources: [
        {title:'football.london؛ برنامه گزارش‌شده آرسنال برای خولیان آلوارس',url:'https://www.football.london/arsenal-fc/transfer-news/julian-alvarez-transfer-arsenal-barcelona-34657563'},
        {title:'AOL؛ نسخه بازنشرشده گزارش با جزئیات کامل',url:'https://www.aol.co.uk/articles/arsenal-plot-next-julian-alvarez-071230000.html'}
      ]
    }),
    article({
      id: 'analysis-raphinha-number-nine-barcelona-2026', country: 'spain', cat: 'analysis', flag: '🇪🇸 اسپانیا', eyebrow: 'شماره ۹ بدون تغییر شماره',
      title: 'رافینیا در نقش مهاجم نوک؛ راه‌حل اضطراری بارسلونا که می‌تواند رویایی باشد',
      summary: 'هانسی فلیک در هفته‌های اخیر رافینیا را به مرکز خط حمله برده و وینگر برزیلی با گل‌زنی مداوم نشان داده این جابه‌جایی بیش از یک راه‌حل موقت است.',
      source: 'Voetbal International · تحلیل نیمکت',
      image: 'https://webp.vi.cdn.pxr.nl/news/2026/09/21/bf9aa93e158df15b4cff0de276a8575695413152.jpg?width=1200',
      url: 'https://www.vi.nl/pro/noodlossing-raphinha-als-spits-is-een-droomoplossing',
      tags: ['رافینیا','بارسلونا','هانسی فلیک','تحلیل تاکتیکی'],
      body: [
        {heading:'مهاجمی که مثل وینگر فکر می‌کند',text:'قرارگرفتن رافینیا در نوک حمله به‌معنای تبدیل او به مهاجم هدف کلاسیک نیست. او از مرکز به کانال‌ها حرکت می‌کند، مدافع را با خود می‌برد و برای لامین یامال و فرمین لوپس فضا می‌سازد. همین تحرک، خط دفاع حریف را از مرجع ثابت محروم می‌کند.'},
        {heading:'پرس از جلو؛ سود پنهان انتخاب',text:'شدت دویدن و واکنش رافینیا پس از ازدست‌رفتن توپ با خواسته‌های فلیک هماهنگ است. او می‌تواند نخستین مدافع تیم باشد و پاس ابتدایی حریف را به سمت دلخواه هدایت کند. در چنین ساختاری، ارزشش فقط با تعداد گل سنجیده نمی‌شود.'},
        {heading:'محدودیت برابر دفاع فشرده',text:'در مسابقه‌ای که بارسا به حضور فیزیکی در محوطه و بازی هوایی نیاز دارد، این راه‌حل ممکن است کافی نباشد. بااین‌حال انعطاف نقش رافینیا یک گزینه تاکتیکی ارزشمند ساخته است. اضطرار وقتی به راه‌حل رویایی تبدیل می‌شود که مربی بداند کجا و مقابل چه حریفی از آن استفاده کند.'}
      ],
      sources: [{title:'Voetbal International؛ تحلیل بازی رافینیا به‌عنوان مهاجم',url:'https://www.vi.nl/pro/noodlossing-raphinha-als-spits-is-een-droomoplossing'}]
    }),
    article({
      id: 'feature-jamie-vardy-burnley-39-2026', country: 'england', cat: 'feature', flag: '🏴 انگلیس', eyebrow: 'آخرین دویدن مهاجم تمام‌نشدنی',
      title: 'آخرین پیچ جیمی واردی در ۳۹سالگی؛ مهاجمی که هنوز تمام نشده است',
      summary: 'برنلی پس از بسته‌شدن بازار، جیمی واردی ۳۹ساله را به خدمت گرفته؛ قهرمان تاریخی لستر حالا مأمور نجات تنها تیم بدون برد چمپیونشیپ شده است.',
      source: 'Relevo · بازنویسی نیمکت',
      image: 'https://www.relevo.com/wp-content/uploads/2026/09/jamie-vardy-sigue-activo-burnley-championship.jpg',
      url: 'https://www.relevo.com/futbol/jamie-vardy-burnley-championship.html',
      tags: ['جیمی واردی','برنلی','چمپیونشیپ','لستر سیتی'],
      metrics: [{value:'۳۹ سال',label:'سن واردی هنگام پیوستن به برنلی'},{value:'۱۰ سال',label:'فاصله تقریبی از قهرمانی تاریخی با لستر'}],
      body: [
        {heading:'انتقال پس از بسته‌شدن بازار',text:'واردی به‌عنوان بازیکن آزاد محدودیت معمول پنجره نقل‌وانتقالات را نداشت و برنلی پس از بسته‌شدن بازار سراغ او رفت. مقصد ساده نیست: تیمی که هنوز در چمپیونشیپ پیروز نشده و به گل، شخصیت و انرژی فوری نیاز دارد.'},
        {heading:'سرعت کمتر، هوش بیشتر',text:'نسخه ۳۹ساله واردی نمی‌تواند تمام مسابقه را مانند دوران اوج پشت خط دفاع بدود. ارزش تازه او در انتخاب لحظه حرکت، ضربه اول، فشار کوتاه و انتقال تجربه به مهاجمان جوان است. اگر برنلی فاصله تیم را کوتاه نگه دارد، او هنوز می‌تواند در فضاهای کوچک خطرناک باشد.'},
        {heading:'پایان داستان یا یک فصل دیگر؟',text:'این انتقال بر پایه نوستالژی جذاب است، اما باید با خروجی واقعی سنجیده شود. واردی پیش‌تر نشان داده از پیش‌بینی پایان دورانش لذت می‌برد. مأموریت در ترف مور آزمونی مناسب است: نه بازگشت به گذشته، بلکه ساختن نسخه‌ای متناسب با امروز.'}
      ],
      sources: [{title:'Relevo؛ گزارش پیوستن جیمی واردی به برنلی در ۳۹سالگی',url:'https://www.relevo.com/futbol/jamie-vardy-burnley-championship.html'}]
    }),
    article({
      id: 'news-javier-aguirre-valencia-2026', country: 'spain', flag: '🇪🇸 اسپانیا', eyebrow: 'بازگشت ال‌واسکو به لالیگا',
      title: 'آگویره به لالیگا برگشت؛ والنسیا به مربی مکزیکی پناه برد',
      summary: 'والنسیا انتصاب خاویر آگویره را رسمی کرد؛ قرارداد او تا پایان فصل اعتبار دارد و در صورت کسب سهمیه لیگ اروپا می‌تواند یک سال دیگر تمدید شود.',
      source: 'Mundo Deportivo و Valencia CF · بازنویسی نیمکت',
      image: 'https://imagenes2.mundodeportivo.com/files/og_thumbnail/uploads/2026/09/23/6ab39adce9293.jpeg',
      url: 'https://www.mundodeportivo.com/futbol/valencia/20260923/1004230373/oficial-javier-aguirre-nuevo-entrenador-valencia.html',
      tags: ['خاویر آگویره','والنسیا','لالیگا','مربیان'],
      metrics: [{value:'تا پایان فصل',label:'مدت اولیه قرارداد'},{value:'۱ فصل',label:'گزینه تمدید مشروط'},{value:'لیگ اروپا',label:'شرط گزارش‌شده تمدید'}],
      body: [
        {heading:'انتصابی رسمی پس از یک هفته مذاکره',text:'والنسیا ورود خاویر آگویره را تأیید کرده است. مربی مکزیکی پس از حدود یک هفته مذاکره هدایت تیم نخست را تا پایان فصل بر عهده می‌گیرد. برخلاف بسیاری از خبرهای این فهرست، این پرونده شایعه بازار نیست و باشگاه آن را رسمی کرده است.'},
        {heading:'قراردادی که هدف را تعریف می‌کند',text:'طبق گزارش Mundo Deportivo، قرارداد گزینه تمدید یک‌ساله دارد که به کسب سهمیه لیگ اروپا وابسته است. این بند هم جاه‌طلبی باشگاه را نشان می‌دهد و هم ریسک را کنترل می‌کند: آگویره برای ماندن باید پیشرفت را به نتیجه قابل اندازه‌گیری تبدیل کند.'},
        {heading:'اول نظم، بعد رؤیا',text:'تیم‌های آگویره معمولاً سازمان دفاعی، رقابت در دوئل و واقع‌گرایی تاکتیکی دارند. والنسیا پیش از فوتبال تماشایی به ثبات نیاز دارد. اگر او بتواند تیم را از نوسان خارج کند، مسیر سهمیه باز می‌شود؛ در غیر این صورت قرارداد کوتاه راه جدایی کم‌هزینه را حفظ می‌کند.'}
      ],
      sources: [
        {title:'Mundo Deportivo؛ اعلام رسمی خاویر آگویره به‌عنوان سرمربی والنسیا',url:'https://www.mundodeportivo.com/futbol/valencia/20260923/1004230373/oficial-javier-aguirre-nuevo-entrenador-valencia.html'},
        {title:'Tuttomercatoweb؛ مدت قرارداد و گزینه تمدید',url:'https://www.tuttomercatoweb.com/calcio-estero/valencia-javier-aguirre-allenatore-contratto-giugno-opzione-2276576'}
      ]
    })
  ];

  window.HEADLINE_FEATURES = [...items, ...(Array.isArray(window.HEADLINE_FEATURES) ? window.HEADLINE_FEATURES : [])];
})();
