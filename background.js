chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateComment') {
    const postContent = request.postContent;

    chrome.storage.sync.get(['gemini_api_key', 'gemini_model'], async (result) => {
      const apiKey = result.gemini_api_key;
      const model = result.gemini_model || 'gemini-2.0-flash-exp';

      if (!apiKey) {
        sendResponse({ error: 'Chưa cấu hình API key Gemini. Vui lòng mở extension và nhập key.' });
        return;
      }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const prompt = `Bạn là một người dùng mạng xã hội thân thiện. Hãy viết một bình luận ngắn gọn, tự nhiên, tích cực dựa trên nội dung bài post dưới đây. Chỉ trả về nội dung comment, không thêm giải thích.\n\nNội dung bài post: ${postContent}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 150
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const comment = data.candidates[0].content.parts[0].text.trim();
        sendResponse({ comment });
      } catch (err) {
        console.error('Gemini error:', err);
        sendResponse({ error: err.message });
      }
    });
    return true;
  }
});
