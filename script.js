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
  return 'Invalid';
}

function validateOctet(value) {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 0 && num <= 255;
}

function getIPFromOctets() {
  const octets = [
    document.getElementById('octet1').value,
    document.getElementById('octet2').value,
    document.getElementById('octet3').value,
    document.getElementById('octet4').value
  ];
  
  // Validate all octets are filled
  if (octets.some(o => !o || !validateOctet(o))) {
    return null;
  }
  
  return octets.join('.');
}

function calculateCIDR(mask) {
  const maskNum = ipToNum(mask);
  let cidr = 0;
  for (let i = 0; i < 32; i++) {
    if ((maskNum >>> (31 - i)) & 1) {
      cidr++;
    } else {
      break;
    }
  }
  return cidr;
}

function populateDropdown(selectId, values, currentValue) {
  const select = document.getElementById(selectId);
  select.innerHTML = values.map(val => 
    `<option value="${val}">${val}</option>`
  ).join('');
  if (currentValue !== undefined && values.includes(currentValue.toString())) {
    select.value = currentValue.toString();
  } else if (values.length > 0) {
    select.value = values[0].toString();
  }
}

function updateNetworkType() {
  const ip = getIPFromOctets();
  if (!ip) return;
  
  const networkClass = getNetworkClass(ip);
  const networkTypeSelect = document.getElementById('networkType');
  const networkRange = document.getElementById('networkRange');
  
  if (networkClass === 'A') {
    networkTypeSelect.value = 'A';
    networkRange.textContent = '1.0.0.0 - 126.255.255.255';
    updateMaskOptions('A');
  } else if (networkClass === 'B') {
    networkTypeSelect.value = 'B';
    networkRange.textContent = '128.0.0.0 - 191.255.255.255';
    updateMaskOptions('B');
  } else if (networkClass === 'C') {
    networkTypeSelect.value = 'C';
    networkRange.textContent = '192.0.0.0 - 223.255.255.255';
    updateMaskOptions('C');
  }
  
  calculate();
}

function updateMaskOptions(networkClass) {
  const maskSelect = document.getElementById('mask');
  const currentValue = maskSelect.value;
  
  // Class A masks: /8 to /30
  const classAMasks = [
    '255.0.0.0', '255.128.0.0', '255.192.0.0', '255.224.0.0', '255.240.0.0',
    '255.248.0.0', '255.252.0.0', '255.254.0.0', '255.255.0.0', '255.255.128.0',
    '255.255.192.0', '255.255.224.0', '255.255.240.0', '255.255.248.0',
    '255.255.252.0', '255.255.254.0', '255.255.255.0', '255.255.255.128',
    '255.255.255.192', '255.255.255.224', '255.255.255.240', '255.255.255.248',
    '255.255.255.252'
  ];
  
  // Class B masks: /16 to /30
  const classBMasks = [
    '255.255.0.0', '255.255.128.0', '255.255.192.0', '255.255.224.0',
    '255.255.240.0', '255.255.248.0', '255.255.252.0', '255.255.254.0',
    '255.255.255.0', '255.255.255.128', '255.255.255.192', '255.255.255.224',
    '255.255.255.240', '255.255.255.248', '255.255.255.252'
  ];
  
  // Class C masks: /24 to /30
  const classCMasks = [
    '255.255.255.0', '255.255.255.128', '255.255.255.192', '255.255.255.224',
    '255.255.255.240', '255.255.255.248', '255.255.255.252'
  ];
  
  let masks;
  if (networkClass === 'A') masks = classAMasks;
  else if (networkClass === 'B') masks = classBMasks;
  else masks = classCMasks;
  
  maskSelect.innerHTML = masks.map(mask => 
    `<option value="${mask}">${mask}</option>`
  ).join('');
  
  // Try to restore previous selection if valid
  if (masks.includes(currentValue)) {
    maskSelect.value = currentValue;
  } else {
    maskSelect.value = masks[0];
  }
  
  calculate();
}

