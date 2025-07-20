/// <reference path="../pb_data/types.d.ts" />

// Manual user upgrade endpoint for testing when webhooks fail
// This allows admins to manually upgrade users to Pro status

routerAdd('POST', '/admin/upgrade-user', (e) => {
  // Only allow for authenticated admin users
  const authRecord = e.requestInfo().authRecord;
  if (!authRecord || authRecord.collection().name !== '_superusers') {
    throw new ForbiddenError('Admin access required');
  }

  const info = e.requestInfo();
  const userId = info.body.user_id;
  
  if (!userId) {
    return e.json(400, {
      error: 'user_id is required',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Find the user
    const userRecord = $app.findRecordById('users', userId);
    
    // Upgrade user to pro
    userRecord.set('pro_account', true);
    $app.save(userRecord);
    
    console.log(`✅ Manually upgraded user ${userId} to Pro status`);
    $app.logger().info(`Manual user upgrade: ${userId}`, 'manual_upgrade', {
      user_id: userId,
      upgraded_by: authRecord.id
    });

    return e.json(200, {
      message: `User ${userId} upgraded to Pro successfully`,
      user: {
        id: userRecord.id,
        email: userRecord.getString('email'),
        pro_account: userRecord.getBool('pro_account')
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Failed to upgrade user ${userId}:`, error);
    return e.json(500, {
      error: `Failed to upgrade user: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Get current user status endpoint
routerAdd('GET', '/admin/user-status/:id', (e) => {
  // Only allow for authenticated admin users
  const authRecord = e.requestInfo().authRecord;
  if (!authRecord || authRecord.collection().name !== '_superusers') {
    throw new ForbiddenError('Admin access required');
  }

  const userId = e.pathValue('id');
  
  try {
    const userRecord = $app.findRecordById('users', userId);
    
    return e.json(200, {
      user: {
        id: userRecord.id,
        email: userRecord.getString('email'),
        name: userRecord.getString('name'),
        pro_account: userRecord.getBool('pro_account'),
        created: userRecord.getString('created'),
        updated: userRecord.getString('updated')
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return e.json(404, {
      error: `User not found: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// List all users with their status
routerAdd('GET', '/admin/users-status', (e) => {
  // Only allow for authenticated admin users
  const authRecord = e.requestInfo().authRecord;
  if (!authRecord || authRecord.collection().name !== '_superusers') {
    throw new ForbiddenError('Admin access required');
  }

  try {
    const users = $app.findRecordsByFilter('users', '', '-created', 100);
    
    const usersList = users.map(user => ({
      id: user.id,
      email: user.getString('email'),
      name: user.getString('name'),
      pro_account: user.getBool('pro_account'),
      created: user.getString('created')
    }));

    return e.json(200, {
      users: usersList,
      total: usersList.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return e.json(500, {
      error: `Failed to fetch users: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});