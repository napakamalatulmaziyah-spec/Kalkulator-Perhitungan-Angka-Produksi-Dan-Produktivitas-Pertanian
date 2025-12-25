const sectors = [
  { id: 'pangan', name: 'Tanaman Pangan', emoji: '🌾', desc: 'Padi, Jagung, Kedelai, Kacang Tanah, Ubi Kayu, Ubi Jalar' },
  { id: 'hortikultura', name: 'Hortikultura', emoji: '🥬', desc: 'Sayuran, Buah-buahan, Tanaman Hias' },
  { id: 'peternakan', name: 'Peternakan', emoji: '🐄', desc: 'Sapi, Kambing, Ayam, dan lainnya' },
  { id: 'perkebunan', name: 'Perkebunan', emoji: '🌴', desc: 'Kelapa Sawit, Karet, Kopi, Kakao' },
];
const komoditasPangan = ['Padi', 'Jagung', 'Kedelai', 'Kacang Hijau', 'Kacang Tanah', 'Ubi Kayu'];
const jenisTernak = ['Sapi Bali Jantan', 'Sapi Bali Betina', 'Babi', 'Ayam'];

let selectedSector = null;
let formData = {};
let results = null;

const landing = document.getElementById('landing');
const formArea = document.getElementById('form-area');
const formFields = document.getElementById('form-fields');
const resultBox = document.getElementById('result-box');
const resultContent = document.getElementById('result-content');
const sectorGrid = document.getElementById('sector-grid');

function renderSectorCards() {
  sectorGrid.innerHTML = '';
  sectors.forEach((sec) => {
    const btn = document.createElement('button');
    btn.className = 'card sector-btn';
    btn.innerHTML = `
      <span class="sector-emoji">${sec.emoji}</span>
      <div class="card-title">${sec.name}</div>
      <p class="card-desc">${sec.desc}</p>
    `;
    btn.onclick = () => selectSector(sec.id);
    sectorGrid.appendChild(btn);
  });
}

function selectSector(id) {
  selectedSector = id;
  formData = {};
  results = null;
  landing.style.display = 'none';
  formArea.style.display = 'block';
  const sec = sectors.find((s) => s.id === id);
  document.getElementById('sector-emoji').textContent = sec.emoji;
  document.getElementById('sector-name').textContent = sec.name;
  document.getElementById('sector-desc').textContent = sec.desc;
  buildForm();
  renderResults();
}

function handleInput(field, value) {
  formData[field] = value;
}

function buildForm() {
  formFields.innerHTML = '';
  addField('Nama Kelompok Tani', 'namaKelompok', 'text', selectedSector === 'peternakan' ? 'Nama Pemilik/Pelaku Usaha' : 'Nama Kelompok Tani');
  addField('Lokasi/Desa', 'lokasi', 'text');

  if (selectedSector !== 'peternakan') {
    addField('Nama Petani', 'namaPetani', 'text');
  }
  if (selectedSector === 'pangan') {
    addSelect('Jenis Komoditas', 'komoditas', komoditasPangan, 'Pilih Komoditas');
  }
  if (selectedSector === 'peternakan') {
    addSelect('Jenis Ternak', 'jenisTernak', jenisTernak, 'Pilih Jenis Ternak');
  }
  if (selectedSector === 'hortikultura' || selectedSector === 'perkebunan') {
    addField('Jenis Komoditas', 'komoditas', 'text');
  }

  if (selectedSector !== 'peternakan') {
    addField('Jenis Varietas', 'varietas', 'text');
    addNumberGrid();
  } else {
    addField('Berat Ternak Hidup (Kg)', 'beratHidup', 'number', undefined, '0.00');
  }
}

function addField(label, key, type = 'text', overrideLabel, placeholder = '') {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  wrap.innerHTML = `
    <label>${overrideLabel || label}</label>
    <input type="${type}" step="0.01" placeholder="${placeholder}" value="${formData[key] || ''}" />
  `;
  wrap.querySelector('input').oninput = (e) => handleInput(key, e.target.value);
  formFields.appendChild(wrap);
}

