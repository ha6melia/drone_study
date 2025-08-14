// Simple SPA navigation
function go(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+view).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  if(view==='progress') renderProgress();
}
go('home');

// --- Question pool (三択) ---
// NOTE: まずは20問収録。後から questions.push(...) で拡張可能。
const pool = [
  {q:"原則として飛行できない高度は？", a:["150m以上","120m以上","200m以上"], correct:0, exp:"地表/水面から150m以上は原則飛行不可。"},
  {q:"第三者上空で最も優先すべき配慮は？", a:["立入管理など安全確保","カメラ解像度を下げる","プロペラガードを外す"], correct:0, exp:"第三者上空は危険度が高く、安全確保が最優先。"},
  {q:"DID（人口集中地区）で必要となる対応は？", a:["事前確認と必要な許可・承認","特に不要","日没後のみ可"], correct:0, exp:"DIDはリスクが高く、事前の確認や許可が必要になる場合がある。"},
  {q:"夜間飛行の追加要件で正しいのは？", a:["衝突防止灯の点灯","撮影は不可","常に補助者2名が必須"], correct:0, exp:"夜間は見失いリスクが高く、灯火が必須。"},
  {q:"空港周辺での飛行について正しいのは？", a:["制限があり、必要な許可を得る","昼のみ飛行可","緊急用務機の横での飛行は自由"], correct:0, exp:"空港周辺は法令上の制限あり。"},
  {q:"目視外飛行（BVLOS）の説明で正しいものは？", a:["直接目視できない範囲の飛行","双眼鏡で見えていれば目視内","FPVは常に目視内扱い"], correct:0, exp:"直接目で見えることが目視内。双眼鏡やFPVは目視外。"},
  {q:"催し場所上空の飛行について正しいのは？", a:["人が多数集合する場所は原則飛行不可","主催者の許可だけで良い","夜なら自由"], correct:0, exp:"第三者の密集は高リスク、原則不可/厳格管理。"},
  {q:"緊急用務航空機が飛行している場合", a:["妨げない。近づかない","横について飛ぶ","高度を合わせる"], correct:0, exp:"災害対策などの妨害は厳禁。"},
  {q:"事故・重大インシデントが起きた場合", a:["報告・記録義務がある","SNSで共有すればよい","機体を隠す"], correct:0, exp:"定められた報告先・期限で通報が必要。"},
  {q:"150m制限の“高さ”は何を基準？", a:["地表/水面からの高さ","海抜高度","操縦者の身長からの高さ"], correct:0, exp:"地表または水面からの高さが基準。"},
  {q:"飛行前点検で不適切なのは？", a:["ペイロード最大まで積む","バッテリー残量確認","プロペラ固定確認"], correct:0, exp:"過荷重は危険。マニュアルに従う。"},
  {q:"道路上で離着陸する場合の注意として正しいのは？", a:["交通の妨げにならないよう管理","中央で素早く離陸","車線上なら可"], correct:0, exp:"道路交通の安全確保・占用許可など配慮が必要。"},
  {q:"私有地上空の飛行について正しいのは？", a:["土地管理者の理解・調整が望ましい","常に自由","夜間のみ許可"], correct:0, exp:"プライバシー・迷惑防止の観点で調整が必要。"},
  {q:"電波利用の基本として正しいのは？", a:["技適/周波数/出力の遵守","混信時は出力MAX","他局より優先"], correct:0, exp:"電波法に従い適法機器を使用。"},
  {q:"カメラ運用での注意として適切なのは？", a:["プライバシー/肖像権に配慮","公共の場は無制限","看板は自由"], correct:0, exp:"人物や私有地の撮影には配慮が必要。"},
  {q:"風が強い日の運用として正しいのは？", a:["離陸を見合わせる判断も重要","高度を上げて回避","前進速度で相殺"], correct:0, exp:"無理な飛行は墜落リスクを高める。"},
  {q:"リターントゥホーム(RTH)の設定で正しいのは？", a:["ホーム点検証・高度設定を事前に確認","常に0m","RTH無効化が安全"], correct:0, exp:"環境に合わせた高度/位置が重要。"},
  {q:"バッテリー運用の注意", a:["膨らみ/温度/残量管理","満充電保管が最良","冷凍庫で保存"], correct:0, exp:"リチウム系の基本管理に従う。"},
  {q:"第三者との距離について適切なのは？", a:["30m以上を目安に安全距離を確保","5mで十分","接触しなければ0mで可"], correct:0, exp:"安全距離基準を理解し、実環境で余裕を確保。"},
  {q:"夜間の識別として適切なのは？", a:["前後左右の灯火で姿勢識別","暗所で無灯火","ライトは眩しいので消灯"], correct:0, exp:"姿勢・位置の識別ができる灯火が必要。"},
];