function calculate() {
  const ip = getIPFromOctets();
  if (!ip) {
    // Clear results if IP is invalid
    document.getElementById('binary').value = '';
    document.getElementById('hosts').value = '';
    document.getElementById('subnetID').value = '';
    document.getElementById('broadcast').value = '';
    document.getElementById('route').value = '';
    document.getElementById('addressRange').value = '';
    return;
  }
  
  const mask = document.getElementById('mask').value;
  const allowOneSubnetBit = document.getElementById('allowOneSubnetBit').checked;
  const networkType = document.getElementById('networkType').value;
  
  const maskNum = ipToNum(mask);
  const cidr = calculateCIDR(mask);
  const ipNum = ipToNum(ip);
  const network = ipNum & maskNum;
  
  // Determine network bits based on class
  let networkBits = 8;
  if (networkType === 'B') networkBits = 16;
  else if (networkType === 'C') networkBits = 24;
  
  // Calculate subnet bits
  let subnetBits = Math.max(0, cidr - networkBits);
  if (allowOneSubnetBit && subnetBits === 0 && networkBits < 24) {
    subnetBits = 1;
  }
  const hostBits = 32 - cidr;
  
  // Calculate usable hosts
  const subnetSize = Math.pow(2, hostBits);
  const usableHosts = subnetSize > 2 ? subnetSize - 2 : (subnetSize === 2 ? 2 : 0);
  const firstHost = subnetSize > 2 ? network + 1 : network;
  const lastHost = subnetSize > 2 ? (network + subnetSize - 2) : (network + subnetSize - 1);
  
  // Update binary display
  document.getElementById('binary').value = ipToBinary(ip);
  
  // Update hosts (usable hosts range)
  if (usableHosts > 0) {
    document.getElementById('hosts').value = `${numToIP(firstHost)} - ${numToIP(lastHost)}`;
  } else {
    document.getElementById('hosts').value = usableHosts.toString();
  }
  
  // Update subnet ID
  document.getElementById('subnetID').value = numToIP(network);
  
  // Update broadcast
  document.getElementById('broadcast').value = numToIP(network + subnetSize - 1);
  
  // Update subnet bits dropdown
  const maxSubnetBits = networkType === 'A' ? 22 : (networkType === 'B' ? 14 : 6);
  const subnetBitsOptions = [];
  for (let i = 0; i <= maxSubnetBits; i++) {
    subnetBitsOptions.push(i);
  }
  populateDropdown('subnetBits', subnetBitsOptions, subnetBits);
  
  // Update mask bits dropdown
  const maskBitsOptions = [];
  const minMaskBits = networkBits;
  const maxMaskBits = networkType === 'A' ? 30 : (networkType === 'B' ? 30 : 30);
  for (let i = minMaskBits; i <= maxMaskBits; i++) {
    maskBitsOptions.push(i);
  }
  populateDropdown('maskBits', maskBitsOptions, cidr);
  
  // Update max subnets dropdown
  const maxSubnetsValue = Math.pow(2, subnetBits);
  const maxSubnetsOptions = [];
  for (let i = 1; i <= maxSubnetsValue; i *= 2) {
    maxSubnetsOptions.push(i);
  }
  populateDropdown('maxSubnets', maxSubnetsOptions, maxSubnetsValue);
  
  // Update max hosts dropdown
  const maxHostsValue = Math.max(0, subnetSize - 2);
  const maxHostsOptions = [];
  for (let i = 2; i <= maxHostsValue; i = i * 2 + 2) {
    maxHostsOptions.push(i);
  }
  if (maxHostsValue > 0) {
    maxHostsOptions.push(maxHostsValue);
  }
  populateDropdown('maxHosts', maxHostsOptions, maxHostsValue);
  
  // Supernets section
  const supernetMaskBits = Math.max(0, networkBits - subnetBits);
  const supernetMaskNum = 0xFFFFFFFF << (32 - supernetMaskBits) >>> 0;
  const supernetMask = numToIP(supernetMaskNum);
  
  document.getElementById('supernetMask').innerHTML = `<option value="${supernetMask}">${supernetMask}</option>`;
  document.getElementById('supernetMask').value = supernetMask;
  
  populateDropdown('supernetMaskBits', [supernetMaskBits], supernetMaskBits);
  
  const maxSupernetsValue = Math.pow(2, subnetBits);
  const maxSupernetsOptions = [];
  for (let i = 1; i <= maxSupernetsValue; i *= 2) {
    maxSupernetsOptions.push(i);
  }
  populateDropdown('maxSupernets', maxSupernetsOptions, maxSupernetsValue);
  
  const maxAddressesValue = Math.pow(2, supernetMaskBits);
  const maxAddressesOptions = [];
  for (let i = 2; i <= maxAddressesValue; i = i * 2 + 2) {
    maxAddressesOptions.push(i);
  }
  if (maxAddressesValue > 0) {
    maxAddressesOptions.push(maxAddressesValue);
  }
  populateDropdown('maxAddresses', maxAddressesOptions, maxAddressesValue);
  
  // Route
  document.getElementById('route').value = `${numToIP(network)}/${cidr}`;
  
  // Address Range
  document.getElementById('addressRange').value = `${numToIP(firstHost)} - ${numToIP(lastHost)}`;
  
  // Update bitmap
  createBitmap(ip, maskNum, network, networkBits, cidr);
  
  // Update dropdowns when they change
  document.getElementById('subnetBits').addEventListener('change', updateFromSubnetBits);
  document.getElementById('maskBits').addEventListener('change', updateFromMaskBits);
}

