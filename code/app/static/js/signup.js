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
                    if (res.errno !== 0) {
                        alert(res.msg);
                    } else {
                        alert(res.msg);
                    }
                }
            })
        }
    }
});