function loadCss(filename) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = filename;
    document.head.appendChild(link);
}

async function loadHtml(url, elementId) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Chyba: Nelze načíst ${url} (Status: ${response.status})`);
        }
        
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        
        if (elementId === 'main-feed-container') {
            setTimeout(() => {
                const postList = document.getElementById('post-list-container');
                if (postList) {
                    postCounter = postList.querySelectorAll('.post').length + 1;
                }
                const inputArea = document.getElementById('post-input-area');
                if (inputArea) inputArea.style.display = 'none'; 
            }, 100); 
        }

    } catch (error) {
        console.error("Chyba načítání komponenty:", error);
        document.getElementById(elementId).innerHTML = `<div style="padding: 20px; color: red; font-size: 1.2em; border: 2px solid red; margin: 10px;">Chyba: ${error.message}</div>`;
    }
}

// -------------------------------------------------------------
// KLÍČOVÉ OPRAVENÉ CESTY ZDE
// -------------------------------------------------------------
window.onload = function() {
    // 1. CSS SOUBORY JSOU NYNÍ PŘÍMO V HLAVNÍ SLOŽCE
    loadCss('base.css');
    loadCss('components.css');
    
    // 2. HTML KOMPONENTY JSOU TAKÉ PŘÍMO V HLAVNÍ SLOŽCE
    loadHtml('pulsstar-sidebar.html', 'sidebar-container');
    loadHtml('pulsstar-feed.html', 'main-feed-container');
};


let interactions = {
    'post-1': { like: 0, heart: 0, dislike: 0 },
    'post-2': { like: 0, heart: 0, dislike: 0 },
    'post-3': { like: 0, heart: 0, dislike: 0 },
    'post-4': { like: 0, heart: 0, dislike: 0 }
};
let postCounter = 5; 


function handleEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        publishPostFromBox(); 
    }
}

function addEnterListener() {
    const textarea = document.getElementById('post-textarea');
    if (textarea) {
        textarea.addEventListener('keydown', handleEnter);
    }
}

function removeEnterListener() {
    const textarea = document.getElementById('post-textarea');
    if (textarea) {
        textarea.removeEventListener('keydown', handleEnter);
    }
}

function activatePostInput() {
    const collapsedBox = document.getElementById('collapsed-create-box');
    if (collapsedBox) collapsedBox.style.display = 'none'; 
    
    const inputArea = document.getElementById('post-input-area');
    if (inputArea) inputArea.style.display = 'block'; 
    
    const textarea = document.getElementById('post-textarea');
    if (textarea) textarea.focus();
    
    addEnterListener();

    const createBox = document.getElementById('create-box');
    if (createBox) {
        createBox.style.cursor = 'default';
        createBox.onmouseover = null; 
        createBox.onmouseout = null; 
    }
}

function resetPostInput() {
    removeEnterListener();
    
    const textarea = document.getElementById('post-textarea');
    if (textarea) textarea.value = '';

    const inputArea = document.getElementById('post-input-area');
    if (inputArea) inputArea.style.display = 'none'; 

    const collapsedBox = document.getElementById('collapsed-create-box');
    if (collapsedBox) collapsedBox.style.display = 'flex'; 
    
    const createBox = document.getElementById('create-box');
    if (createBox) {
        createBox.style.cursor = 'pointer';
    }
}

function createPostElement(postId, content) {
    const newPostHtml = `
        <div class="post" id="${postId}">
            <div class="post-header">@CurrentUserName | Uzel ${postId.split('-')[1]}</div>
            <div class="post-content">
                <p>${content}</p>
            </div>
            
            <div class="post-actions">
                <div class="action-button-group">
                    <button class="action-btn" data-type="like" onclick="interact('${postId}', 'like')">👍 Like</button>
                    <button class="action-btn" data-type="heart" onclick="interact('${postId}', 'heart')">❤️ Pulz</button>
                    <button class="action-btn" data-type="dislike" onclick="interact('${postId}', 'dislike')">👎 Dislike</button>
                    <button class="action-btn" onclick="toggleComments('${postId}')">💬 Komentovat</button>
                </div>
                
                <div class="counter-group">
                    <span class="action-icon">👍</span> <span id="${postId}-likes" class="counter">0</span>
                    <span class="action-icon">❤️</span> <span id="${postId}-hearts" class="counter">0</span>
                    <span class="action-icon">👎</span> <span id="${postId}-dislikes" class="counter">0</span>
                </div>
            </div>
            <div class="comments-section" id="comments-${postId}">
                <div class="comment-input">
                    <input type="text" placeholder="Odeslat odpověď...">
                    <button onclick="addComment('${postId}', this.previousElementSibling.value)">Odeslat</button>
                </div>
            </div>
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newPostHtml.trim();
    return tempDiv.firstChild;
}

function publishPostFromBox() {
    const textarea = document.getElementById('post-textarea');
    const content = textarea.value.trim();
    
    if (content === "") {
        alert("Vyklop prázdný datový proud. Zadej nějaká data!");
        return;
    }

    const postId = `post-${postCounter}`;
    const newPost = createPostElement(postId, content);
    const postContainer = document.getElementById('post-list-container');
    
    if (postContainer) {
        postContainer.insertBefore(newPost, postContainer.firstChild); 
    }
    
    interactions[postId] = { like: 0, heart: 0, dislike: 0 };
    postCounter++; 
    
    resetPostInput(); 
}

function interact(postId, type) {
    if (interactions[postId] && interactions[postId].hasOwnProperty(type)) {
        interactions[postId][type]++;
        const counterElement = document.getElementById(`${postId}-${type}s`);
        if (counterElement) {
            counterElement.textContent = interactions[postId][type];
        }
    }
}

function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    const commentInputDiv = commentsSection ? commentsSection.querySelector('.comment-input') : null;
    const commentInputElement = commentInputDiv ? commentInputDiv.querySelector('input[type="text"]') : null;

    if (!commentsSection || !commentInputDiv || !commentInputElement) return;

    if (commentsSection.style.display === 'block') {
        commentsSection.style.display = 'none';
        commentInputDiv.style.display = 'none';
        commentInputElement.onkeydown = null;
    } else {
        commentsSection.style.display = 'block';
        commentInputDiv.style.display = 'flex';
        
        commentInputElement.onkeydown = function(event) { handleCommentEnter(event, postId); };
        
        commentInputElement.focus();
    }
}

function handleCommentEnter(event, postId) {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        const inputElement = event.target;
        addComment(postId, inputElement.value);
    }
}

function addComment(postId, text) {
    const textTrimmed = text.trim();
    if (textTrimmed === "") return;
    
    const commentsSection = document.getElementById(`comments-${postId}`);
    
    if (commentsSection) {
        const newComment = document.createElement('div');
        newComment.className = 'comment';
        newComment.innerHTML = `<strong>@CurrentUserName:</strong> ${textTrimmed}`;
        
        const inputDiv = commentsSection.querySelector('.comment-input');
        
        commentsSection.insertBefore(newComment, inputDiv);
        
        inputDiv.querySelector('input[type="text"]').value = '';
        toggleComments(postId); 
    }
}

function showChat() { alert("Otevírám Soukromé Zprávy (simulace)"); }
function openEventModal() { alert("Otevírám dialog pro vytvoření události (simulace)"); }
function gotoGallery() { alert("Otevírám galerii/nahrávání fotek (simulace)"); }
function addLocation() { alert("Přidávám polohu (simulace)"); }
function gotoGifGallery() { alert("Otevírám GIF galerii (simulace)"); }