function addSelect(label, key, options, placeholder = 'Pilih') {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  wrap.innerHTML = `
    <label>${label}</label>
    <select>
      <option value="">${placeholder}</option>
      ${options.map((o) => `<option value="${o}">${o}</option>`).join('')}
    </select>
  `;
  const sel = wrap.querySelector('select');
  sel.value = formData[key] || '';
  sel.onchange = (e) => handleInput(key, e.target.value);
  formFields.appendChild(wrap);
}

function addNumberGrid() {
  const grid = document.createElement('div');
  grid.className = 'grid grid-2';
  grid.innerHTML = `
    <div class="field">
      <label>Luas Panen (Ha)</label>
      <input type="number" step="0.01" placeholder="0.00" value="${formData.luasPanen || ''}" />
    </div>
    <div class="field">
      <label>Berat Ubinan (Kg)</label>
      <input type="number" step="0.01" placeholder="0.00" value="${formData.beratUbinan || ''}" />
    </div>
  `;
  grid.querySelectorAll('input')[0].oninput = (e) => handleInput('luasPanen', e.target.value);
  grid.querySelectorAll('input')[1].oninput = (e) => handleInput('beratUbinan', e.target.value);
  formFields.appendChild(grid);
}

function calcPadi(bu, lp) {
  const gkp = bu * 16;
  const gkg = gkp * 0.8456;
  const beras = gkg * 0.6261;
  return {
    produktivitas: {
      'Gabah Kering Panen (GKP)': gkp.toFixed(2),
      'Gabah Kering Giling (GKG)': gkg.toFixed(2),
      Beras: beras.toFixed(2),
    },
    produksi: {
      'Gabah Kering Panen (GKP)': (lp * gkp).toFixed(2),
      'Gabah Kering Giling (GKG)': (lp * gkg).toFixed(2),
      Beras: (lp * beras).toFixed(2),
    },
  };
}

function calcJagung(bu, lp) {
  const keringPanen = bu * 16;
  const pipilan = keringPanen * 0.5673;
  return {
    produktivitas: {
      'Kering Panen Tanpa Kulit dan Tangkai': keringPanen.toFixed(2),
      'Pipilan Kering': pipilan.toFixed(2),
    },
    produksi: {
      'Kering Panen Tanpa Kulit dan Tangkai': (lp * keringPanen).toFixed(2),
      'Pipilan Kering': (lp * pipilan).toFixed(2),
    },
  };
}

function calcKedelai(bu, lp) {
  const polong = bu * 16;
  const biji = polong * 0.369;
  return {
    produktivitas: { 'Polong Basah/Kering Panen': polong.toFixed(2), 'Biji Kering': biji.toFixed(2) },
    produksi: { 'Polong Basah/Kering Panen': (lp * polong).toFixed(2), 'Biji Kering': (lp * biji).toFixed(2) },
  };
}

function calcKacangHijau(bu, lp) {
  const polong = bu * 16;
  const biji = polong * 0.67;
  return {
    produktivitas: { 'Polong Kering': polong.toFixed(2), 'Biji Kering': biji.toFixed(2) },
    produksi: { 'Polong Kering': (lp * polong).toFixed(2), 'Biji Kering': (lp * biji).toFixed(2) },
  };
}

function calcKacangTanah(bu, lp) {
  const glBasah = bu * 16;
  const glKering = glBasah * 0.53;
  const biji = glKering * 0.32;
  return {
    produktivitas: {
      'Glondongan Basah': glBasah.toFixed(2),
      'Glondongan Kering (Polong)': glKering.toFixed(2),
      'Biji Kering': biji.toFixed(2),
    },
    produksi: {
      'Glondongan Basah': (lp * glBasah).toFixed(2),
      'Biji Kering': (lp * biji).toFixed(2),
    },
  };
}

