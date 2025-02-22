const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { SocksProxyAgent } = require('socks-proxy-agent');

function getDefaultHeaders(accessToken) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Origin': 'https://unich.com',
    'Referrer': 'https://unich.com/',
    'sec-ch-ua-platform': '"Windows"',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  };
}

function getRandomProxyAgent() {
  const proxiesFilePath = path.join(__dirname, '../proxies.txt');
  if (fs.existsSync(proxiesFilePath)) {
    const data = fs.readFileSync(proxiesFilePath, 'utf8');
    const lines = data.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length > 0) {
      const randomProxy = lines[Math.floor(Math.random() * lines.length)];
      return new SocksProxyAgent(randomProxy);
    }
  }
  return null;
}

async function startMining(accessToken, proxyAgent) {
  const url = 'https://api.unich.com/airdrop/user/v1/mining/start';
  if (!proxyAgent) {
    proxyAgent = getRandomProxyAgent();
  }
  const config = { headers: getDefaultHeaders(accessToken) };
  if (proxyAgent) {
    config.httpAgent = proxyAgent;
    config.httpsAgent = proxyAgent;
  }
  try {
    const response = await axios.post(url, {}, config);
    if (response.status === 201 && response.data.code === 'OK') {
      return response.data;
    } else {
      throw new Error(`Unexpected response: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
}

async function getAvailableTasks(accessToken, proxyAgent) {
  const url = 'https://api.unich.com/airdrop/user/v1/social/list-by-user';
  if (!proxyAgent) {
    proxyAgent = getRandomProxyAgent();
  }
  const config = { headers: getDefaultHeaders(accessToken) };
  if (proxyAgent) {
    config.httpAgent = proxyAgent;
    config.httpsAgent = proxyAgent;
  }
  try {
    const response = await axios.get(url, config);
    if (response.status === 200 && response.data.code === 'OK') {
      const tasks = response.data.data.items.map(task => ({
        id: task.id,
        type: task.type,
        title: task.title,
        pointReward: task.pointReward,
        claimed: task.claimed
      }));
      return tasks;
    } else {
      throw new Error(`Unexpected response: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
}

async function completeAndClaimTask(accessToken, taskId, evidence, proxyAgent) {
  const url = `https://api.unich.com/airdrop/user/v1/social/claim/${taskId}`;
  if (!proxyAgent) {
    proxyAgent = getRandomProxyAgent();
  }
  const config = { headers: getDefaultHeaders(accessToken) };
  if (proxyAgent) {
    config.httpAgent = proxyAgent;
    config.httpsAgent = proxyAgent;
  }
  try {
    const response = await axios.post(url, { evidence }, config);
    if (response.status === 201 && response.data.code === 'OK') {
      return response.data;
    } else {
      throw new Error(`Unexpected response: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  startMining,
  getAvailableTasks,
  completeAndClaimTask
};
