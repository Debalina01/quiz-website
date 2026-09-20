
const VALID_USER_IDS = [
  "VBYLD001",
  "VBYLD002",
  "VBYLD003",
  "6377853173",
  "9602816671",
  "9413301577",
  "9460091176",
  "8941039401"
];

function isValidUserId(userId) {
  if (!userId) {
    return false;
  }
  return VALID_USER_IDS.includes(userId.trim().toUpperCase());
}

async function getRandomQuestions() {
  const savedQuestions = sessionStorage.getItem("storedQuizQuestions");
  if (savedQuestions) {
    try {
      return JSON.parse(savedQuestions); 
    } catch (e) {
      console.error("Error parsing stored questions:", e);
    }
  }

  try {
    const response = await fetch('./que.json');
    const allQuestions = await response.json();

    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    const random10 = allQuestions.slice(0, 10);
    sessionStorage.setItem("storedQuizQuestions", JSON.stringify(random10));
    return random10;
  } catch (error) {
    console.error("Failed to load questions:", error);
    return [];
  }
}

let QUIZ_QUESTIONS = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let isTimeout = false;
let timerInterval = null;

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("userIdInput")) {
    initIndexPage();
  } else if (document.getElementById("questionText")) {
    initQuizPage();
  } else if (document.getElementById("resultUserId")) {
    initResultPage();
  }
});

function initIndexPage() {
  const userIdInput = document.getElementById("userIdInput");
  sessionStorage.setItem("min", 9);
  sessionStorage.setItem("sec", 59);
  if (userIdInput) {
    userIdInput.focus();
  }
}

function handleStartQuiz(event) {
  event.preventDefault();
  const userNameInput = document.getElementById("userNameInput");
  const userIdInput = document.getElementById("userIdInput");
  const errorMessage = document.getElementById("errorMessage");

  const enteredId = userIdInput.value.trim().toUpperCase();

  if (!isValidUserId(enteredId)) {
    errorMessage.textContent = "Invalid User ID. Please enter a valid User ID (e.g., VBYLD001, VBYLD002, VBYLD003).";
    errorMessage.style.display = "block";
    userIdInput.focus();
    return;
  }

  errorMessage.style.display = "none";
  errorMessage.textContent = "";

  const enteredName = (userNameInput && userNameInput.value.trim()) ? userNameInput.value.trim() : enteredId;

  sessionStorage.setItem("currentUserId", enteredId);
  sessionStorage.setItem("currentUserName", enteredName);
  sessionStorage.removeItem("quizAnswers");
  sessionStorage.removeItem("quizResult");
  sessionStorage.removeItem("storedQuizQuestions");

  window.location.href = "quiz.html";
}

async function initQuizPage() {
  const currentUserId = sessionStorage.getItem("currentUserId");

  if (!currentUserId) {
    window.location.href = "index.html";
    return;
  }

  const currentUserBadge = document.getElementById("currentUserBadge");
  if (currentUserBadge) {
    currentUserBadge.textContent = "User: " + currentUserId;
  }

  QUIZ_QUESTIONS = await getRandomQuestions();
  const savedAnswers = sessionStorage.getItem("quizAnswers");

  if (savedAnswers) {
    try {
      userAnswers = JSON.parse(savedAnswers);
    } catch (error) {
      userAnswers = {};
    }
  }

  currentQuestionIndex = 0;
  quizTimer();
  displayQuestion(currentQuestionIndex);
}

function displayQuestion(index) {
  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQuestion = QUIZ_QUESTIONS[index];

  if (!currentQuestion) return;

  const counter = document.getElementById("questionCounter");
  if (counter) {
    counter.textContent = "Question " + (index + 1) + " of " + totalQuestions;
  }

  const progressBar = document.getElementById("progressBar");
  if (progressBar && totalQuestions > 0) {
    const percent = Math.round(((index + 1) / totalQuestions) * 100);
    progressBar.style.width = percent + "%";
  }

  const questionText = document.getElementById("questionText");
  if (questionText) {
    questionText.textContent = currentQuestion.question;
  }

  const optionsContainer = document.getElementById("optionsContainer");
  if (optionsContainer) {
    optionsContainer.innerHTML = "";
    const optionLetters = ["A", "B", "C", "D"];

    currentQuestion.options.forEach(function (optionText, optionIndex) {
      const optionLabel = document.createElement("label");
      optionLabel.className = "option-item";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "question_" + index;
      radio.value = optionIndex;

      if (userAnswers[index] === optionIndex) {
        radio.checked = true;
        optionLabel.classList.add("selected");
      }

      radio.addEventListener("change", function () {
        userAnswers[index] = optionIndex;
        sessionStorage.setItem("quizAnswers", JSON.stringify(userAnswers));

        const allOptions = optionsContainer.querySelectorAll(".option-item");
        allOptions.forEach(function (option) {
          option.classList.remove("selected");
        });

        optionLabel.classList.add("selected");
      });

      const letterBadge = document.createElement("span");
      letterBadge.className = "option-letter";
      letterBadge.textContent = optionLetters[optionIndex] || (optionIndex + 1);

      const textSpan = document.createElement("span");
      textSpan.className = "option-text";
      textSpan.textContent = optionText;

      const checkCircle = document.createElement("span");
      checkCircle.className = "option-check-circle";

      optionLabel.appendChild(radio);
      optionLabel.appendChild(letterBadge);
      optionLabel.appendChild(textSpan);
      optionLabel.appendChild(checkCircle);

      optionsContainer.appendChild(optionLabel);
    });
  }

  const prevButton = document.getElementById("prevBtn");
  const nextButton = document.getElementById("nextBtn");
  const submitButton = document.getElementById("submitBtn");

  if (prevButton) {
    prevButton.disabled = index === 0;
  }

  if (index === totalQuestions - 1) {
    if (nextButton) {
      nextButton.style.display = "none";
    }
    if (submitButton) {
      submitButton.style.display = "inline-flex";
    }
  } else {
    if (nextButton) {
      nextButton.style.display = "inline-flex";
    }
    if (submitButton) {
      submitButton.style.display = "none";
    }
  }
}

