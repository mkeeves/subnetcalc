// Utility functions
function ipToNum(ip) {
  return ip.split('.').map(Number).reduce((acc, val) => (acc << 8) + val, 0);
}

function numToIP(num) {
  return [24,16,8,0].map(b => (num >> b) & 255).join('.');
}

function ipToBinary(ip) {
  return ip.split('.').map(octet => {
    return parseInt(octet, 10).toString(2).padStart(8, '0');
  }).join('.');
}

function ipToHex(ip) {
  return ip.split('.').map(octet => {
    return parseInt(octet, 10).toString(16).padStart(2, '0').toUpperCase();
  }).join('.');
}

function getNetworkClass(ip) {
  const firstOctet = parseInt(ip.split('.')[0], 10);
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
  if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)';
  return 'Invalid';
}

function validateIP(ip) {
  const ipParts = ip.split('.').map(Number);
  if (ipParts.length !== 4) return false;
  return ipParts.every(p => p >= 0 && p <= 255);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show feedback
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'Copied!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  });
}

// Enhanced Subnet Calculator
function calculate() {
  const input = document.getElementById('ipInput').value.trim();
  const [ip, cidr] = input.split('/');
  const maskBits = parseInt(cidr, 10);

  if (!ip || isNaN(maskBits) || maskBits < 0 || maskBits > 32) {
    document.getElementById('output').innerHTML = '<p class="error">Invalid input. Please use format: IP/CIDR (e.g., 192.168.1.1/24)</p>';
    return;
  }

  if (!validateIP(ip)) {
    document.getElementById('output').innerHTML = '<p class="error">Invalid IP address</p>';
    return;
  }

  const ipNum = ipToNum(ip);
  const mask = 0xFFFFFFFF << (32 - maskBits) >>> 0;
  const wildcard = (~mask >>> 0) & 0xFFFFFFFF;
  const network = ipNum & mask;
  const broadcast = network | (~mask >>> 0);
  const firstHost = (maskBits < 31) ? network + 1 : network;
  const lastHost = (maskBits < 31) ? broadcast - 1 : broadcast;
  const hostCount = (maskBits < 31) ? (lastHost - firstHost + 1) : ((maskBits === 31) ? 2 : 1);
  const networkClass = getNetworkClass(ip);

  const output = document.getElementById('output');
  output.innerHTML = `
    <div class="result-section">
      <h3>Network Information</h3>
      <div class="result-grid">
        <div class="result-item">
          <label>IP Address:</label>
          <div class="value-with-copy" onclick="copyToClipboard('${ip}')">
            <span>${ip}</span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>Network Class:</label>
          <span>${networkClass}</span>
        </div>
        <div class="result-item">
          <label>Network Address:</label>
          <div class="value-with-copy" onclick="copyToClipboard('${numToIP(network)}')">
            <span>${numToIP(network)}</span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>Subnet Mask:</label>
          <div class="value-with-copy" onclick="copyToClipboard('${numToIP(mask)}')">
            <span>${numToIP(mask)} /${maskBits}</span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>Wildcard Mask:</label>
          <div class="value-with-copy" onclick="copyToClipboard('${numToIP(wildcard)}')">
            <span>${numToIP(wildcard)}</span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>Broadcast Address:</label>
          <div class="value-with-copy" onclick="copyToClipboard('${numToIP(broadcast)}')">
            <span>${numToIP(broadcast)}</span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>First Host:</label>
          <div class="value-with-copy" onclick="copyToClipboard('${numToIP(firstHost)}')">
            <span>${numToIP(firstHost)}</span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>Last Host:</label>
          <div class="value-with-copy" onclick="copyToClipboard('${numToIP(lastHost)}')">
            <span>${numToIP(lastHost)}</span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>Total Hosts:</label>
          <span>${hostCount}</span>
        </div>
        <div class="result-item">
          <label>Usable Hosts:</label>
          <span>${Math.max(0, hostCount - (maskBits < 31 ? 2 : 0))}</span>
        </div>
      </div>
    </div>
    <div class="result-section">
      <h3>Binary Representation</h3>
      <div class="binary-display">
        <div class="binary-row">
          <label>IP Address:</label>
          <code>${ipToBinary(ip)}</code>
        </div>
        <div class="binary-row">
          <label>Subnet Mask:</label>
          <code>${ipToBinary(numToIP(mask))}</code>
        </div>
        <div class="binary-row">
          <label>Network:</label>
          <code>${ipToBinary(numToIP(network))}</code>
        </div>
        <div class="binary-row">
          <label>Broadcast:</label>
          <code>${ipToBinary(numToIP(broadcast))}</code>
        </div>
      </div>
    </div>
    <div class="result-section">
      <h3>Hexadecimal Representation</h3>
      <div class="binary-display">
        <div class="binary-row">
          <label>IP Address:</label>
          <code>${ipToHex(ip)}</code>
        </div>
        <div class="binary-row">
          <label>Subnet Mask:</label>
          <code>${ipToHex(numToIP(mask))}</code>
        </div>
        <div class="binary-row">
          <label>Network:</label>
          <code>${ipToHex(numToIP(network))}</code>
        </div>
        <div class="binary-row">
          <label>Broadcast:</label>
          <code>${ipToHex(numToIP(broadcast))}</code>
        </div>
      </div>
    </div>
  `;
}

