const chapterSelect = document.getElementById('chapter-select');
const questionsContainer = document.getElementById('questions');
const submitButton = document.getElementById('submit');
const scoreDisplay = document.getElementById('score');

let selectedChapterQuestions = []; // To store questions for the selected chapter
let currentChapter = ''; // To store the current chapter name
let currentSubject = ''; // To store the current subject

// Determine the current subject based on the page URL
const pageName = window.location.pathname.split('/').pop();
if (pageName === 'english.html') {
    currentSubject = 'english';
} else if (pageName === 'maths.html') {
    currentSubject = 'maths';
} else if (pageName === 'science.html') {
    currentSubject = 'science';
} else if (pageName === 'hindi.html') {
    currentSubject = 'hindi';
} else if (pageName === 'sst.html') {
    currentSubject = 'sst';
} else if (pageName === 'mindgame.html') {
    currentSubject = 'mindgame';
}

// Fetch chapters for the subject
fetch(`../subjects/${currentSubject}/chapters.json`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(chapters => {
        // Populate the chapter dropdown
        chapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter;
            option.textContent = chapter;
            chapterSelect.appendChild(option);
        });

        // Load questions for the first chapter by default
        if (chapters.length > 0) {
            currentChapter = chapters[0]; // Set the current chapter
            loadQuestions(chapters[0]);
        }
    })
    .catch(error => console.error('Error fetching chapters:', error));

// Function to load questions for a chapter
function loadQuestions(chapter) {
    const chapterFile = `../subjects/${currentSubject}/${chapter.toLowerCase().replace(/ /g, '-')}.json`;
    fetch(chapterFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(questions => {
            // Select 20 random questions (or all if there are fewer than 20)
            selectedChapterQuestions = getRandomQuestions(questions, 30);
            currentChapter = chapter; // Update the current chapter
            renderQuestions();
        })
        .catch(error => console.error('Error fetching questions:', error));
}

// Function to get random questions
function getRandomQuestions(questions, count) {
    if (questions.length <= count) {
        return questions; // Return all questions if there are fewer than `count`
    }
    // Shuffle the array and select the first `count` questions
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to render questions
function renderQuestions() {
    // Clear existing questions
    questionsContainer.innerHTML = '';

    selectedChapterQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';

        const questionText = document.createElement('h3');
        questionText.textContent = `${index + 1}. ${q.question}`;
        questionDiv.appendChild(questionText);

        const choicesDiv = document.createElement('div');
        choicesDiv.className = 'choices';

        q.choices.forEach((choice, i) => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question${index}`;
            input.value = i;
            input.addEventListener('change', () => handleAnswerSelection(index, i, q.correctAnswer, choicesDiv));
            label.appendChild(input);
            label.appendChild(document.createTextNode(choice));
            choicesDiv.appendChild(label);
        });

        questionDiv.appendChild(choicesDiv);
        questionsContainer.appendChild(questionDiv);
    });
}

// Function to handle answer selection
function handleAnswerSelection(questionIndex, selectedChoiceIndex, correctAnswerIndex, choicesDiv) {
    // Disable all radio buttons after selection
    const radioButtons = choicesDiv.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.disabled = true;
    });

    // Highlight the selected choice
    const selectedLabel = choicesDiv.querySelector(`input[value="${selectedChoiceIndex}"]`).parentElement;
    if (selectedChoiceIndex === correctAnswerIndex) {
        selectedLabel.classList.add('correct'); // Add green color for correct answer
    } else {
        selectedLabel.classList.add('incorrect'); // Add red color for incorrect answer
        // Highlight the correct answer
        const correctLabel = choicesDiv.querySelector(`input[value="${correctAnswerIndex}"]`).parentElement;
        correctLabel.classList.add('correct');
    }
}

// Event listener for chapter selection
chapterSelect.addEventListener('change', () => {
    const selectedChapter = chapterSelect.value;
    currentChapter = selectedChapter; // Update the current chapter
    loadQuestions(selectedChapter);
});

// Submit button functionality
submitButton.addEventListener('click', () => {
    let score = 0;
    selectedChapterQuestions.forEach((q, index) => {
        const selectedAnswer = document.querySelector(`input[name="question${index}"]:checked`);
        if (selectedAnswer && parseInt(selectedAnswer.value) === q.correctAnswer) {
            score++;
        }
    });

    // Display the score with the chapter name
    scoreDisplay.textContent = `Your score for ${currentChapter} is ${score} out of ${selectedChapterQuestions.length}`;
});