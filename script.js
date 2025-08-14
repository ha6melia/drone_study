const questions = [
  {
    question: "ドローンの飛行が禁止されている場所はどれですか？",
    options: ["空港周辺", "農地上空", "山間部"],
    answer: 0,
    explanation: "空港周辺は航空法で飛行禁止空域に指定されています。"
  },
  {
    question: "二等無人航空機操縦士が飛行できる最大高度は？",
    options: ["150m", "200m", "100m"],
    answer: 0,
    explanation: "原則として地表または水面から150m以上の高さは飛行できません。"
  },
  {
    question: "夜間飛行を行う場合に必要な装備は？",
    options: ["衝突防止灯", "拡声器", "落下傘"],
    answer: 0,
    explanation: "夜間飛行では衝突防止灯の点灯が義務付けられています。"
  }
];

let currentQuestion = 0;
let score = 0;

function showQuestion() {
  const q = questions[currentQuestion];
  const container = document.getElementById("quiz-container");
  container.innerHTML = `<h2>${q.question}</h2>`;
  q.options.forEach((opt, i) => {
    container.innerHTML += `<div><input type='radio' name='option' value='${i}'> ${opt}</div>`;
  });
}

document.getElementById("next-btn").addEventListener("click", () => {
  const selected = document.querySelector("input[name='option']:checked");
  if (!selected) return alert("選択してください");
  if (parseInt(selected.value) === questions[currentQuestion].answer) {
    score++;
    alert("正解！\n" + questions[currentQuestion].explanation);
  } else {
    alert("不正解\n" + questions[currentQuestion].explanation);
  }
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    document.getElementById("result").innerHTML = `終了！正答数: ${score} / ${questions.length}`;
    document.getElementById("next-btn").disabled = true;
  }
});

showQuestion();