// VLSM Calculator
function calculateVLSM() {
  const baseInput = document.getElementById('vlsmBase').value.trim();
  const hostLines = document.getElementById('vlsmSizes').value.trim()
    .split('\n')
    .map(h => parseInt(h.trim()))
    .filter(n => !isNaN(n) && n > 0);

  if (hostLines.length === 0) {
    document.getElementById('vlsmOutput').innerHTML = '<p class="error">Please enter at least one host requirement</p>';
    return;
  }

  const [baseIP, baseCIDR] = baseInput.split('/');
  const baseMaskBits = parseInt(baseCIDR, 10);

  if (!baseIP || isNaN(baseMaskBits) || baseMaskBits < 0 || baseMaskBits > 32 || !validateIP(baseIP)) {
    document.getElementById('vlsmOutput').innerHTML = '<p class="error">Invalid base network</p>';
    return;
  }

  const baseNum = ipToNum(baseIP);
  const baseMask = 0xFFFFFFFF << (32 - baseMaskBits) >>> 0;
  const baseNetwork = baseNum & baseMask;
  let currentIP = baseNetwork;

  let result = '<div class="vlsm-results">';
  const sortedHosts = [...hostLines].sort((a, b) => b - a); // largest first

  for (let i = 0; i < sortedHosts.length; i++) {
    const hosts = sortedHosts[i];
    const needed = hosts + 2; // network + broadcast
    const bits = Math.max(0, 32 - Math.ceil(Math.log2(needed)));
    const mask = 0xFFFFFFFF << (32 - bits) >>> 0;
    const size = Math.pow(2, 32 - bits);
    const network = currentIP;
    const broadcast = network + size - 1;
    const firstHost = size > 2 ? network + 1 : network;
    const lastHost = size > 2 ? broadcast - 1 : broadcast;

    // Check if we exceed the base network
    if ((network & baseMask) !== baseNetwork) {
      result += `<p class="error">Subnet ${i + 1} (${hosts} hosts) exceeds base network range!</p>`;
      break;
    }

    result += `
      <div class="vlsm-item">
        <h4>Subnet ${i + 1}: ${hosts} hosts required</h4>
        <div class="result-grid">
          <div class="result-item">
            <label>Network:</label>
            <span>${numToIP(network)}/${bits}</span>
          </div>
          <div class="result-item">
            <label>Subnet Mask:</label>
            <span>${numToIP(mask)}</span>
          </div>
          <div class="result-item">
            <label>Host Range:</label>
            <span>${numToIP(firstHost)} – ${numToIP(lastHost)}</span>
          </div>
          <div class="result-item">
            <label>Broadcast:</label>
            <span>${numToIP(broadcast)}</span>
          </div>
          <div class="result-item">
            <label>Total Hosts:</label>
            <span>${size - 2}</span>
          </div>
        </div>
      </div>
    `;

    currentIP += size;
  }

  result += '</div>';
  document.getElementById('vlsmOutput').innerHTML = result;
}