function handleNextQuestion() {
  if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
    currentQuestionIndex++;
    displayQuestion(currentQuestionIndex);
  }
}

function handlePreviousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayQuestion(currentQuestionIndex);
  }
}

function handleSubmitQuiz() {
  const totalQuestions = QUIZ_QUESTIONS.length;
  const answeredQuestions = Object.keys(userAnswers).length;

  if (isTimeout) {
    confirmSubmitQuiz();
    return;
  }

  openSubmitModal(answeredQuestions, totalQuestions);
}

function openSubmitModal(answered, total) {
  const modal = document.getElementById("submitModal");
  const answeredEl = document.getElementById("modalAnsweredCount");
  const totalEl = document.getElementById("modalTotalCount");
  const submsgEl = document.getElementById("modalSubmessage");

  if (answeredEl) answeredEl.textContent = answered;
  if (totalEl) totalEl.textContent = total;

  if (submsgEl) {
    if (answered < total) {
      const remaining = total - answered;
      submsgEl.textContent = "You still have " + remaining + " unanswered question" + (remaining > 1 ? "s" : "") + ". Are you sure you want to submit?";
    } else {
      submsgEl.textContent = "Great job! You have answered all questions. Are you sure you want to submit your quiz?";
    }
  }

  if (modal) {
    modal.style.display = "flex";
  }
}

function closeSubmitModal() {
  const modal = document.getElementById("submitModal");
  if (modal) {
    modal.style.display = "none";
  }
}

function confirmSubmitQuiz() {
  closeSubmitModal();
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  const totalQuestions = QUIZ_QUESTIONS.length;
  let correctCount = 0;

  QUIZ_QUESTIONS.forEach(function (question, index) {
    if (userAnswers[index] === question.correctAnswer) {
      correctCount++;
    }
  });

  const currentUserId = sessionStorage.getItem("currentUserId") || "Unknown";
  const currentUserName = sessionStorage.getItem("currentUserName") || currentUserId;

  const resultData = {
    userId: currentUserId,
    userName: currentUserName,
    totalQuestions: totalQuestions,
    correctAnswers: correctCount,
    score: correctCount
  };

  sessionStorage.setItem("quizResult", JSON.stringify(resultData));
  window.location.href = "result.html";
}

function initResultPage() {
  const resultRaw = sessionStorage.getItem("quizResult");

  if (!resultRaw) {
    window.location.href = "index.html";
    return;
  }

  try {
    const result = JSON.parse(resultRaw);

    const userId = document.getElementById("resultUserId");
    const score = document.getElementById("resultScore");
    const total = document.getElementById("resultTotal");
    const correct = document.getElementById("resultCorrect");
    const incorrect = document.getElementById("resultIncorrect");
    const accuracy = document.getElementById("resultAccuracy");
    const percentage = document.getElementById("resultPercentage");
    const feedback = document.getElementById("resultFeedback");

    if (userId) {
      userId.textContent = result.userId;
    }

    if (score) {
      score.textContent = result.score + " / " + result.totalQuestions;
    }

    if (total) {
      total.textContent = result.totalQuestions;
    }

    if (correct) {
      correct.textContent = result.correctAnswers;
    }

    const wrongCount = result.totalQuestions - result.correctAnswers;
    if (incorrect) {
      incorrect.textContent = wrongCount >= 0 ? wrongCount : 0;
    }

    const pct = result.totalQuestions > 0 ? Math.round((result.correctAnswers / result.totalQuestions) * 100) : 0;
    if (accuracy) {
      accuracy.textContent = pct + "%";
    }
    if (percentage) {
      percentage.textContent = pct + "% Score";
    }

    if (feedback) {
      if (pct >= 80) {
        feedback.textContent = "Outstanding Performance! Excellent work!";
      } else if (pct >= 50) {
        feedback.textContent = "Good effort! Keep practicing to improve.";
      } else {
        feedback.textContent = "Keep learning and try again to improve your score!";
      }
    }
  } catch (error) {
    window.location.href = "index.html";
  }
}

function handleRestartQuiz() {
  sessionStorage.removeItem("currentUserId");
  sessionStorage.removeItem("currentUserName");
  sessionStorage.removeItem("quizAnswers");
  sessionStorage.removeItem("quizResult");
  sessionStorage.removeItem("storedQuizQuestions");

  window.location.href = "index.html";
}

function quizTimer() {
  let min = parseInt(sessionStorage.getItem("min")) || 9;
  let sec = parseInt(sessionStorage.getItem("sec")) || 59;

  function timer() {
    const minutes = min < 10 ? "0" + min : min;
    const seconds = sec < 10 ? "0" + sec : sec;
    const timerBadge = document.getElementById("timerBadge");
    if (timerBadge) {
      timerBadge.textContent = "Time: " + minutes + ":" + seconds;
    }
    sec = sec - 1;

    if (min === 0 && sec < 0) {
      if (timerInterval) clearInterval(timerInterval);
      isTimeout = true;
      confirmSubmitQuiz();
      return;
    }
    if (sec < 0) {
      min = min - 1;
      sec = 59;
    }
    sessionStorage.setItem("min", min);
    sessionStorage.setItem("sec", sec);
  }

  timer();
  timerInterval = setInterval(timer, 1000);
}