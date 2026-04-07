const { Notification, User } = require('./models');

async function checkNotifications() {
    try {
        const notifications = await Notification.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'user', attributes: ['email', 'role'] }]
        });

        console.log('--- Recent Notifications Report ---');
        if (notifications.length === 0) {
            console.log('No notifications found.');
        } else {
            notifications.forEach(n => {
                console.log(`ID: ${n.id} | To: ${n.user?.email} (${n.user?.role}) | Msg: ${n.message} | Created: ${n.createdAt}`);
            });
        }
        process.exit(0);
    } catch (error) {
        console.error('Diagnostic failed:', error);
        process.exit(1);
    }
}

checkNotifications();
