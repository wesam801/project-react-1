const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#teggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");


let userMessage = null;


const API_KEY = "AIzaSyDtAH4hjAIRfXPdRNnq4oE-RiJmTn9q0ys";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;


const loadLocalstorageData = () => {
    const savedChats = localStorage.getItem("savedChats")
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    chatList.innerHTML = savedChats || "";

    document.body.classList.toggle("hide-header", savedChats);
    chatList.scrollTo(0, chatList.scrollHeight);
}

loadLocalstorageData();

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    const typingInterval = setInterval(() => {

    textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icone").classList.add("hide");
    chatList.scrollTo(0, chatList.scrollHeight);

    if(currentWordIndex === words.length) {
        clearInterval(typingInterval);
        incomingMessageDiv.querySelector(".icone").classList.remove("hide");
        localStorage.setItem("savedChats", chatList.innerHTML);
        chatList.scrollTo(0, chatList.scrollHeight);
    }
    }, 90);
}

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{text: userMessage}]
                }]
            })
        });
        const data = await response.json();

        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1");
        showTypingEffect(apiResponse, textElement, incomingMessageDiv)
        // textElement.innerText = apiResponse;
    } catch (error) {
        console.log(error)
    } finally{
        incomingMessageDiv.classList.remove("loading");
    }
}

const showLoadingAnimation = () => {
    const html = `<div class="message-content">
                        <img src="images/file.png" alt="" class="avatar">
                        <p class="text"></p>
                        <div class="loading-indicator">
                            <div class="loading-bar"></div>
                            <div class="loading-bar"></div>
                            <div class="loading-bar"></div>
                        </div>
                    </div>
                    <span onclick="copyMessage(this)" class="icone material-symbols-rounded">content_copy</span>`;
    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);

    chatList.scrollTo(0, chatList.scrollHeight);
    generateAPIResponse(incomingMessageDiv);
}

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done";
    setTimeout(() => copyIcon.innerText = "content_copy", 1000);

}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim();
    if(!userMessage) return;

    const html = `<div class="message-content">
                  <img src="images/user.svg" alt="" class="avatar">
                  <p class="text"></p>
                  </div>`;
    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.querySelector(".typing-input").value = "";
    typingForm.reset();
    chatList.scrollTo(0, chatList.scrollHeight);
    document.body.classList.add("hide-header");
    setTimeout(showLoadingAnimation, 500);
}

toggleThemeButton.addEventListener("click", () => {
    const inLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", inLightMode ? "light_mode" : "dark_mode")
    toggleThemeButton.innerText = inLightMode ? "dark_mode" : "light_mode";
});

deleteChatButton.addEventListener("click", () => {
    if(confirm("Are you sure you want to delete all messages")){
        localStorage.removeItem("savedChats");
        loadLocalstorageData();
    }
})

typingForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the form from submitting in the traditional way
    handleOutgoingChat();
});

typingForm.querySelector(".typing-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        if (event.shiftKey) {
            // If Shift + Enter is pressed, add a new line
            const cursorPosition = event.target.selectionStart;
            const value = event.target.value;
            event.target.value = value.substring(0, cursorPosition) + "\n" + value.substring(cursorPosition);
            event.target.selectionStart = cursorPosition + 1;
            event.target.selectionEnd = cursorPosition + 1;
        } else {
            // If only Enter is pressed, send the message
            event.preventDefault();
            handleOutgoingChat();
        }
    }
});