function calcUbiKayu(bu, lp) {
  const ubiBasah = bu * 16;
  const ubiLepasKulit = ubiBasah * 0.8;
  const gaplek = ubiLepasKulit * 0.36;
  const tepung = gaplek * 0.265;
  return {
    produktivitas: {
      'Ubi Basah Berkulit': ubiBasah.toFixed(2),
      'Ubi Lepas Kulit': ubiLepasKulit.toFixed(2),
      Gaplek: gaplek.toFixed(2),
      'Tepung Kampung': tepung.toFixed(2),
    },
    produksi: {
      'Ubi Basah Berkulit': (lp * ubiBasah).toFixed(2),
      'Ubi Lepas Kulit': (lp * ubiLepasKulit).toFixed(2),
      Gaplek: (lp * gaplek).toFixed(2),
      'Tepung Kampung': (lp * tepung).toFixed(2),
    },
  };
}

function calcHortikultura(bu, lp) {
  const segar = bu * 16;
  return { produktivitas: { 'Produk Segar': segar.toFixed(2) }, produksi: { 'Produk Segar': (lp * segar).toFixed(2) } };
}

function calcPerkebunan(bu, lp) {
  const segar = bu * 16;
  return { produktivitas: { 'Produk Segar': segar.toFixed(2) }, produksi: { 'Produk Segar': (lp * segar).toFixed(2) } };
}

function calcPeternakan(jenis, bh) {
  let p = 0;
  if (jenis === 'Sapi Bali Jantan') {
    p = 0.5;
  } else if (jenis === 'Sapi Bali Betina') {
    p = 0.45;
  } else if (jenis === 'Ayam' || jenis === 'Babi') {
    p = 0.75;
  }
  return { beratKarkas: (bh * p).toFixed(2) };
}

function handleCalculate() {
  let calc = null;
  if (selectedSector === 'pangan') {
    const bu = parseFloat(formData.beratUbinan) || 0;
    const lp = parseFloat(formData.luasPanen) || 0;
    switch (formData.komoditas) {
      case 'Padi':
        calc = calcPadi(bu, lp);
        break;
      case 'Jagung':
        calc = calcJagung(bu, lp);
        break;
      case 'Kedelai':
        calc = calcKedelai(bu, lp);
        break;
      case 'Kacang Hijau':
        calc = calcKacangHijau(bu, lp);
        break;
      case 'Kacang Tanah':
        calc = calcKacangTanah(bu, lp);
        break;
      case 'Ubi Kayu':
        calc = calcUbiKayu(bu, lp);
        break;
      default:
        break;
    }
  } else if (selectedSector === 'hortikultura') {
    const bu = parseFloat(formData.beratUbinan) || 0;
    const lp = parseFloat(formData.luasPanen) || 0;
    calc = calcHortikultura(bu, lp);
  } else if (selectedSector === 'perkebunan') {
    const bu = parseFloat(formData.beratUbinan) || 0;
    const lp = parseFloat(formData.luasPanen) || 0;
    calc = calcPerkebunan(bu, lp);
  } else if (selectedSector === 'peternakan') {
    const bh = parseFloat(formData.beratHidup) || 0;
    calc = calcPeternakan(formData.jenisTernak, bh);
  }
  results = calc;
  renderResults();
}

