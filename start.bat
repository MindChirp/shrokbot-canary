forever -o Output.log -e Error.log api/api.js && tail -f Output.log
forever -o Output.log -e Error.log bot.js && tail -f Output.log