// shuffle helper
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// --- Exam state ---
let currentSet = [];
let index = 0;
let score = 0;
let wrongs = [];

function startExam(){
  const sel = document.getElementById('qcount').value;
  let questions = shuffle(pool);
  if(sel!=='all'){
    const n = parseInt(sel,10);
    questions = questions.slice(0, Math.min(n, questions.length));
  }
  currentSet = questions.map(q=>({...q, a: shuffle(q.a)})); // shuffle options
  index = 0; score = 0; wrongs = [];
  renderQuestion();
  document.getElementById('quiz-result').innerHTML='';
}

function renderQuestion(){
  const area = document.getElementById('quiz-area');
  const ctrl = document.getElementById('quiz-controls');
  if(index >= currentSet.length){
    // finished
    const total = currentSet.length;
    const pct = Math.round((score/total)*100);
    document.getElementById('quiz-result').innerHTML =
      `<div>結果：<b>${score} / ${total}</b>（${pct}%）</div>` +
      (wrongs.length? `<details><summary>復習（間違えた問題）</summary>${wrongs.map(w=>`<p>Q: ${w.q}<br><small>${w.exp}</small></p>`).join('')}</details>` : `<p>全問正解！素晴らしい！</p>`)+
      `<div class="row"><button class="btn" onclick="startExam()">もう一度挑戦</button></div>`;
    // save progress
    const p = JSON.parse(localStorage.getItem('progress')||'{}');
    p.runs = (p.runs||0)+1;
    p.correct = (p.correct||0)+score;
    p.total = (p.total||0)+total;
    if(!p.best || pct>p.best) p.best = pct;
    localStorage.setItem('progress', JSON.stringify(p));
    document.getElementById('quiz-area').innerHTML='';
    ctrl.innerHTML='';
    return;
  }
  const q = currentSet[index];
  area.innerHTML = `<div class="question"><div><b>Q${index+1}. ${q.q}</b></div>
    ${q.a.map((opt,i)=>`<label class="opt"><input type="radio" name="opt" value="${i}"> ${opt}</label>`).join('')}
  </div>`;
  ctrl.innerHTML = `<button class="btn" onclick="submitAnswer()">回答する</button>`;
}

function submitAnswer(){
  const q = currentSet[index];
  const nodes = Array.from(document.querySelectorAll('input[name="opt"]'));
  const checked = nodes.find(n=>n.checked);
  if(!checked) { alert('選択してください'); return; }
  const chosenIndex = parseInt(checked.value,10);
  const realCorrect = q.a.indexOf(q.a.find(x=>x===q.a[q.correct])); // corrected below

  // need original correct text; compute by mapping from original pool
  const orig = pool.find(item=>item.q===q.q);
  const correctText = orig.a[orig.correct];
  const chosenText = q.a[chosenIndex];

  const labels = Array.from(document.querySelectorAll('.opt'));
  labels.forEach((lab,i)=>{
    const text = lab.textContent.trim();
    if(text===correctText) lab.classList.add('correct');
    if(i===chosenIndex && text!==correctText) lab.classList.add('wrong');
  });

  if(chosenText===correctText){
    score++;
  }else{
    wrongs.push({q:q.q, exp: orig.exp});
  }
  // show explanation inline
  const area = document.getElementById('quiz-area');
  const explain = document.createElement('div');
  explain.className = 'result';
  explain.innerHTML = `<b>解説：</b> ${orig.exp}`;
  area.appendChild(explain);

  // next button
  const ctrl = document.getElementById('quiz-controls');
  ctrl.innerHTML = `<button class="btn" onclick="nextQ()">次へ</button>`;
}

function nextQ(){ index++; renderQuestion(); }

// --- Progress ---
function renderProgress(){
  const p = JSON.parse(localStorage.getItem('progress')||'{}');
  const runs = p.runs||0, total=p.total||0, correct=p.correct||0;
  const rate = total? Math.round(correct/total*100):0;
  document.getElementById('progress-board').innerHTML = `
    <div class="glass" style="padding:12px">
      <p>受験回数：<b>${runs}</b></p>
      <p>累計正答：<b>${correct} / ${total}</b>（${rate}%）</p>
      <p>ベストスコア：<b>${p.best||0}%</b></p>
    </div>`;
}
function resetProgress(){ localStorage.removeItem('progress'); renderProgress(); }