// Subnet Splitting
function calculateSplit() {
  const networkInput = document.getElementById('splitNetwork').value.trim();
  const splitCount = parseInt(document.getElementById('splitCount').value, 10);

  if (!networkInput || isNaN(splitCount) || splitCount < 2) {
    document.getElementById('splitOutput').innerHTML = '<p class="error">Please enter a valid network and number of subnets (minimum 2)</p>';
    return;
  }

  const [ip, cidr] = networkInput.split('/');
  const maskBits = parseInt(cidr, 10);

  if (!ip || isNaN(maskBits) || maskBits < 0 || maskBits > 32 || !validateIP(ip)) {
    document.getElementById('splitOutput').innerHTML = '<p class="error">Invalid network</p>';
    return;
  }

  const requiredBits = Math.ceil(Math.log2(splitCount));
  const newMaskBits = maskBits + requiredBits;

  if (newMaskBits > 32) {
    document.getElementById('splitOutput').innerHTML = '<p class="error">Cannot split into that many subnets. Maximum: ' + Math.pow(2, 32 - maskBits) + ' subnets</p>';
    return;
  }

  const ipNum = ipToNum(ip);
  const baseMask = 0xFFFFFFFF << (32 - maskBits) >>> 0;
  const baseNetwork = ipNum & baseMask;
  const subnetSize = Math.pow(2, 32 - newMaskBits);

  let result = `<p><strong>Splitting ${networkInput} into ${splitCount} subnets:</strong></p><div class="vlsm-results">`;
  
  for (let i = 0; i < splitCount; i++) {
    const network = baseNetwork + (i * subnetSize);
    const broadcast = network + subnetSize - 1;
    const firstHost = network + 1;
    const lastHost = broadcast - 1;

    result += `
      <div class="vlsm-item">
        <h4>Subnet ${i + 1}</h4>
        <div class="result-grid">
          <div class="result-item">
            <label>Network:</label>
            <span>${numToIP(network)}/${newMaskBits}</span>
          </div>
          <div class="result-item">
            <label>Host Range:</label>
            <span>${numToIP(firstHost)} – ${numToIP(lastHost)}</span>
          </div>
          <div class="result-item">
            <label>Broadcast:</label>
            <span>${numToIP(broadcast)}</span>
          </div>
          <div class="result-item">
            <label>Hosts:</label>
            <span>${subnetSize - 2}</span>
          </div>
        </div>
      </div>
    `;
  }

  result += '</div>';
  document.getElementById('splitOutput').innerHTML = result;
}

