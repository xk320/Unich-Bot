const inquirer = require('inquirer');
const figlet = require('figlet');
const colors = require('colors');
const clear = require('console-clear');
const fs = require('fs');
const path = require('path');
const { SocksProxyAgent } = require('socks-proxy-agent');

const { startMining, getAvailableTasks, completeAndClaimTask } = require('./scripts/apis');

// Clear the console on startup
clear();

function displayBanner() {
  figlet('UNICH', { font: 'Standard' }, (err, data) => {
    if (err) {
      console.log('Error generating banner.');
      console.error(err);
      return;
    }
    console.log(colors.green(data));
    console.log(colors.green("Script Created by Naeaex."));
    console.log(colors.green("Follow me on X - x.com/naeaexeth or Github - github.com/Naeaerc20 \n"));
    showMenu();
  });
}

// Get the proxy from proxies.txt by user ID (ID 1 uses the first proxy, ID 2 the second, etc.)
function getProxyByUserId(userId) {
  const proxiesFilePath = path.join(__dirname, 'proxies.txt');
  if (fs.existsSync(proxiesFilePath)) {
    const data = fs.readFileSync(proxiesFilePath, 'utf8');
    const lines = data.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length >= userId) {
      return lines[userId - 1];
    }
  }
  return null;
}

// Extract proxy ID from the proxy URL (e.g., between "session-" and "-sessTime")
function extractProxyID(proxyUrl) {
  const regex = /session-([^-]+)-sessTime/;
  const match = proxyUrl.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return 'Unknown';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showMenu() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'option',
        message: 'Select an option:',
        choices: [
          { name: '1. Start Mining Activation', value: 'startMining' },
          { name: '2. Auto Complete Tasks', value: 'autoComplete' },
          { name: '0. Exit', value: 'exit' }
        ]
      }
    ])
    .then(async answers => {
      switch (answers.option) {
        case 'startMining':
          await handleStartMining();
          break;
        case 'autoComplete':
          await handleAutoCompleteTasks();
          break;
        case 'exit':
          console.log(colors.yellow("Exiting..."));
          process.exit(0);
          break;
        default:
          console.log(colors.red("Invalid option!"));
          showMenu();
          break;
      }
    });
}

async function handleStartMining() {
  const usersPath = path.join(__dirname, 'users.json');
  let users;
  try {
    users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  } catch (error) {
    console.error(colors.red("Error reading users.json"));
    return;
  }

  for (const user of users) {
    const proxyUrl = getProxyByUserId(user.id);
    let proxyAgent = null;
    let proxyID = 'Unknown';
    if (proxyUrl) {
      proxyID = extractProxyID(proxyUrl);
      proxyAgent = new SocksProxyAgent(proxyUrl);
    }

    console.log(colors.cyan(`\n🔹 Performing Daily Miner Activation for Account [${user.id}]`));
    console.log(colors.cyan(`🔹 Using Bearer Token: [${user.bearer_token.substring(0, 9)}...]`));
    console.log(colors.cyan(`🔹 Sending Request with proxy ID: [${proxyID}]`));

    try {
      await startMining(user.bearer_token, proxyAgent);
      console.log(colors.green(`✅ Miner Successfully Activated for Account [${user.id}]`));
    } catch (error) {
      console.error(colors.red(`❌ Activation failed for Account [${user.id}]: ${error.message}`));
    }
  }
  
  console.log(colors.yellow("\nResting 24 Hours to activate Minners Again..."));
  setTimeout(() => {
    clear();
    // Automatically re-run mining activation after 24 hours
    handleStartMining();
  }, 86400000); // 24 hours in milliseconds
}

async function handleAutoCompleteTasks() {
  const usersPath = path.join(__dirname, 'users.json');
  let users;
  try {
    users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  } catch (error) {
    console.error(colors.red("Error reading users.json"));
    return;
  }

  for (const user of users) {
    console.log(colors.magenta(`\n🔸 Processing tasks for Account [${user.id}]`));

    const proxyUrl = getProxyByUserId(user.id);
    let proxyAgent = null;
    let proxyID = 'Unknown';
    if (proxyUrl) {
      proxyID = extractProxyID(proxyUrl);
      proxyAgent = new SocksProxyAgent(proxyUrl);
      console.log(colors.cyan(`🔹 Using Proxy ID: [${proxyID}]`));
    }

    try {
      const tasks = await getAvailableTasks(user.bearer_token, proxyAgent);
      for (const task of tasks) {
        if (!task.claimed) {
          console.log(colors.blue(`📝 Completing Task - ${task.title} - For ${task.pointReward} Points`));
          await delay(6000);
          try {
            // Use the user's username as the evidence payload
            await completeAndClaimTask(user.bearer_token, task.id, user.username, proxyAgent);
            console.log(colors.green(`✅ Task Completed: ${task.title}`));
          } catch (error) {
            console.error(colors.red(`❌ Failed to complete task ${task.title}: ${error.message}`));
          }
        } else {
          console.log(colors.yellow(`ℹ️ Task - ${task.title} is already completed & claimed.`));
        }
      }
    } catch (error) {
      console.error(colors.red(`❌ Failed to retrieve tasks for Account [${user.id}]: ${error.message}`));
    }
  }
  
  // After processing all tasks, wait for the user to press ENTER to return to the main menu
  await inquirer.prompt([
    {
      type: 'input',
      name: 'back',
      message: 'Press ENTER to back main menu...'
    }
  ]);
  clear();
  displayBanner();
}

displayBanner();
