/* AmphionASR Demo Page - interaction logic
 *
 * Loads example data from data/examples.json and wires up:
 *  - Tab switching between capabilities
 *  - Example dropdown selection
 *  - Audio player + transcript rendering
 *  - BibTeX copy button
 */

(function () {
  'use strict';

  // ---------- Tab switching ----------
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.querySelector(`.tab-panel[data-panel="${target}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  // ---------- Load examples ----------
  let examplesData = { capabilities: {} };

  async function loadExamples() {
    try {
      const res = await fetch('data/examples.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      examplesData = await res.json();
      populateDropdowns();
    } catch (err) {
      console.warn('[AmphionASR demo] Failed to load examples.json:', err);
      markDropdownsError();
    }
  }

  function populateDropdowns() {
    const caps = examplesData.capabilities || {};
    Object.keys(caps).forEach((capKey) => {
      const select = document.querySelector(`.example-select[data-capability="${capKey}"]`);
      if (!select) return;
      const items = caps[capKey] || [];
      select.innerHTML = '';

      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = items.length
        ? `— Select an example (${items.length}) —`
        : '— No examples available —';
      select.appendChild(placeholder);

      items.forEach((item, idx) => {
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = item.title || `Example ${idx + 1}`;
        select.appendChild(opt);
      });

      select.addEventListener('change', () => {
        if (select.value === '') {
          resetPanel(capKey);
          return;
        }
        const example = items[Number(select.value)];
        renderExample(capKey, example);
      });
    });
  }

  function markDropdownsError() {
    document.querySelectorAll('.example-select').forEach((select) => {
      select.innerHTML = '<option value="">— examples.json not found —</option>';
    });
  }

  // ---------- Render an example into a panel ----------
  function renderExample(capKey, example) {
    const panel = document.querySelector(`.tab-panel[data-panel="${capKey}"]`);
    if (!panel) return;

    // Audio (single)
    const audioEl = panel.querySelector('.audio-player:not(.small) audio');
    const audioPlaceholder = panel.querySelector('.audio-player:not(.small) .audio-placeholder');
    if (audioEl) {
      if (example.audio_url) {
        audioEl.src = example.audio_url;
        audioEl.style.display = '';
        if (audioPlaceholder) {
          audioPlaceholder.textContent = 'Audio loaded';
        }
      } else {
        audioEl.removeAttribute('src');
        audioEl.style.display = 'none';
        if (audioPlaceholder) audioPlaceholder.textContent = 'No audio available';
      }
    }

    // Dual audio (TS-ASR)
    if (example.enroll_audio_url) {
      const enrollEl = panel.querySelector('audio[data-audio="enroll"]');
      if (enrollEl) enrollEl.src = example.enroll_audio_url;
    }
    if (example.mixture_audio_url) {
      const mixEl = panel.querySelector('audio[data-audio="mixture"]');
      if (mixEl) mixEl.src = example.mixture_audio_url;
    }

    // Transcript fields
    setField(panel, 'transcript', example.transcript);
    setField(panel, 'without_hotword', example.without_hotword);
    setField(panel, 'with_hotword', example.with_hotword);

    // Hotword chips
    const hotwordsEl = panel.querySelector('[data-field="hotwords"]');
    if (hotwordsEl) {
      hotwordsEl.innerHTML = '';
      const hotwords = example.hotwords || [];
      if (hotwords.length === 0) {
        hotwordsEl.innerHTML = '<span class="chip empty">—</span>';
      } else {
        hotwords.forEach((hw) => {
          const chip = document.createElement('span');
          chip.className = 'chip';
          chip.textContent = hw;
          hotwordsEl.appendChild(chip);
        });
      }
    }

    // Degradation type tag
    const degTagEl = panel.querySelector('[data-field="degradation_type"] .tag');
    if (degTagEl) {
      degTagEl.textContent = example.degradation_type || '—';
    }
  }

  function setField(panel, fieldName, value) {
    const el = panel.querySelector(`[data-field="${fieldName}"]`);
    if (el) el.textContent = value || '—';
  }

  function resetPanel(capKey) {
    const panel = document.querySelector(`.tab-panel[data-panel="${capKey}"]`);
    if (!panel) return;
    panel.querySelectorAll('audio').forEach((a) => {
      a.removeAttribute('src');
    });
    panel.querySelectorAll('[data-field]').forEach((el) => {
      el.textContent = '—';
    });
    const hotwordsEl = panel.querySelector('[data-field="hotwords"]');
    if (hotwordsEl) hotwordsEl.innerHTML = '—';
  }

  // ---------- BibTeX copy button ----------
  const copyBtn = document.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const targetSelector = copyBtn.dataset.copy;
      const target = document.querySelector('.' + targetSelector);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.textContent);
        const original = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = original;
        }, 1500);
      } catch (err) {
        console.warn('Copy failed:', err);
      }
    });
  }

  // ---------- Init ----------
  loadExamples();
})();
