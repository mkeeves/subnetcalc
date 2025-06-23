function ipToNum(ip) {
  return ip.split('.').map(Number).reduce((acc, val) => (acc << 8) + val, 0);
}

function numToIP(num) {
  return [24,16,8,0].map(b => (num >> b) & 255).join('.');
}

function calculate() {
  const input = document.getElementById('ipInput').value.trim();
  const [ip, cidr] = input.split('/');
  const maskBits = parseInt(cidr, 10);

  if (!ip || isNaN(maskBits) || maskBits < 0 || maskBits > 32) {
    document.getElementById('output').innerText = "Invalid input";
    return;
  }

  const ipParts = ip.split('.').map(Number);
  if (ipParts.length !== 4 || ipParts.some(p => p < 0 || p > 255)) {
    document.getElementById('output').innerText = "Invalid IP";
    return;
  }

  const ipNum = ipParts.reduce((acc, part) => (acc << 8) + part, 0);
  const mask = 0xFFFFFFFF << (32 - maskBits) >>> 0;
  const network = ipNum & mask;
  const broadcast = network | (~mask >>> 0);
  const firstHost = network + 1;
  const lastHost = broadcast - 1;
  const hostCount = (maskBits < 31) ? (lastHost - firstHost + 1) : 0;

  document.getElementById('output').innerHTML = `
    <p><strong>Network:</strong> ${numToIP(network)}</p>
    <p><strong>Broadcast:</strong> ${numToIP(broadcast)}</p>
    <p><strong>First Host:</strong> ${numToIP(firstHost)}</p>
    <p><strong>Last Host:</strong> ${numToIP(lastHost)}</p>
    <p><strong>Total Hosts:</strong> ${hostCount}</p>
    <p><strong>Subnet Mask:</strong> ${numToIP(mask)} (${maskBits})</p>
  `;
}

function calculateVLSM() {
  const baseInput = document.getElementById('vlsmBase').value.trim();
  const hostLines = document.getElementById('vlsmSizes').value.trim().split('\n').map(h => parseInt(h)).filter(n => !isNaN(n));

  const [baseIP, baseCIDR] = baseInput.split('/');
  const baseNum = ipToNum(baseIP);
  const baseMaskBits = parseInt(baseCIDR, 10);
  const baseMask = 0xFFFFFFFF << (32 - baseMaskBits) >>> 0;
  let currentIP = baseNum;

  if (!baseIP || isNaN(baseMaskBits) || baseMaskBits < 0 || baseMaskBits > 32) {
    document.getElementById('vlsmOutput').innerText = "Invalid base network";
    return;
  }

  let result = '';
  const sortedHosts = hostLines.sort((a, b) => b - a); // largest first

  for (const hosts of sortedHosts) {
    const needed = hosts + 2;
    const bits = 32 - Math.ceil(Math.log2(needed));
    const mask = 0xFFFFFFFF << (32 - bits) >>> 0;
    const size = Math.pow(2, 32 - bits);
    const network = currentIP;
    const broadcast = network + size - 1;
    const firstHost = size > 2 ? network + 1 : network;
    const lastHost = size > 2 ? broadcast - 1 : broadcast;

    result += `
      <p><strong>${hosts} hosts</strong><br>
      Subnet: ${numToIP(network)}/${bits} (${numToIP(mask)})<br>
      Range: ${numToIP(firstHost)} – ${numToIP(lastHost)}<br>
      Broadcast: ${numToIP(broadcast)}</p>
    `;

    currentIP += size;
  }

  document.getElementById('vlsmOutput').innerHTML = result;
}
