new Vue({
    el: '#signup',
    data: {
        username: '',
        password: ''
    },
    methods: {
        submit: function() {
            $.ajax({
                method: 'POST',
                url: '/api/signup',
                'data': {
                    'username': this.username,
                    'password': this.password
                },
                success: function(res) {
                    if (res.error === 0) {
                        window.location.href = '/query';
                    } else if (res.error === 1){
                        alert('try another username');
                    } else if (res.error === 2) {
                        alert('busy, try again later');
                    }
                }
            })
        }
    }
});