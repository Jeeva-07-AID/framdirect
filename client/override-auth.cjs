const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/SUBI/Desktop/Farm Direct/client/src/services';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace  user?.id || (MOCK_AUTH ? '0...' : null)
  // With     (MOCK_AUTH ? '0...' : user?.id)
  let updated = content.replace(
    /user\?\.id\s*\|\|\s*\(MOCK_AUTH\s*\?\s*'00000000-0000-4000-a000-000000000000'\s*:\s*null\)/g,
    "(MOCK_AUTH ? '00000000-0000-4000-a000-000000000000' : user?.id)"
  );
  
  // Handle farmerId in preOrderService
  updated = updated.replace(
    /farmerId\s*\|\|\s*\(MOCK_AUTH\s*\?\s*'00000000-0000-4000-a000-000000000000'\s*:\s*null\)/g,
    "(MOCK_AUTH ? '00000000-0000-4000-a000-000000000000' : farmerId)"
  );

  // Handle userId in orderService
  updated = updated.replace(
    /userId\s*\|\|\s*\(MOCK_AUTH\s*\?\s*'00000000-0000-4000-a000-000000000000'\s*:\s*null\)/g,
    "(MOCK_AUTH ? '00000000-0000-4000-a000-000000000000' : userId)"
  );

  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log('Updated ' + file);
  }
});
