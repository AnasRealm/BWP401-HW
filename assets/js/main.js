(function () {
  'use strict';
  var events = window.guideEvents;
  var categories = ['ثقافة', 'تقنية', 'رياضة', 'موسيقى', 'عائلي'];

  // المحتوى النصي يمر من هنا قبل وضعه ضمن قوالب HTML.
  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      var entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
      return entities[character];
    });
  }
  function eventDate(value) {
    return new Intl.DateTimeFormat('ar-SY', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date(value + 'T12:00:00+03:00'));
  }
  function eventTime(value) {
    return new Intl.DateTimeFormat('ar-SY', {hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Damascus'}).format(new Date('2026-11-02T' + value + ':00+03:00'));
  }
  function card(event) {
    var dateNumber = Number(event.date.slice(8));
    return '<div class="col-md-6 col-lg-4"><article class="card event-card">' +
      '<a class="image-link" href="event.html?id=' + event.id + '" aria-label="تفاصيل ' + escapeText(event.title) + '"><img class="card-img-top" src="assets/img/' + event.image + '.jpg" alt="صورة تعبيرية لفعالية ' + escapeText(event.category) + '" width="800" height="500" loading="lazy"><span class="badge badge-category">' + event.category + '</span><span class="card-date">' + dateNumber + '<small>تشرين الثاني</small></span></a>' +
      '<div class="card-body"><div class="card-meta"><time datetime="' + event.date + '">' + eventDate(event.date) + '</time><span class="free-tag">دخول مجاني</span></div>' +
      '<h3 class="card-title"><a href="event.html?id=' + event.id + '">' + event.title + '</a></h3><p class="card-text">' + event.short + '</p><div class="card-place">' + svgIcon('pin') + '<span>' + event.location + '</span><span class="card-time">' + svgIcon('clock') + eventTime(event.time) + '</span></div><div class="card-bottom"><span>نشاط طلابي</span><a href="event.html?id=' + event.id + '">شوف التفاصيل ' + svgIcon('arrow') + '</a></div></div></article></div>';
  }
  function svgIcon(name) {
    var paths = {
      pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
      arrow: '<path d="M20 12H4m6-6-6 6 6 6"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + '</svg>';
  }
  function renderTeam() {
    var lists = document.querySelectorAll('.team-list');
    lists.forEach(function (list) {
      var html = '';
      window.projectTeam.forEach(function (member, index) {
        var portrait = '';
        if (list.dataset.portraits) {
          var image = member.image || 'assets/img/member-' + ((index % 3) + 1) + '.svg';
          var imageAlt = member.image ? 'صورة ' + member.name : 'صورة رمزية لعضو الفريق';
          portrait = '<img src="' + escapeText(image) + '" width="200" height="200" alt="' + escapeText(imageAlt) + '" loading="lazy">';
        }
        html += '<div class="col-md-6 col-lg-3"><article class="member">' + portrait + '<div><h3>' + escapeText(member.name) + '</h3><p class="student-id">المعرّف الجامعي: <bdi dir="ltr">' + escapeText(member.id) + '</bdi></p><p>' + escapeText(member.role) + '</p></div></article></div>';
      });
      list.innerHTML = html;
    });
  }
  function setupHome() {
    var latest = document.getElementById('latest-events');
    if (!latest) { return; }
    // العرض مرتب بحسب أقرب موعد في مجموعة البيانات التجريبية.
    latest.innerHTML = events.slice().sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(0, 6).map(card).join('');
    var featured = events.filter(function (event) { return event.featured; });
    document.getElementById('featured-slides').innerHTML = featured.map(function (event, index) {
      var currentClass = '';
      if (index === 0) { currentClass = ' active'; }
      return '<div class="carousel-item' + currentClass + '"><a class="feature-layout" href="event.html?id=' + event.id + '"><div class="feature-visual"><img class="feature-image" src="assets/img/' + event.image + '.jpg" width="800" height="500" alt="صورة تعبيرية لفعالية ' + event.title + '"><span class="feature-date">' + Number(event.date.slice(8)) + '<small>تشرين الثاني</small></span></div><div class="feature-caption"><span class="feature-kicker">فعالية مميزة <span>•</span> ' + event.category + '</span><h3>' + event.title + '</h3><p>' + event.short + '</p><div class="feature-location">' + svgIcon('pin') + event.location + '<span>·</span>' + eventTime(event.time) + '</div><span class="feature-cta">اكتشف التفاصيل ' + svgIcon('arrow') + '</span></div></a></div>';
    }).join('');
    var slider = document.getElementById('featured-slider');
    if (window.bootstrap) {
      new bootstrap.Carousel(slider, {interval: false, touch: true, keyboard: true});
      slider.addEventListener('slid.bs.carousel', function (event) {
        document.getElementById('slide-count').textContent = (event.to + 1) + ' / ' + featured.length;
      });
    }
  }
  function readPreference() {
    try { return localStorage.getItem('guide-category'); }
    catch (error) { return null; }
  }
  function savePreference(value) {
    try {
      if (value) { localStorage.setItem('guide-category', value); }
      else { localStorage.removeItem('guide-category'); }
    } catch (error) {
      // يمكن إكمال التصفح عندما يمنع المتصفح التخزين المحلي.
    }
  }
  function normalize(value) {
    return value.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/[\u064B-\u065F\u0640]/g, '').trim();
  }
  function setupFilters() {
    var form = document.getElementById('filter-form');
    if (!form) { return; }
    var category = document.getElementById('category');
    var location = document.getElementById('location');
    var date = document.getElementById('date');
    var search = document.getElementById('search');
    var remember = document.getElementById('remember-category');
    var params = new URLSearchParams(window.location.search);
    var saved = readPreference();
    search.value = params.get('search') || '';
    var requestedLocation = params.get('location');
    if (['دمشق', 'حلب', 'حمص', 'عبر الإنترنت'].indexOf(requestedLocation) !== -1) { location.value = requestedLocation; }
    remember.checked = Boolean(saved);
    var initial = params.get('category');
    if (!initial) { initial = saved; }
    if (categories.indexOf(initial) !== -1) { category.value = initial; }
    function applyFilters() {
      var query = normalize(search.value);
      var result = events.filter(function (event) {
        var content = normalize(event.title + ' ' + event.short + ' ' + event.venue + ' ' + event.category);
        var matchesSearch = content.indexOf(query) !== -1;
        var matchesCategory = !category.value || category.value === event.category;
        var matchesLocation = !location.value || location.value === event.location;
        var matchesDate = !date.value || event.date >= date.value;
        return matchesSearch && matchesCategory && matchesLocation && matchesDate;
      });
      result.sort(function (a, b) { return a.date.localeCompare(b.date); });
      document.getElementById('events-list').innerHTML = result.map(card).join('');
      document.getElementById('result-count').textContent = 'عدد الفعاليات: ' + result.length + ' من ' + events.length;
      document.getElementById('empty-events').hidden = result.length !== 0;
      if (remember.checked) { savePreference(category.value); }
      else { savePreference(null); }
    }
    form.addEventListener('input', applyFilters);
    form.addEventListener('change', applyFilters);
    form.addEventListener('submit', function (event) { event.preventDefault(); applyFilters(); });
    form.addEventListener('reset', function () {
      // انتظار إعادة القيم الافتراضية قبل رسم البطاقات.
      window.setTimeout(function () { remember.checked = false; applyFilters(); }, 0);
    });
    document.getElementById('clear-search').addEventListener('click', function () { form.reset(); search.focus(); });
    applyFilters();
  }
  function alertMessage(container, message, type) {
    container.className = 'alert alert-' + type + ' mt-3';
    container.textContent = message;
  }
  function validName(input) {
    var result = input.value.trim().length >= 2 && input.value.trim().length <= 80;
    input.classList.toggle('is-invalid', !result);
    input.setAttribute('aria-invalid', String(!result));
    return result;
  }
  function validEmail(input) {
    var result = input.value.trim().length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()) && input.validity.typeMismatch === false;
    input.classList.toggle('is-invalid', !result);
    input.setAttribute('aria-invalid', String(!result));
    return result;
  }
  function setupContact() {
    var form = document.getElementById('contact-form');
    if (!form) { return; }
    var name = document.getElementById('name');
    var email = document.getElementById('email');
    var message = document.getElementById('message');
    var output = document.getElementById('contact-alert');
    if (new URLSearchParams(window.location.search).get('subject') === 'event') {
      message.value = 'اسم الفعالية: \nالموعد المقترح: \nالمكان: \nوصف الفكرة: ';
    }
    form.addEventListener('input', function (event) {
      event.target.classList.remove('is-invalid');
      event.target.removeAttribute('aria-invalid');
      output.className = 'mt-4';
      output.textContent = '';
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nameOk = validName(name);
      var emailOk = validEmail(email);
      var messageOk = message.value.trim().length >= 10 && message.value.trim().length <= 2000;
      message.classList.toggle('is-invalid', !messageOk);
      message.setAttribute('aria-invalid', String(!messageOk));
      if (!nameOk || !emailOk || !messageOk) {
        alertMessage(output, 'لم تكتمل العملية. راجع الحقول المشار إليها ثم حاول مجدداً.', 'danger');
        form.querySelector('.is-invalid').focus();
        return;
      }
      alertMessage(output, 'تم التحقق من رسالتك بنجاح. هذه تجربة محلية؛ لم يتم إرسال أي بيانات.', 'success');
      form.reset();
      output.focus();
    });
  }
  // توقيت سوريا +03:00؛ يُحوّل الموعد إلى UTC داخل ملف التقويم.
  function calendarStamp(date, time) {
    return new Date(date + 'T' + time + ':00+03:00').toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  }
  function calendarText(value) {
    return value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  }
  function downloadCalendar(event) {
    var rows = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Student Events Guide//BWP401//AR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', 'UID:' + event.id + '@student-guide.example', 'DTSTAMP:' + calendarStamp('2026-11-02', '00:00'), 'DTSTART:' + calendarStamp(event.date, event.time), 'DTEND:' + calendarStamp(event.date, event.end), 'SUMMARY:' + calendarText(event.title), 'LOCATION:' + calendarText(event.venue), 'DESCRIPTION:' + calendarText('فعالية تجريبية للمشروع. ' + event.short), 'END:VEVENT', 'END:VCALENDAR'];
    // طي الأسطر بعد 75 بايت بحسب تنسيق iCalendar، مع مراعاة الحروف العربية.
    var folded = rows.map(function (row) {
      var output = '';
      var bytes = 0;
      Array.from(row).forEach(function (letter) {
        var length = new TextEncoder().encode(letter).length;
        if (bytes + length > 75) { output += '\r\n '; bytes = 1; }
        output += letter;
        bytes += length;
      });
      return output;
    }).join('\r\n') + '\r\n';
    var blob = new Blob([folded], {type: 'text/calendar;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = event.id + '.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function setupEvent() {
    var content = document.getElementById('event-content');
    if (!content) { return; }
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (!id) { id = events[0].id; }
    var event = events.find(function (item) { return item.id === id; });
    if (!event) { document.getElementById('event-missing').hidden = false; return; }
    document.title = event.title + ' | دليل الفعاليات';
    var related = events.filter(function (item) { return item.id !== event.id && item.category === event.category; });
    if (related.length < 3) {
      events.forEach(function (item) {
        if (related.length < 3 && item.id !== event.id && related.indexOf(item) === -1) { related.push(item); }
      });
    }
    var agenda = event.agenda.map(function (item) { return '<li>' + item + '</li>'; }).join('');
    content.innerHTML = '<section class="container"><img class="event-cover" src="assets/img/' + event.image + '.jpg" width="800" height="500" alt="صورة تعبيرية لفعالية ' + event.title + '"><div class="event-heading"><span class="badge">' + event.category + '</span><h1>' + event.title + '</h1><p class="lead">' + event.short + '</p></div></section>' +
      '<section class="container section-space"><div class="row g-5"><div class="col-lg-8 event-description"><h2>عن الفعالية</h2><p>' + event.description + '</p><h3>شو رح نعمل؟</h3><ol>' + agenda + '</ol><h3>قبل الحضور</h3><p>' + event.note + '</p><h3>من أجواء النشاط</h3><div class="event-gallery"><img src="assets/img/' + event.image + '.jpg" width="800" height="500" alt="صورة تعبيرية للنشاط"><img src="assets/img/' + related[0].image + '.jpg" width="800" height="500" alt="صورة تعبيرية لنشاط آخر" loading="lazy"></div><p class="map-caption">صور تعبيرية من Unsplash؛ لا توثّق فعاليات فعلية للجامعة.</p></div><aside class="col-lg-4"><div class="event-summary"><h2>الموعد والتفاصيل</h2><dl><dt>التاريخ</dt><dd><time datetime="' + event.date + '">' + eventDate(event.date) + '</time></dd><dt>الوقت — بتوقيت دمشق</dt><dd>' + eventTime(event.time) + ' – ' + eventTime(event.end) + '</dd><dt>المكان</dt><dd>' + event.venue + '</dd><dt>المشاركة</dt><dd>مجانية — بيانات تجريبية</dd></dl><button class="btn btn-primary w-100" type="button" data-bs-toggle="modal" data-bs-target="#booking-modal">احجز مكاناً تجريبياً</button><div class="event-actions"><button class="btn btn-outline-primary" type="button" id="calendar-button">أضف للتقويم</button><button class="btn btn-outline-primary" type="button" id="share-button">شارك الفعالية ↗</button></div><div id="share-status" role="status"></div><div id="share-fallback" class="copy-link" hidden><label for="share-url">رابط الفعالية</label><input class="form-control" id="share-url" type="text" readonly dir="ltr"></div></div></aside></div></section>' +
      '<section class="container mb-5"><h2 class="small-heading">المكان</h2><img class="map-image" src="assets/img/map.svg" width="800" height="360" alt="خريطة تخطيطية وهمية لتوضيح مكان النشاط"><p class="map-caption">' + (event.location === 'عبر الإنترنت' ? 'هذه فعالية إلكترونية تجريبية؛ لا يوجد رابط اجتماع فعلي. الرسم لا يمثل موقعاً للحضور.' : 'المكان: ' + event.venue + '. المخطط صورة توضيحية ولا يمثل عنواناً حقيقياً أو خريطة ملاحة.') + '</p></section>' +
      '<section class="container section-space"><div class="section-heading"><h2>قد يعجبك أيضاً</h2><a class="text-link" href="events.html">كل الفعاليات ←</a></div><div class="row g-4">' + related.slice(0, 3).map(card).join('') + '</div></section>';
    document.getElementById('calendar-button').addEventListener('click', function () { downloadCalendar(event); });
    document.getElementById('share-button').addEventListener('click', async function () {
      var output = document.getElementById('share-status');
      try {
        if (navigator.share) { await navigator.share({title: event.title, text: event.short, url: window.location.href}); return; }
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(window.location.href);
          alertMessage(output, 'نُسخ رابط الفعالية.', 'success');
          return;
        }
      } catch (error) {
        if (error.name === 'AbortError') { return; }
      }
      document.getElementById('share-fallback').hidden = false;
      var input = document.getElementById('share-url');
      input.value = window.location.href;
      input.focus();
      input.select();
      alertMessage(output, 'يمكنك نسخ الرابط المحدد ومشاركته.', 'info');
    });
    var booking = document.getElementById('booking-form');
    booking.addEventListener('input', function (change) {
      change.target.classList.remove('is-invalid');
      change.target.removeAttribute('aria-invalid');
      var output = document.getElementById('booking-alert');
      output.className = 'mt-3'; output.textContent = '';
    });
    booking.addEventListener('submit', function (submit) {
      submit.preventDefault();
      var nameOk = validName(document.getElementById('booking-name'));
      var emailOk = validEmail(document.getElementById('booking-email'));
      var output = document.getElementById('booking-alert');
      if (!nameOk || !emailOk) {
        alertMessage(output, 'راجع الاسم والبريد الإلكتروني.', 'danger');
        booking.querySelector('.is-invalid').focus();
        return;
      }
      alertMessage(output, 'تمت تجربة الحجز بنجاح. لم يُحجز مقعد حقيقي ولم تُحفظ بياناتك.', 'success');
      booking.reset();
    });
  }
  var topButton = document.querySelector('.back-top');
  function updateTopButton() { topButton.hidden = window.scrollY < 500; }
  window.addEventListener('scroll', updateTopButton, {passive: true});
  topButton.addEventListener('click', function () { window.scrollTo({top: 0, behavior: 'smooth'}); });
  updateTopButton();
  renderTeam();
  setupHome();
  setupFilters();
  setupContact();
  setupEvent();
}());
