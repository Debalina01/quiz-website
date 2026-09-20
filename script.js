
const VALID_USER_IDS = [
  "6377853173",
  "9602816671",
  "9413301577",
  "9460091176"
];


const QUIZ_QUESTIONS = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language"
    ],
    correctAnswer: 0
  },

  {
    question: "Which CSS property is used to change the text color of an element?",
    options: [
      "font-color",
      "text-color",
      "color",
      "background-color"
    ],
    correctAnswer: 2
  },

  {
    question: "Which JavaScript keyword is used to declare a constant variable?",
    options: [
      "var",
      "let",
      "constant",
      "const"
    ],
    correctAnswer: 3
  },

  {
    question: "Inside which HTML element do we put JavaScript code?",
    options: [
      "<js>",
      "<script>",
      "<javascript>",
      "<scripting>"
    ],
    correctAnswer: 1
  },

  {
    question: "Which of the following is NOT a JavaScript data type?",
    options: [
      "Boolean",
      "Undefined",
      "Number",
      "Float"
    ],
    correctAnswer: 3
  }
];


let currentQuestionIndex = 0;
let userAnswers = {};


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

  if (userIdInput) {
    userIdInput.focus();
  }

}


function isValidUserId(userId) {

  if (!userId) {
    return false;
  }

  return VALID_USER_IDS.includes(userId.trim().toUpperCase());
}


function handleStartQuiz(event) {

  event.preventDefault();

  const userIdInput = document.getElementById("userIdInput");
  const errorMessage = document.getElementById("errorMessage");

  const enteredId = userIdInput.value.trim().toUpperCase();

  if (isValidUserId(enteredId)) {

    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    sessionStorage.setItem("currentUserId", enteredId);
    sessionStorage.removeItem("quizAnswers");
    sessionStorage.removeItem("quizResult");

    window.location.href = "quiz.html";

  } else {

    errorMessage.textContent = "Invalid User ID. Please enter a valid User ID.";
    errorMessage.style.display = "block";

    userIdInput.focus();
  }
}

function initQuizPage() {

  const currentUserId = sessionStorage.getItem("currentUserId");

  if (!currentUserId) {
    window.location.href = "index.html";
    return;
  }

  const currentUserBadge = document.getElementById("currentUserBadge");

  if (currentUserBadge) {
    currentUserBadge.textContent = "User: " + currentUserId;
  }


  const savedAnswers = sessionStorage.getItem("quizAnswers");

  if (savedAnswers) {

    try {
      userAnswers = JSON.parse(savedAnswers);

    } catch (error) {
      userAnswers = {};
    }

  }


  currentQuestionIndex = 0;

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


  if (answeredQuestions < totalQuestions) {

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
  sessionStorage.removeItem("quizAnswers");
  sessionStorage.removeItem("quizResult");

  window.location.href = "index.html";
}