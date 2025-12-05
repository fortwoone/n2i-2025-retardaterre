document.addEventListener("DOMContentLoaded", () => {

    const answerContainers = document.querySelectorAll('.horizontal.enormousborder');

    answerContainers.forEach((container, questionIndex) => {
        const inputs = container.querySelectorAll('input');

        const newContainerHTML = [];

        let currentNodes = Array.from(container.childNodes);

        container.innerHTML = '';

        currentNodes.forEach(node => {
            if (node.nodeName === "INPUT") {
                let wrapper = document.createElement('label');
                wrapper.className = 'answer-row';

                node.type = "checkbox";
                node.name = `q${questionIndex}`;

                node.addEventListener('change', function () {
                    if (this.checked) {
                        container.querySelectorAll('input').forEach(box => {
                            if (box !== this) box.checked = false;
                        });
                    }
                });

                wrapper.appendChild(node);
                container.appendChild(wrapper);
            } else if (node.nodeType === 3 && node.textContent.trim() !== "") {
                let lastLabel = container.lastElementChild;
                if (lastLabel) {
                    let span = document.createElement('span');
                    span.textContent = node.textContent.trim();
                    lastLabel.appendChild(span);
                }
            }
        });
    });

    const btn = document.getElementById('validate-btn');

    const scoreDiv = document.getElementById('score-display');

    const correctAnswers = [
        0, // Q1 -> A
        1, // Q2 -> B
        0, // Q3 -> A
        1, // Q4 -> B
        1, // Q5 -> B
        0, // Q6 -> A
        1, // Q7 -> B
        1, // Q8 -> B
        0, // Q9 -> A
        0  // Q10 -> A
    ];

    btn.addEventListener('click', () => {
        let score = 0;
        const containers = document.querySelectorAll('.horizontal.enormousborder');

        containers.forEach((container, index) => {
            const inputs = container.querySelectorAll('input');
            const correctIndex = correctAnswers[index];
            let isQuestionCorrect = false;

            container.querySelectorAll('.answer-row').forEach(row => {
                row.classList.remove('correct-answer', 'wrong-answer');
            });

            inputs.forEach((input, inputIndex) => {
                const parentRow = input.parentElement;

                if (inputIndex === correctIndex) {
                    parentRow.classList.add('correct-answer'); 
                    if (input.checked) {
                        isQuestionCorrect = true;
                    }
                }

                if (input.checked && inputIndex !== correctIndex) {
                    parentRow.classList.add('wrong-answer');
                }
            });

            if (isQuestionCorrect) score++;
        });

        scoreDiv.textContent = `Votre score : ${score} / ${correctAnswers.length}`;
        scoreDiv.style.color = score > 5 ? "#27ae60" : "#c0392b";

        scoreDiv.scrollIntoView({ behavior: "smooth" });
    });
});