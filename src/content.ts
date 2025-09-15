function getLicenseInvalidMessage() {
  return chrome.runtime.sendMessage('licenseInvalidMessage');
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', async (event) => {
    const key = event.key.toLowerCase();

    // 인풋이나 텍스트에 포커스가 있으면 무시
    const activeTag = document.activeElement?.tagName.toLowerCase() ?? '';
    if (['input', 'textarea'].includes(activeTag)) return;

    if (key === 'q') {
      const licenseInvalidMessage = await getLicenseInvalidMessage();
      console.log('@@licenseInvalidMessage', licenseInvalidMessage);
      if (licenseInvalidMessage) {
        alert(licenseInvalidMessage);
        return;
      }
    }
  });
});