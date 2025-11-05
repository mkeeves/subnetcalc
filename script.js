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

function parseSubnetMask(mask) {
  // Check if it's CIDR notation
  if (mask.startsWith('/')) {
    const cidr = parseInt(mask.substring(1), 10);
    if (isNaN(cidr) || cidr < 0 || cidr > 32) return null;
    return { mask: 0xFFFFFFFF << (32 - cidr) >>> 0, cidr };
  }
  
  // Check if it's a valid subnet mask
  if (!validateIP(mask)) return null;
  
  const maskNum = ipToNum(mask);
  const cidr = countBits(maskNum);
  
  // Validate it's a proper subnet mask (all 1s followed by all 0s)
  const expectedMask = 0xFFFFFFFF << (32 - cidr) >>> 0;
  if (maskNum !== expectedMask) return null;
  
  return { mask: maskNum, cidr };
}

function countBits(num) {
  let count = 0;
  while (num > 0) {
    count++;
    num = num >>> 1;
  }
  return count;
}

function calculate() {
  const ipInput = document.getElementById('ipAddress').value.trim();
  const maskInput = document.getElementById('subnetMask').value.trim();
  
  // Validate IP address
  if (!validateIP(ipInput)) {
    alert('Invalid IP Address');
    return;
  }
  
  // Parse subnet mask
  const maskData = parseSubnetMask(maskInput);
  if (!maskData) {
    alert('Invalid Subnet Mask. Use format like 255.255.255.0 or /24');
    return;
  }
  
  const { mask: maskNum, cidr } = maskData;
  const ipNum = ipToNum(ipInput);
  const network = ipNum & maskNum;
  const wildcard = (~maskNum >>> 0) & 0xFFFFFFFF;
  const broadcast = network | (~maskNum >>> 0);
  const firstHost = (cidr < 31) ? network + 1 : network;
  const lastHost = (cidr < 31) ? broadcast - 1 : broadcast;
  const hostCount = (cidr < 31) ? (broadcast - network - 1) : ((cidr === 31) ? 2 : 1);
  const usableHosts = (cidr < 31) ? hostCount - 2 : hostCount;
  
  // Display results
  document.getElementById('resultIP').textContent = ipInput;
  document.getElementById('resultMask').textContent = `${numToIP(maskNum)} (/${cidr})`;
  document.getElementById('resultNetwork').textContent = numToIP(network);
  document.getElementById('resultBroadcast').textContent = numToIP(broadcast);
  document.getElementById('resultFirstHost').textContent = numToIP(firstHost);
  document.getElementById('resultLastHost').textContent = numToIP(lastHost);
  document.getElementById('resultHostCount').textContent = `${hostCount} (${usableHosts} usable)`;
  document.getElementById('resultWildcard').textContent = numToIP(wildcard);
  document.getElementById('resultClass').textContent = getNetworkClass(ipInput);
  document.getElementById('resultCIDR').textContent = `/${cidr}`;
  
  // Display binary representation
  document.getElementById('binaryIP').textContent = ipToBinary(ipInput);
  document.getElementById('binaryMask').textContent = ipToBinary(numToIP(maskNum));
  document.getElementById('binaryNetwork').textContent = ipToBinary(numToIP(network));
  document.getElementById('binaryBroadcast').textContent = ipToBinary(numToIP(broadcast));
  
  // Create bit map visualization
  createBitmap(ipInput, maskNum, network, cidr);
}

function createBitmap(ip, maskNum, network, cidr) {
  const bitmapDiv = document.getElementById('bitmap');
  bitmapDiv.innerHTML = '';
  
  // Determine network, subnet, and host bits based on class and mask
  const firstOctet = parseInt(ip.split('.')[0], 10);
  let networkBits = 0;
  if (firstOctet >= 1 && firstOctet <= 126) networkBits = 8; // Class A
  else if (firstOctet >= 128 && firstOctet <= 191) networkBits = 16; // Class B
  else if (firstOctet >= 192 && firstOctet <= 223) networkBits = 24; // Class C
  
  const subnetBits = cidr - networkBits;
  const hostBits = 32 - cidr;
  
  // Create 32 bits visualization
  for (let bitIndex = 0; bitIndex < 32; bitIndex++) {
    const bit = document.createElement('div');
    bit.className = 'bit';
    
    // Determine bit type
    if (bitIndex < networkBits) {
      bit.className += ' network';
      bit.title = 'Network Bit';
    } else if (bitIndex < cidr) {
      bit.className += ' subnet';
      bit.title = 'Subnet Bit';
    } else {
      bit.className += ' host';
      bit.title = 'Host Bit';
    }
    
    // Get the actual bit value from network address
    const bitValue = (network >>> (31 - bitIndex)) & 1;
    bit.textContent = bitValue;
    
    bitmapDiv.appendChild(bit);
  }
}

// Allow Enter key to trigger calculation
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('ipAddress').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculate();
  });
  
  document.getElementById('subnetMask').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculate();
  });
  
  document.getElementById('calculateBtn').addEventListener('click', calculate);
});
