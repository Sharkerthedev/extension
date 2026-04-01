function getPostContent(clickedElement) {
  let postContainer = clickedElement.closest('[role="article"]');
  if (!postContainer) return null;

  const textElements = postContainer.querySelectorAll('div[dir="auto"]');
  let content = '';
  textElements.forEach(el => {
    const text = el.innerText.trim();
    if (text && !el.closest('a') && !el.closest('button')) {
      content += text + ' ';
    }
  });
  return content.trim() || null;
}

function findCommentBox(postContainer) {
  const commentArea = postContainer.querySelector('form[method="post"] textarea, div[aria-label*="comment"] textarea, div[contenteditable="true"]');
  if (commentArea) return commentArea;
  return document.querySelector('textarea[placeholder*="comment"], div[contenteditable="true"][aria-label*="comment"]');
}

function fillComment(commentText, commentBox) {
  if (commentBox.tagName === 'TEXTAREA') {
    commentBox.value = commentText;
    commentBox.dispatchEvent(new Event('input', { bubbles: true }));
  } else if (commentBox.isContentEditable) {
    commentBox.innerText = commentText;
    commentBox.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

document.addEventListener('click', async (event) => {
  const postElement = event.target.closest('[role="article"]');
  if (!postElement) return;

  const postContent = getPostContent(postElement);
  if (!postContent) {
    console.log('Không thể lấy nội dung bài post.');
    return;
  }

  const commentBox = findCommentBox(postElement);
  if (!commentBox) {
    console.log('Không tìm thấy ô comment.');
    return;
  }

  commentBox.focus();

  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'ai-auto-comment-loading';
  loadingDiv.textContent = 'Đang tạo comment bằng AI...';
  document.body.appendChild(loadingDiv);

  chrome.runtime.sendMessage(
    { action: 'generateComment', postContent: postContent },
    (response) => {
      loadingDiv.remove();
      if (response.error) {
        console.error('Lỗi AI:', response.error);
        const errorMsg = document.createElement('div');
        errorMsg.textContent = '❌ ' + response.error;
        errorMsg.style.cssText = 'position:fixed; bottom:10px; right:10px; background:red; color:white; padding:5px; border-radius:5px; z-index:9999;';
        document.body.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 5000);
        return;
      }

      fillComment(response.comment, commentBox);
    }
  );
});
