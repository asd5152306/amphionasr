/* AmphionASR Demo Page - interaction logic
 * Loads example data from data/examples.json and wires up:
 *  - Language toggle (EN / ZH) via data-i18n attributes
 *  - Tab switching between capabilities
 *  - Example dropdown selection
 *  - Audio player + transcript rendering
 *  - BibTeX copy button
 */

(function () {
  'use strict';

  var I18N = window.AMPHION_I18N || { en: {}, zh: {} };
  var currentLang = 'en';

  // ---------- i18n ----------
  function t(key, vars) {
    var dict = I18N[currentLang] || I18N.en;
    var str = dict[key] || (I18N.en[key] || key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.replace('{' + k + '}', vars[k]);
      });
    }
    return str;
  }

  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = t(key);
      el.innerHTML = value;
    });
    // Update toggle button states
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    // Re-apply dynamic UI strings
    refreshDynamicStrings();
  }

  function refreshDynamicStrings() {
    // Update select placeholders if no example selected
    document.querySelectorAll('.example-select').forEach(function (sel) {
      if (!sel.value) {
        var cap = sel.getAttribute('data-capability');
        var items = (examplesData.capabilities && examplesData.capabilities[cap]) || [];
        var placeholderKey = items.length ? 'ui.select_example' : 'ui.no_examples';
        var opt = sel.querySelector('option');
        if (opt) {
          opt.textContent = items.length
            ? t(placeholderKey, { n: items.length })
            : t('ui.no_examples');
        }
      }
    });
    // Update audio placeholders
    document.querySelectorAll('.audio-placeholder').forEach(function (el) {
      if (el.getAttribute('data-has-audio') === 'true') {
        el.textContent = t('ui.audio_loaded');
      } else if (el.getAttribute('data-has-audio') === 'false') {
        el.textContent = t('ui.no_audio_avail');
      } else {
        el.textContent = t('ui.no_audio');
      }
    });
  }

  // ---------- Language toggle buttons ----------
  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
    });
  });

  // ---------- Tab switching ----------
  var tabs = document.querySelectorAll('.tab');
  var panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-tab');
      tabs.forEach(function (t) { t.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.querySelector('.tab-panel[data-panel="' + target + '"]');
      if (panel) panel.classList.add('active');
    });
  });

  // ---------- Load examples ----------
  var examplesData = { capabilities: {} };

  function loadExamples() {
    fetch('data/examples.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        examplesData = data;
        populateDropdowns();
        refreshDynamicStrings();
      })
      .catch(function (err) {
        console.warn('[AmphionASR demo] Failed to load examples.json:', err);
        markDropdownsError();
      });
  }

  function populateDropdowns() {
    var caps = examplesData.capabilities || {};
    Object.keys(caps).forEach(function (capKey) {
      var select = document.querySelector('.example-select[data-capability="' + capKey + '"]');
      if (!select) return;
      var items = caps[capKey] || [];
      select.innerHTML = '';

      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = items.length
        ? t('ui.select_example', { n: items.length })
        : t('ui.no_examples');
      select.appendChild(placeholder);

      items.forEach(function (item, idx) {
        var opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = item.title || ('Example ' + (idx + 1));
        select.appendChild(opt);
      });

      select.addEventListener('change', function () {
        if (select.value === '') {
          resetPanel(capKey);
          return;
        }
        var example = items[Number(select.value)];
        renderExample(capKey, example);
      });
    });
  }

  function markDropdownsError() {
    document.querySelectorAll('.example-select').forEach(function (select) {
      select.innerHTML = '<option value="">' + t('ui.examples_not_found') + '</option>';
    });
  }

  // ---------- Render an example into a panel ----------
  function renderExample(capKey, example) {
    var panel = document.querySelector('.tab-panel[data-panel="' + capKey + '"]');
    if (!panel) return;

    var audioEl = panel.querySelector('.audio-player:not(.small) audio');
    var audioPlaceholder = panel.querySelector('.audio-player:not(.small) .audio-placeholder');
    if (audioEl) {
      if (example.audio_url) {
        audioEl.src = example.audio_url;
        audioEl.style.display = '';
        if (audioPlaceholder) audioPlaceholder.setAttribute('data-has-audio', 'true');
      } else {
        audioEl.removeAttribute('src');
        audioEl.style.display = 'none';
        if (audioPlaceholder) audioPlaceholder.setAttribute('data-has-audio', 'false');
      }
    }

    if (example.enroll_audio_url) {
      var enrollEl = panel.querySelector('audio[data-audio="enroll"]');
      if (enrollEl) enrollEl.src = example.enroll_audio_url;
    }
    if (example.mixture_audio_url) {
      var mixEl = panel.querySelector('audio[data-audio="mixture"]');
      if (mixEl) mixEl.src = example.mixture_audio_url;
    }

    setField(panel, 'transcript', example.transcript);
    setField(panel, 'without_hotword', example.without_hotword);
    setField(panel, 'with_hotword', example.with_hotword);

    var hotwordsEl = panel.querySelector('[data-field="hotwords"]');
    if (hotwordsEl) {
      hotwordsEl.innerHTML = '';
      var hotwords = example.hotwords || [];
      if (hotwords.length === 0) {
        hotwordsEl.innerHTML = '<span class="chip empty">' + t('ui.no_hotwords') + '</span>';
      } else {
        hotwords.forEach(function (hw) {
          var chip = document.createElement('span');
          chip.className = 'chip';
          chip.textContent = hw;
          hotwordsEl.appendChild(chip);
        });
      }
    }

    var degTagEl = panel.querySelector('[data-field="degradation_type"] .tag');
    if (degTagEl) degTagEl.textContent = example.degradation_type || '—';

    renderComparisons(panel, example);

    refreshDynamicStrings();
  }

  function renderComparisons(panel, example) {
    var tbody = panel.querySelector('[data-field="comparisons"]');
    if (!tbody) return;
    var comparisons = example.comparisons || [];
    if (comparisons.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="empty-row">' + t('ui.no_comparison') + '</td></tr>';
      return;
    }
    var html = '';
    comparisons.forEach(function (row) {
      var isOurs = row.ours === true;
      var rowClass = isOurs ? 'row-ours' : '';
      var metricClass = (isOurs || row.best === true) ? 'col-metric metric-best' : 'col-metric';
      var metricValue = row.metric || '—';
      var oursTag = isOurs ? ' <span class="ours-tag">' + t('ui.ours') + '</span>' : '';
      var transcript = row.transcript || '—';
      html += '<tr class="' + rowClass + '">';
      html += '<td class="col-model">' + escapeHtml(row.model || '—') + oursTag + '</td>';
      html += '<td class="col-result">' + escapeHtml(transcript) + '</td>';
      html += '<td class="' + metricClass + '">' + escapeHtml(metricValue) + '</td>';
      html += '</tr>';
    });
    tbody.innerHTML = html;
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setField(panel, fieldName, value) {
    var el = panel.querySelector('[data-field="' + fieldName + '"]');
    if (el) el.textContent = value || '—';
  }

  function resetPanel(capKey) {
    var panel = document.querySelector('.tab-panel[data-panel="' + capKey + '"]');
    if (!panel) return;
    panel.querySelectorAll('audio').forEach(function (a) { a.removeAttribute('src'); });
    panel.querySelectorAll('[data-field]').forEach(function (el) { el.textContent = '—'; });
    panel.querySelectorAll('.audio-placeholder').forEach(function (el) {
      el.removeAttribute('data-has-audio');
    });
    var hotwordsEl = panel.querySelector('[data-field="hotwords"]');
    if (hotwordsEl) hotwordsEl.innerHTML = t('ui.no_hotwords');
    var compTbody = panel.querySelector('[data-field="comparisons"]');
    if (compTbody) compTbody.innerHTML = '<tr><td colspan="3" class="empty-row">—</td></tr>';
    refreshDynamicStrings();
  }

  // ---------- BibTeX copy button ----------
  var copyBtn = document.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var targetSelector = copyBtn.getAttribute('data-copy');
      var target = document.querySelector('.' + targetSelector);
      if (!target) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(target.textContent).then(function () {
          var original = copyBtn.textContent;
          copyBtn.textContent = t('bibtex.copied');
          setTimeout(function () { copyBtn.textContent = original; }, 1500);
        }).catch(function () {});
      }
    });
  }

  // ---------- Init ----------
  applyLang('en');
  loadExamples();
})();