function updateFromSubnetBits() {
  const subnetBits = parseInt(document.getElementById('subnetBits').value, 10);
  const networkType = document.getElementById('networkType').value;
  const networkBits = networkType === 'A' ? 8 : (networkType === 'B' ? 16 : 24);
  const newMaskBits = networkBits + subnetBits;
  
  // Update mask bits
  const maskBitsSelect = document.getElementById('maskBits');
  if (maskBitsSelect.options.length > 0) {
    const maskBitsValue = Math.min(newMaskBits, parseInt(maskBitsSelect.options[maskBitsSelect.options.length - 1].value, 10));
    maskBitsSelect.value = maskBitsValue.toString();
    updateMaskFromBits(maskBitsValue);
  }
  
  calculate();
}

function updateFromMaskBits() {
  const maskBits = parseInt(document.getElementById('maskBits').value, 10);
  updateMaskFromBits(maskBits);
  calculate();
}

function updateMaskFromBits(maskBits) {
  const maskNum = 0xFFFFFFFF << (32 - maskBits) >>> 0;
  const mask = numToIP(maskNum);
  const maskSelect = document.getElementById('mask');
  
  // Check if this mask exists in the dropdown
  let found = false;
  for (let option of maskSelect.options) {
    if (option.value === mask) {
      maskSelect.value = mask;
      found = true;
      break;
    }
  }
  
  if (!found) {
    // Add it if it doesn't exist
    const option = document.createElement('option');
    option.value = mask;
    option.textContent = mask;
    maskSelect.appendChild(option);
    maskSelect.value = mask;
  }
}

function createBitmap(ip, maskNum, network, networkBits, cidr) {
  const bitmapDiv = document.getElementById('bitmap');
  bitmapDiv.innerHTML = '';
  
  const subnetBits = cidr - networkBits;
  
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // IP octet inputs
  for (let i = 1; i <= 4; i++) {
    const octetInput = document.getElementById(`octet${i}`);
    
    octetInput.addEventListener('input', (e) => {
      // Only allow numbers
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      
      // Auto-advance to next octet when 3 digits entered
      if (e.target.value.length === 3 && i < 4) {
        document.getElementById(`octet${i + 1}`).focus();
      }
      
      // Auto-calculate on change
      updateNetworkType();
    });
    
    octetInput.addEventListener('keydown', (e) => {
      // Handle backspace to go to previous octet
      if (e.key === 'Backspace' && e.target.value === '' && i > 1) {
        document.getElementById(`octet${i - 1}`).focus();
      }
      // Handle arrow keys
      if (e.key === 'ArrowLeft' && e.target.selectionStart === 0 && i > 1) {
        document.getElementById(`octet${i - 1}`).focus();
      }
      if (e.key === 'ArrowRight' && e.target.selectionStart === e.target.value.length && i < 4) {
        document.getElementById(`octet${i + 1}`).focus();
      }
    });
  }
  
  // Network type dropdown
  document.getElementById('networkType').addEventListener('change', () => {
    updateMaskOptions(document.getElementById('networkType').value);
  });
  
  // Mask dropdown
  document.getElementById('mask').addEventListener('change', calculate);
  
  // Allow 1 subnet bit checkbox
  document.getElementById('allowOneSubnetBit').addEventListener('change', calculate);
  
  // Initialize mask options based on default network type
  updateMaskOptions('A');
  
  // Initial calculation
  calculate();
});
