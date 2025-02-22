# Unich-Bot
Unich-Bot是一个Node.js自动化脚本，与Unich API进行交互，以执行多个帐户的每日挖掘激活和自动完成社交任务。该脚本使用用户提供的代理来路由每个帐户的请求，以确保每个帐户使用其指定的代理。

   每日采矿激活：使用指定代理自动向每个帐户发送挖掘激活请求。处理所有帐户后，脚本"休息" 24小时，然后自动重新激活采矿节点。

   自动完成任务：检索每个帐户的可用社交任务。无人认领的任务将使用该帐户的用户名自动完成。处理后，您可以按Enter返回主菜单。每个帐户的请求通过其分配的代理进行路由。

   多代理支持：代理是在proxies.txt文件中定义的。每个帐户（来自users.json ）根据其订单分配一个代理（ID 1使用第一个代理，ID 2使用第二个代理等）。

1、安装nodejs

版本要求16以上，如果已安装可以忽略

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"
# Download and install Node.js:
nvm install 22
# Verify the Node.js version:
node -v # Should print "v22.14.0".
nvm current # Should print "v22.14.0".
# Verify npm version:
npm -v # Should print "10.9.2".

2、安装依赖，下载代码

  # 安装screen
  apt -y install screen
  # 下载脚本
  git clone https://github.com/airdropinsiders/Unich-Bot.git
  cd Unich-Bot

