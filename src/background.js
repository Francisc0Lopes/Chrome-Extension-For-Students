// Service Worker V3

// Evento de instalação da extensão
chrome.runtime.onInstalled.addListener(() => {
  console.log("Student Buddy instalado!");
});

// Listener de mensagens do popup.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "notify") {
    // Criar notificação
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: msg.title || "Student Buddy",
      message: msg.message || "",
      priority: 2
    });
  }

  // Podemos adicionar aqui outras ações no futuro, como alarms
  // Exemplo: if(msg.action === "alarm") { ... }

  // Responder ao remetente se necessário
  if (sendResponse) {
    sendResponse({ status: "ok" });
  }
  return true; // Mantém canal aberto para resposta assíncrona
});
