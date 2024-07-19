let selectedCard = null;
let history = [];
let historyIndex = -1;
let currentTextElement = null;

document.addEventListener('DOMContentLoaded', () => {
    selectedCard = document.getElementById('selected-card');
    document.getElementById('text-container').remove(); // Remove the default text container
    saveState();
});

function addText() {
    const textContainer = document.createElement('div');
    textContainer.className = 'text-element';
    textContainer.contentEditable = true;
    textContainer.innerHTML = 'Enter your text here';
    textContainer.style.top = '100px';
    textContainer.style.left = '100px';
    textContainer.addEventListener('input', saveState);
    textContainer.addEventListener('mousedown', onDragStart);
    textContainer.addEventListener('focus', () => setCurrentTextElement(textContainer));
    document.querySelector('.card-container').appendChild(textContainer);
    setCurrentTextElement(textContainer);
    saveState();
}

function setCurrentTextElement(element) {
    currentTextElement = element;
}

function selectCard(card) {
    selectedCard.src = card.src;
    saveState();
}

function changeFont(font) {
    if (currentTextElement) {
        currentTextElement.style.fontFamily = font;
        saveState();
    }
}

function changeColor(color) {
    if (currentTextElement) {
        currentTextElement.style.color = color;
        saveState();
    }
}

function changeSize(size) {
    if (currentTextElement) {
        currentTextElement.style.fontSize = `${size}px`;
        saveState();
    }
}

function toggleBold() {
    if (currentTextElement) {
        const isBold = currentTextElement.style.fontWeight === 'bold';
        currentTextElement.style.fontWeight = isBold ? 'normal' : 'bold';
        saveState();
    }
}

function toggleItalic() {
    if (currentTextElement) {
        const isItalic = currentTextElement.style.fontStyle === 'italic';
        currentTextElement.style.fontStyle = isItalic ? 'normal' : 'italic';
        saveState();
    }
}

function saveState() {
    history = history.slice(0, historyIndex + 1);
    const state = {
        selectedCard: selectedCard.src,
        texts: []
    };
    document.querySelectorAll('.text-element').forEach(textElement => {
        state.texts.push({
            font: textElement.style.fontFamily,
            color: textElement.style.color,
            text: textElement.innerHTML,
            top: textElement.style.top,
            left: textElement.style.left,
            fontWeight: textElement.style.fontWeight,
            fontStyle: textElement.style.fontStyle
        });
    });
    history.push(state);
    historyIndex++;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        applyState(history[historyIndex]);
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        applyState(history[historyIndex]);
    }
}

function applyState(state) {
    selectedCard.src = state.selectedCard;
    const cardContainer = document.querySelector('.card-container');
    cardContainer.querySelectorAll('.text-element').forEach(el => el.remove());
    state.texts.forEach(textState => {
        const textContainer = document.createElement('div');
        textContainer.className = 'text-element';
        textContainer.contentEditable = true;
        textContainer.innerHTML = textState.text;
        textContainer.style.fontFamily = textState.font;
        textContainer.style.color = textState.color;
        textContainer.style.top = textState.top;
        textContainer.style.left = textState.left;
        textContainer.style.fontWeight = textState.fontWeight || 'normal';
        textContainer.style.fontStyle = textState.fontStyle || 'normal';
        textContainer.addEventListener('input', saveState);
        textContainer.addEventListener('mousedown', onDragStart);
        textContainer.addEventListener('focus', () => setCurrentTextElement(textContainer));
        cardContainer.appendChild(textContainer);
    });
}

function onDragStart(event) {
    const textElement = event.target;
    const rect = textElement.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    function onDragMove(event) {
        const containerRect = textElement.parentElement.getBoundingClientRect();

        const maxX = containerRect.width - rect.width;
        const maxY = containerRect.height - rect.height;

        let newX = event.clientX - offsetX - containerRect.left;
        let newY = event.clientY - offsetY - containerRect.top;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        textElement.style.left = `${newX}px`;
        textElement.style.top = `${newY}px`;
    }

    function onDragEnd() {
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        saveState();
    }

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
}

function downloadCard() {
    html2canvas(document.querySelector('.card-container')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'invitation_card.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(error => {
        console.error('Error generating image:', error);
    });
}

