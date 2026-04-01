document.getElementById('save').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  const modelName = document.getElementById('modelName').value.trim();
  chrome.storage.sync.set({ gemini_api_key: apiKey, gemini_model: modelName }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Cấu hình đã lưu!';
    setTimeout(() => status.textContent = '', 2000);
  });
});

chrome.storage.sync.get(['gemini_api_key', 'gemini_model'], (result) => {
  if (result.gemini_api_key) {
    document.getElementById('apiKey').value = result.gemini_api_key;
  }
  if (result.gemini_model) {
    document.getElementById('modelName').value = result.gemini_model;
  }
});