function renderResults() {
  if (!results) {
    resultBox.style.display = 'none';
    return;
  }
  resultBox.style.display = 'block';
  resultContent.innerHTML = '';
  if (selectedSector === 'peternakan') {
    resultContent.innerHTML = `
      <div class="card-inner">
        <div style="font-size:18px; font-weight:800; color:var(--gray-700);">Berat Karkas</div>
        <div style="font-size:28px; font-weight:800; color:var(--green-600);">${results.beratKarkas} Kg</div>
      </div>
    `;
  } else {
    const prodDiv = document.createElement('div');
    prodDiv.innerHTML = '<h4 style="margin:0 0 10px; font-size:16px; font-weight:800;">📈 Produktivitas (per Ha)</h4>';
    const box1 = document.createElement('div');
    box1.className = 'card-inner';
    Object.entries(results.produktivitas).forEach(([k, v]) => {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<span style="font-weight:700; color:var(--gray-700);">${k}</span><span style="font-weight:800; color:var(--green-600);">${v} kuintal/Ha</span>`;
      box1.appendChild(row);
    });
    prodDiv.appendChild(box1);

    const totDiv = document.createElement('div');
    totDiv.style.marginTop = '14px';
    totDiv.innerHTML = '<h4 style="margin:0 0 10px; font-size:16px; font-weight:800;">🎯 Produksi Total</h4>';
    const box2 = document.createElement('div');
    box2.className = 'card-inner';
    Object.entries(results.produksi).forEach(([k, v]) => {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<span style="font-weight:700; color:var(--gray-700);">${k}</span><span style="font-weight:800; color:#059669;">${v} kuintal</span>`;
      box2.appendChild(row);
    });
    totDiv.appendChild(box2);
    resultContent.append(prodDiv, totDiv);
  }
}

function copyResults() {
  if (!results) {
    return;
  }
  let text = `HASIL PERHITUNGAN - ${sectors.find((s) => s.id === selectedSector)?.name}\n\n`;
  text += `Nama Kelompok Tani: ${formData.namaKelompok || '-'}\n`;
  text += `Lokasi/Desa: ${formData.lokasi || '-'}\n`;
  if (selectedSector !== 'peternakan') {
    text += `Nama Petani: ${formData.namaPetani || '-'}\n`;
  }
  if (selectedSector === 'pangan') {
    text += `Jenis Komoditas: ${formData.komoditas || '-'}\n`;
    text += `Jenis Varietas: ${formData.varietas || '-'}\n`;
    text += `Luas Panen: ${formData.luasPanen || 0} Ha\n`;
    text += `Berat Ubinan: ${formData.beratUbinan || 0} Kg\n\n`;
    text += 'PRODUKTIVITAS:\n';
    Object.entries(results.produktivitas).forEach(([k, v]) => {
      text += `${k}: ${v} kuintal/Ha\n`;
    });
    text += '\nPRODUKSI:\n';
    Object.entries(results.produksi).forEach(([k, v]) => {
      text += `${k}: ${v} kuintal\n`;
    });
  } else if (selectedSector === 'peternakan') {
    text += `Jenis Ternak: ${formData.jenisTernak || '-'}\n`;
    text += `Berat Ternak Hidup: ${formData.beratHidup || 0} Kg\n\n`;
    text += `Berat Karkas: ${results.beratKarkas} Kg\n`;
  } else {
    text += `Jenis Komoditas: ${formData.komoditas || '-'}\n`;
    text += `Jenis Varietas: ${formData.varietas || '-'}\n`;
    text += `Luas Panen: ${formData.luasPanen || 0} Ha\n`;
    text += `Berat Ubinan: ${formData.beratUbinan || 0} Kg\n\n`;
    text += `PRODUKTIVITAS:\nProduk Segar: ${results.produktivitas['Produk Segar']} kuintal/Ha\n\n`;
    text += `PRODUKSI:\nProduk Segar: ${results.produksi['Produk Segar']} kuintal\n`;
  }
  navigator.clipboard.writeText(text).then(() => alert('Hasil berhasil disalin!'));
}

function resetForm() {
  formData = {};
  results = null;
  buildForm();
  renderResults();
}

document.getElementById('btn-back').onclick = () => {
  selectedSector = null;
  landing.style.display = 'block';
  formArea.style.display = 'none';
};
document.getElementById('btn-calc').onclick = handleCalculate;
document.getElementById('btn-reset').onclick = resetForm;
document.getElementById('btn-copy').onclick = copyResults;

renderSectorCards();