// Supernetting (Route Aggregation)
function calculateSupernet() {
  const networksInput = document.getElementById('supernetNetworks').value.trim();
  const networks = networksInput.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (networks.length < 2) {
    document.getElementById('supernetOutput').innerHTML = '<p class="error">Please enter at least 2 networks</p>';
    return;
  }

  // Parse all networks
  const parsedNetworks = [];
  for (const net of networks) {
    const [ip, cidr] = net.split('/');
    const maskBits = parseInt(cidr, 10);
    if (!ip || isNaN(maskBits) || maskBits < 0 || maskBits > 32 || !validateIP(ip)) {
      document.getElementById('supernetOutput').innerHTML = '<p class="error">Invalid network: ' + net + '</p>';
      return;
    }
    const ipNum = ipToNum(ip);
    const mask = 0xFFFFFFFF << (32 - maskBits) >>> 0;
    const network = ipNum & mask;
    parsedNetworks.push({ ip, cidr: maskBits, network, mask, original: net });
  }

  // Find common prefix
  let commonPrefix = 32;
  const firstNetwork = parsedNetworks[0].network;
  const lastNetwork = parsedNetworks[parsedNetworks.length - 1].network;

  // Find the longest common prefix
  for (let i = 0; i < 32; i++) {
    const mask = 0xFFFFFFFF << (32 - i) >>> 0;
    const firstNet = firstNetwork & mask;
    const lastNet = lastNetwork & mask;
    if (firstNet === lastNet) {
      commonPrefix = i;
    } else {
      break;
    }
  }

  // Check if all networks fit in the common prefix
  const supernetMask = 0xFFFFFFFF << (32 - commonPrefix) >>> 0;
  const supernetNetwork = firstNetwork & supernetMask;

  // Verify all networks are within the supernet
  const allFit = parsedNetworks.every(net => {
    return (net.network & supernetMask) === supernetNetwork;
  });

  if (!allFit) {
    document.getElementById('supernetOutput').innerHTML = '<p class="error">These networks cannot be aggregated into a single supernet</p>';
    return;
  }

  const broadcast = supernetNetwork | (~supernetMask >>> 0);

  let result = `
    <div class="result-section">
      <h3>Supernet (Aggregated Route)</h3>
      <div class="result-grid">
        <div class="result-item">
          <label>Supernet:</label>
          <div class="value-with-copy" onclick="copyToClipboard('${numToIP(supernetNetwork)}/${commonPrefix}')">
            <span>${numToIP(supernetNetwork)}/${commonPrefix}</span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>Subnet Mask:</label>
          <span>${numToIP(supernetMask)}</span>
        </div>
        <div class="result-item">
          <label>Range:</label>
          <span>${numToIP(supernetNetwork)} – ${numToIP(broadcast)}</span>
        </div>
      </div>
    </div>
    <div class="result-section">
      <h3>Input Networks</h3>
      <ul class="network-list">
        ${parsedNetworks.map(net => `<li>${net.original}</li>`).join('')}
      </ul>
    </div>
  `;

  document.getElementById('supernetOutput').innerHTML = result;
}

// IP Converter
function convertIP() {
  const ip = document.getElementById('converterInput').value.trim();

  if (!validateIP(ip)) {
    document.getElementById('converterOutput').innerHTML = '<p class="error">Invalid IP address</p>';
    return;
  }

  const ipNum = ipToNum(ip);
  const binary = ipToBinary(ip);
  const hex = ipToHex(ip);
  const networkClass = getNetworkClass(ip);
  const decimal = ipNum;

  const output = document.getElementById('converterOutput');
  output.innerHTML = `
    <div class="result-section">
      <h3>IP Address Conversions</h3>
      <div class="result-grid">
        <div class="result-item">
          <label>Decimal (Dotted):</label>
          <div class="value-with-copy" onclick="copyToClipboard('${ip}')">
            <span>${ip}</span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>Decimal (32-bit):</label>
          <div class="value-with-copy" onclick="copyToClipboard('${decimal}')">
            <span>${decimal}</span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>Binary:</label>
          <div class="value-with-copy" onclick="copyToClipboard('${binary}')">
            <span><code>${binary}</code></span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>Hexadecimal:</label>
          <div class="value-with-copy" onclick="copyToClipboard('${hex}')">
            <span><code>${hex}</code></span>
            <span class="copy-icon">📋</span>
          </div>
        </div>
        <div class="result-item">
          <label>Network Class:</label>
          <span>${networkClass}</span>
        </div>
      </div>
    </div>
    <div class="result-section">
      <h3>Binary Breakdown</h3>
      <div class="binary-display">
        ${ip.split('.').map((octet, i) => `
          <div class="binary-row">
            <label>Octet ${i + 1} (${octet}):</label>
            <code>${parseInt(octet, 10).toString(2).padStart(8, '0')}</code>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Tab functionality
document.addEventListener('DOMContentLoaded', () => {
  // Dark mode toggle
  const toggleButton = document.getElementById('toggleTheme');
  toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Remove active class from all tabs and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked tab and corresponding content
      button.classList.add('active');
      document.getElementById(targetTab + '-tab').classList.add('active');
    });
  });

  // Enter key support for inputs
  document.getElementById('ipInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculate();
  });
  document.getElementById('converterInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') convertIP();
  });
  document.getElementById('splitNetwork').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateSplit();
  });
});
