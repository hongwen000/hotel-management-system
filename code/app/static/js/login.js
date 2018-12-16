let username;
let login_app = new Vue({
    el: '#login',
    data: {
        username: '',
        password: ''
    },
    methods: {
        submit: function() {
            console.log(this.$data);
            $.ajax({
                method: 'GET',
                url: '/api/login',
                data: {
                    'username': this.username,
                    'password': this.password
                },
                success: function(data) {
                    if (data.error === 0) {
                        username = login_app.username;
                        window.location.href = '/query';
                    } else {
                        alert(data.msg);
                    }
                }
            });
        }
    }
})