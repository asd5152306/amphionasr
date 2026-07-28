/* AmphionASR Demo Page - interaction logic
 * Loads example data from data/examples.json and wires up:
 *  - Language toggle (EN / ZH) via data-i18n attributes
 *  - Tab switching between capabilities
 *  - Renders all samples per capability as comparison tables
 *  - BibTeX copy button
 */

(function () {
  'use strict';

  var I18N = window.AMPHION_I18N || { en: {}, zh: {} };
  var currentLang = 'en';
  var examplesData = { capabilities: {} };

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
      el.innerHTML = t(key);
    });
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    // Re-render sample cards so their dynamic labels follow the new language
    renderAllSamples();
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
  function loadExamples() {
    fetch('data/examples.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        examplesData = data;
        renderAllSamples();
      })
      .catch(function (err) {
        console.warn('[AmphionASR demo] Failed to load examples.json:', err);
        markLoadError();
      });
  }

  function markLoadError() {
    document.querySelectorAll('.samples-list').forEach(function (el) {
      el.innerHTML = '<p class="samples-error">' + escapeHtml(t('ui.examples_not_found')) + '</p>';
    });
  }

  // ---------- Render all samples for every capability ----------
  function renderAllSamples() {
    var caps = examplesData.capabilities || {};
    Object.keys(caps).forEach(function (capKey) {
      var container = document.querySelector('.samples-list[data-capability="' + capKey + '"]');
      if (!container) return;
      var items = caps[capKey] || [];
      if (!items.length) {
        container.innerHTML = '<p class="samples-error">' + escapeHtml(t('ui.no_examples')) + '</p>';
        return;
      }
      var html = '';
      items.forEach(function (item, idx) {
        html += renderSampleCard(capKey, item, idx);
      });
      container.innerHTML = html;
    });
  }

  function renderSampleCard(capKey, item, idx) {
    var label = t('ui.sample_label', { n: idx + 1 });
    var audioHtml = renderSampleAudio(capKey, item);
    var extraHtml = renderSampleExtra(capKey, item);
    var tableHtml = renderComparisonTable(item);

    return (
      '<div class="sample-card">' +
        '<div class="sample-head">' +
          '<div class="sample-label">' + escapeHtml(label) + '</div>' +
          audioHtml +
        '</div>' +
        extraHtml +
        tableHtml +
      '</div>'
    );
  }

  function renderSampleAudio(capKey, item) {
    // TS-ASR has enrollment + mixture audio
    if (capKey === 'tsasr') {
      var enroll = item.enroll_audio_url
        ? audioPlayerHtml(item.enroll_audio_url, t('tsasr.enroll'))
        : '';
      var mix = item.mixture_audio_url
        ? audioPlayerHtml(item.mixture_audio_url, t('tsasr.mixture'))
        : '';
      return '<div class="sample-audio dual">' + enroll + mix + '</div>';
    }
    if (item.audio_url) {
      return '<div class="sample-audio">' + audioPlayerHtml(item.audio_url, t('ui.input_audio')) + '</div>';
    }
    return '';
  }

  function audioPlayerHtml(src, label) {
    return (
      '<div class="sample-audio-item">' +
        (label ? '<span class="audio-label">' + escapeHtml(label) + '</span>' : '') +
        '<audio controls preload="metadata" src="' + escapeHtml(src) + '"></audio>' +
      '</div>'
    );
  }

  function renderSampleExtra(capKey, item) {
    if (capKey === 'hotword') {
      var chips = (item.hotwords || []).map(function (hw) {
        return '<span class="chip">' + escapeHtml(hw) + '</span>';
      }).join('');
      return (
        '<div class="sample-hotwords">' +
          '<span class="sample-hotwords-label">' + escapeHtml(t('hotword.retrieved')) + '</span>' +
          '<span class="hotword-chips">' + (chips || '<span class="chip empty">' + escapeHtml(t('ui.no_hotwords')) + '</span>') + '</span>' +
        '</div>'
      );
    }
    if (capKey === 'degradation') {
      return (
        '<div class="sample-degradation">' +
          '<span class="sample-degradation-label">' + escapeHtml(t('degradation.type')) + '</span>' +
          '<span class="tag">' + escapeHtml(item.degradation_type || '—') + '</span>' +
        '</div>'
      );
    }
    return '';
  }

  function renderComparisonTable(item) {
    var rows = item.comparisons || [];
    if (!rows.length) {
      return '<p class="samples-error">' + escapeHtml(t('ui.no_comparison')) + '</p>';
    }
    var body = rows.map(function (row) {
      var isOurs = row.ours === true;
      var rowClass = isOurs ? 'row-ours' : '';
      var oursTag = isOurs ? ' <span class="ours-tag">' + escapeHtml(t('ui.ours')) + '</span>' : '';
      var transcript = row.transcript || '—';
      return (
        '<tr class="' + rowClass + '">' +
          '<td class="col-model">' + escapeHtml(row.model || '—') + oursTag + '</td>' +
          '<td class="col-result">' + escapeHtml(transcript) + '</td>' +
        '</tr>'
      );
    }).join('');

    return (
      '<div class="cmp-table-wrap">' +
        '<table class="cmp-table">' +
          '<thead>' +
            '<tr>' +
              '<th class="col-model">' + escapeHtml(t('ui.col_model')) + '</th>' +
              '<th class="col-result">' + escapeHtml(t('ui.col_result')) + '</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + body + '</tbody>' +
        '</table>' +
      '</div>'
    );
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
