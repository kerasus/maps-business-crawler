const logBox = document.getElementById("logBox");

// Listen for logs from the main process
window.electronAPI.onLogUpdate((data) => {
    // Append new log data
    const newLog = document.createElement("div");
    newLog.textContent = `> ${data}`;
    logBox.appendChild(newLog);

    // Auto-scroll to bottom
    logBox.scrollTop = logBox.scrollHeight;
});

document.getElementById("collect").onclick = () => {
    logBox.innerHTML += "<div>[System] Starting Link Collection...</div>";
    window.electronAPI.collectLinks();
};

document.getElementById("crawl").onclick = () => {
    logBox.innerHTML += "<div>[System] Starting Detail Crawling...</div>";
    window.electronAPI.crawlDetails();
};
