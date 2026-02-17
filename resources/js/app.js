import './bootstrap';

// to test broadcasting using back-end only
localStorage.setItem('admin_api_token', 'the api token of the admin');

console.log('Echo instance:', window.Echo);

window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('Reverb websocket connected');
});

window.Echo.private('admin.inbox')
    // .subscribed(() => {
    //     console.log('Subscribed to channel: admin.inbox');
    // })
    .listen('.ticket.created', (event) => {
        console.log('ticket.created', event);
    });
