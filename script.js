
// const VALID_USER_IDS = [
//   "6377853173",
//   "9602816671",
//   "9413301577",
//   "9460091176",
//   "8941039401"
// ];
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

  const userNameInput = document.getElementById("userNameInput");
  sessionStorage.setItem("min", 9);
  sessionStorage.setItem("sec", 59);
  if (userNameInput) {
    userNameInput.focus();
  }

}


// function isValidUserId(userId) {

//   if (!userId) {
//     return false;
//   }

//   return VALID_USER_IDS.includes(userId.trim().toUpperCase());
// }


function handleStartQuiz(event) {

  event.preventDefault();
  const userNameInput = document.getElementById("userNameInput");
  const userIdInput = document.getElementById("userIdInput");
  const errorMessage = document.getElementById("errorMessage");
  const enteredId = userIdInput.value.trim().toUpperCase();
  errorMessage.style.display = "none";
  errorMessage.textContent = "";
  sessionStorage.setItem("currentUserName", userNameInput.value.trim());
  sessionStorage.setItem("currentUserId", enteredId);
  sessionStorage.removeItem("quizAnswers");
  sessionStorage.removeItem("quizResult");
  sessionStorage.removeItem("storedQuizQuestions");

  window.location.href = "quiz.html";
}

async function initQuizPage() {

  const currentUserName = sessionStorage.getItem("currentUserName");

  if (!currentUserName) {
    window.location.href = "index.html";
    return;
  }

  const currentUserBadge = document.getElementById("currentUserBadge");

  if (currentUserBadge) {
    currentUserBadge.textContent = "User: " + currentUserName;
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


  const counter = document.getElementById("questionCounter");

  if (counter) {
    counter.textContent =
      "Question " + (index + 1) + " of " + totalQuestions;
  }


  const questionText = document.getElementById("questionText");

  if (questionText) {
    questionText.textContent = currentQuestion.question;
  }


  const optionsContainer =
    document.getElementById("optionsContainer");

  if (optionsContainer) {

    optionsContainer.innerHTML = "";


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

        sessionStorage.setItem(
          "quizAnswers",
          JSON.stringify(userAnswers)
        );


        const allOptions =
          optionsContainer.querySelectorAll(".option-item");

        allOptions.forEach(function (option) {
          option.classList.remove("selected");
        });

        optionLabel.classList.add("selected");
      });


      optionLabel.appendChild(radio);
      optionLabel.appendChild(
        document.createTextNode(optionText)
      );

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
      submitButton.style.display = "inline-block";
    }

  } else {

    if (nextButton) {
      nextButton.style.display = "inline-block";
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

  const answeredQuestions =
    Object.keys(userAnswers).length;


  if (!isTimeout && answeredQuestions < totalQuestions) {
    const confirmSubmit = window.confirm(
      "You have answered " +
      answeredQuestions +
      " out of " +
      totalQuestions +
      " questions. Are you sure you want to submit?"
    );
    if (!confirmSubmit) {
      return;
    }
  
  }


  let correctCount = 0;


  QUIZ_QUESTIONS.forEach(function (question, index) {

      if (userAnswers[index] === question.correctAnswer) {
        correctCount++;
    }
  });

  const currentUserId =
    sessionStorage.getItem("currentUserId") || "Unknown";
  const currentUserName =
    sessionStorage.getItem("currentUserName") || "Participant";

  const resultData = {
    userId: currentUserId,
    totalQuestions: totalQuestions,
    correctAnswers: correctCount,
    score: correctCount
  };


  sessionStorage.setItem(
    "quizResult",
    JSON.stringify(resultData)
  );

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


    const userId =
      document.getElementById("resultUserId");

    const score =
      document.getElementById("resultScore");

    const total =
      document.getElementById("resultTotal");

    const correct =
      document.getElementById("resultCorrect");


    if (userId) {
      userId.textContent = result.userId;
    }

    if (score) {
      score.textContent =
        result.score + " / " + result.totalQuestions;
    }

    if (total) {
      total.textContent = result.totalQuestions;
    }

    if (correct) {
      correct.textContent = result.correctAnswers;
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
  let min = parseInt(sessionStorage.getItem("min"));
  let sec = parseInt(sessionStorage.getItem("sec"));
  function timer() {
    minutes = min < 10 ? "0" + min : min;
    seconds = sec < 10 ? "0" + sec : sec;
    timerBadge = document.getElementById("timerBadge")
    timerBadge.textContent = "Time: " + minutes + ":" + seconds;
    sec = sec - 1;

    if (min === 0 && sec === 0) {
      alert("Time is up! Submitting quiz...");
      isTimeout = true;
      handleSubmitQuiz(true);
      return;
    }
    if (sec <= 0) {
      min = min - 1;
      sec = 59;
    }
    sessionStorage.setItem("min", min);
    sessionStorage.setItem("sec", sec);
  }
  setInterval(timer, 1000)
}