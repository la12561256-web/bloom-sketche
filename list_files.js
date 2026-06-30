const fs = require('fs');
const path = require('path');

try {
  console.log('Direct contents of /app/applet:', fs.readdirSync('/app/applet'));
} catch (e) {
  console.error(e);
}
